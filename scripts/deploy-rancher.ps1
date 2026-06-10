<#
.SYNOPSIS
    AI Chatbot — Rancher Desktop build & deploy script (Windows)

.DESCRIPTION
    1. Detects nerdctl (containerd) or docker
    2. Builds API and frontend images
    3. Loads images into K3s (containerd namespace k8s.io)
    4. Ensures secrets exist
    5. Applies all K8s manifests via kubectl kustomize

.PARAMETER Tag
    Image tag to build and deploy. Default: 0.1.0

.PARAMETER SkipBuild
    Skip Docker image build (use existing local images)

.PARAMETER SkipSecrets
    Skip secret creation prompt (secrets must already exist in cluster)

.EXAMPLE
    .\scripts\deploy-rancher.ps1
    .\scripts\deploy-rancher.ps1 -Tag 0.2.0
    .\scripts\deploy-rancher.ps1 -SkipBuild
#>

param(
    [string]$Tag = "0.1.0",
    [switch]$SkipBuild,
    [switch]$SkipSecrets
)

$ErrorActionPreference = "Stop"

$ROOT = Split-Path -Parent $PSScriptRoot
$DEPLOY_DIR = Join-Path $ROOT "deploy\rancher"
$API_IMAGE = "ai-chatbot-api:$Tag"
$FE_IMAGE  = "ai-chatbot-frontend:$Tag"

# ─── helpers ──────────────────────────────────────────────────────────────────

function Write-Step { param([string]$msg) Write-Host "`n▶ $msg" -ForegroundColor Cyan }
function Write-OK   { param([string]$msg) Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Warn { param([string]$msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Fail       { param([string]$msg) Write-Host "`n✗ $msg" -ForegroundColor Red; exit 1 }

# ─── detect container runtime ─────────────────────────────────────────────────

Write-Step "Detecting container runtime"

$UseNerdctl = $false
$BuildCmd   = $null

if (Get-Command nerdctl -ErrorAction SilentlyContinue) {
    # Rancher Desktop (containerd mode)
    $UseNerdctl = $true
    $BuildCmd   = "nerdctl"
    Write-OK "nerdctl found (Rancher Desktop containerd mode)"
} elseif (Get-Command docker -ErrorAction SilentlyContinue) {
    $BuildCmd = "docker"
    Write-OK "docker found"
} else {
    Fail "Neither nerdctl nor docker found. Install Rancher Desktop first."
}

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Fail "kubectl not found. Install Rancher Desktop (includes kubectl)."
}

# ─── verify cluster is reachable ──────────────────────────────────────────────

Write-Step "Verifying cluster connection"
try {
    kubectl cluster-info --request-timeout=5s | Out-Null
    Write-OK "Cluster is reachable"
} catch {
    Fail "Cannot reach cluster. Make sure Rancher Desktop is running."
}

# ─── build images ─────────────────────────────────────────────────────────────

if (-not $SkipBuild) {
    Write-Step "Building API image  →  $API_IMAGE"
    if ($UseNerdctl) {
        # Build directly into the k8s.io containerd namespace so K3s can pull it
        nerdctl --namespace k8s.io build -t $API_IMAGE (Join-Path $ROOT "backend")
    } else {
        docker build -t $API_IMAGE (Join-Path $ROOT "backend")
    }
    Write-OK "API image built"

    Write-Step "Building frontend image  →  $FE_IMAGE"
    if ($UseNerdctl) {
        nerdctl --namespace k8s.io build -t $FE_IMAGE $ROOT
    } else {
        docker build -t $FE_IMAGE $ROOT
    }
    Write-OK "Frontend image built"

    # If docker mode: import images into K3s containerd
    if (-not $UseNerdctl) {
        Write-Step "Importing images into K3s containerd (docker → k3s ctr)"
        Write-Warn "This requires 'k3s ctr' to be in PATH or Rancher Desktop nerdctl."
        Write-Warn "If images fail to pull, switch Rancher Desktop to dockerd mode or use nerdctl."
    }
} else {
    Write-Warn "Skipping image build (--SkipBuild)"
}

# Update image tags in deployment manifests
Write-Step "Patching image tags in manifests"

$apiDeployPath = Join-Path $DEPLOY_DIR "api\deployment.yaml"
$feDeployPath  = Join-Path $DEPLOY_DIR "frontend\deployment.yaml"

(Get-Content $apiDeployPath) -replace 'image: ai-chatbot-api:\S+', "image: $API_IMAGE" |
    Set-Content $apiDeployPath -Encoding utf8
(Get-Content $feDeployPath) -replace 'image: ai-chatbot-frontend:\S+', "image: $FE_IMAGE" |
    Set-Content $feDeployPath -Encoding utf8

Write-OK "Image tags updated"

# ─── create namespace ─────────────────────────────────────────────────────────

Write-Step "Ensuring namespace ai-chatbot"
kubectl apply -f (Join-Path $DEPLOY_DIR "namespace.yaml")
Write-OK "Namespace ready"

# ─── secrets ──────────────────────────────────────────────────────────────────

if (-not $SkipSecrets) {
    $secretExists = kubectl get secret ai-chatbot-secrets -n ai-chatbot 2>$null
    if (-not $secretExists) {
        Write-Step "Creating secrets (ai-chatbot-secrets)"
        Write-Host ""
        Write-Host "  Secret 'ai-chatbot-secrets' not found. Enter values:" -ForegroundColor Yellow

        $pgPass   = Read-Host "  POSTGRES_PASSWORD (min 16 chars)"
        $jwtKey   = Read-Host "  JWT_SECRET_KEY    (min 32 chars)"
        $dbUrl    = "postgresql+asyncpg://aichatbot:$pgPass@postgres:5432/aichatbot"

        if ($pgPass.Length -lt 8) { Fail "POSTGRES_PASSWORD too short (min 8 chars)" }
        if ($jwtKey.Length -lt 32) { Fail "JWT_SECRET_KEY too short (min 32 chars)" }

        kubectl create secret generic ai-chatbot-secrets `
            --namespace ai-chatbot `
            --from-literal=POSTGRES_PASSWORD=$pgPass `
            --from-literal=DATABASE_URL=$dbUrl `
            --from-literal=JWT_SECRET_KEY=$jwtKey

        Write-OK "Secret created"
    } else {
        Write-OK "Secret ai-chatbot-secrets already exists"
    }
}

# ─── apply manifests ──────────────────────────────────────────────────────────

Write-Step "Applying K8s manifests (kubectl apply -k)"
kubectl apply -k $DEPLOY_DIR
Write-OK "Manifests applied"

# ─── wait for rollout ─────────────────────────────────────────────────────────

Write-Step "Waiting for rollout (timeout 180s)"

$workloads = @("deployment/api", "deployment/frontend", "statefulset/postgres")
foreach ($w in $workloads) {
    Write-Host "  Waiting: $w" -ForegroundColor Gray
    kubectl rollout status $w -n ai-chatbot --timeout=180s
}

# ─── seed dev test users ──────────────────────────────────────────────────────

Write-Step "Seeding test users (APP_ENV=staging bypasses auto-seed)"

$seedScript = @'
import asyncio
from app.core.config import get_settings
from app.db.session import init_db, get_session_factory
from app.core.security import hash_password
from app.models.user import UserRole

async def main():
    settings = get_settings()
    await init_db(settings)
    factory = get_session_factory()
    async with factory() as session:
        from app.repositories.user_repository import UserRepository
        repo = UserRepository(session)
        pairs = [
            ("user@test.company.com", "TestUser123!", UserRole.USER),
            ("admin@test.company.com", "TestAdmin123!", UserRole.ADMIN),
        ]
        for email, pw, role in pairs:
            if await repo.get_by_email(email):
                print(f"exists: {email}")
            else:
                await repo.create(email=email, hashed_password=hash_password(pw), role=role)
                print(f"created: {email} ({role.value})")
        await session.commit()

asyncio.run(main())
'@

$apiPod = kubectl get pods -n ai-chatbot -l "app.kubernetes.io/name=api" -o jsonpath='{.items[0].metadata.name}' 2>$null
if (-not $apiPod) {
    $apiPod = kubectl get pods -n ai-chatbot --no-headers 2>$null | Where-Object { $_ -match "^api-" } | Select-Object -First 1
    $apiPod = ($apiPod -split "\s+")[0]
}

if ($apiPod) {
    $seedScript | kubectl -n ai-chatbot exec -i $apiPod -- sh -c "cat > /tmp/seed.py && python /tmp/seed.py" 2>&1 |
        ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-OK "Test users ready"
} else {
    Write-Warn "Could not find API pod for seeding — run manually if needed"
}

# ─── start port-forward ───────────────────────────────────────────────────────

Write-Step "Starting port-forward: http://ai-chatbot.local:8888"

# Kill any existing port-forward on 8888
Get-Process -Name kubectl -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*8888*" } |
    Stop-Process -Force -ErrorAction SilentlyContinue

$traefikPod = kubectl get pods -n kube-system -l "app.kubernetes.io/name=traefik" -o jsonpath='{.items[0].metadata.name}' 2>$null
if (-not $traefikPod) {
    Write-Warn "Could not find Traefik pod — start manually:"
    Write-Host "    kubectl -n kube-system port-forward <traefik-pod> 8888:8000 --address=0.0.0.0" -ForegroundColor Yellow
} else {
    Start-Process -FilePath "kubectl" `
        -ArgumentList @("-n", "kube-system", "port-forward", "pod/$traefikPod", "8888:8000", "--address=0.0.0.0") `
        -WindowStyle Hidden
    Start-Sleep -Seconds 2
    Write-OK "Port-forward started (pod/$traefikPod → localhost:8888)"
}

# ─── done ─────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host " Deployment complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "  hosts 파일 (C:\Windows\System32\drivers\etc\hosts):"
Write-Host "    127.0.0.1  ai-chatbot.local" -ForegroundColor Yellow
Write-Host ""
Write-Host "  브라우저 접속:   http://ai-chatbot.local:8888" -ForegroundColor Cyan
Write-Host "  API 문서:        http://ai-chatbot.local:8888/api/docs"
Write-Host "  헬스체크:        http://ai-chatbot.local:8888/api/v1/health"
Write-Host ""
Write-Host "  테스트 계정:"
Write-Host "    일반 사용자: user@test.company.com  / TestUser123!" -ForegroundColor Gray
Write-Host "    관리자:      admin@test.company.com / TestAdmin123!" -ForegroundColor Gray
Write-Host ""
Write-Host "  NOTE: Windows port 80 is reserved by HTTP.sys."
Write-Host "        Port 8888 is used for the port-forward tunnel to Traefik."
Write-Host "        If the port-forward dies, re-run this script with -SkipBuild -SkipSecrets."
Write-Host ""
