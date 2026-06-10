# Rancher Desktop — 로컬 설치 및 배포 가이드

AI Chatbot을 **Rancher Desktop**(Windows) 위에서 실행하는 전체 절차입니다.

---

## 1. Rancher Desktop 설치

### 1-1. 다운로드 및 설치

```powershell
# winget으로 설치 (권장)
winget install -e --id SUSE.RancherDesktop

# 또는 공식 사이트에서 직접 다운로드
# https://rancherdesktop.io
```

### 1-2. 초기 설정

설치 후 Rancher Desktop을 실행하고 다음을 설정합니다.

| 항목 | 권장값 |
| --- | --- |
| Container Runtime | **dockerd (moby)** — 기존 Docker CLI와 호환 |
| Kubernetes version | v1.29 이상 |
| Memory | 4 GB 이상 |
| CPU | 2 코어 이상 |

> **containerd 모드**를 선택할 경우 `docker` 대신 `nerdctl`을 사용합니다.  
> 배포 스크립트(`deploy-rancher.ps1`)는 두 모드를 자동 감지합니다.

### 1-3. PATH 확인

새 PowerShell 창을 열고 확인합니다.

```powershell
kubectl version --client
docker version      # dockerd 모드
# 또는
nerdctl version     # containerd 모드
```

---

## 2. 프로젝트 구조

```text
AI-Chatbot/
├── Dockerfile              # 프론트엔드 (React/Vite → nginx)
├── nginx.conf              # nginx SPA 설정
├── backend/
│   └── Dockerfile          # 백엔드 (FastAPI)
└── deploy/rancher/
    ├── namespace.yaml
    ├── configmap-api.yaml
    ├── secret.example.yaml
    ├── ingress.yaml         # 단일 Ingress — / → frontend, /api → backend
    ├── api/
    ├── frontend/
    ├── postgres/
    └── chroma/
```

---

## 3. 한 번에 배포 (자동 스크립트)

```powershell
# 프로젝트 루트에서 실행
.\scripts\deploy-rancher.ps1
```

스크립트가 자동으로 처리하는 것:

- 컨테이너 런타임 감지 (nerdctl / docker)
- API + 프론트엔드 Docker 이미지 빌드
- K8s 시크릿 생성 (최초 1회, 대화형 입력)
- `kubectl apply -k deploy/rancher/` 실행
- Rollout 완료 대기

```powershell
# 이미 빌드된 이미지를 재사용하려면
.\scripts\deploy-rancher.ps1 -SkipBuild

# 이미지 태그 지정
.\scripts\deploy-rancher.ps1 -Tag 0.2.0
```

---

## 4. 수동 배포 (단계별)

### 4-1. 이미지 빌드

```powershell
# containerd 모드 (nerdctl) — K3s가 직접 사용 가능
nerdctl --namespace k8s.io build -t ai-chatbot-api:0.1.0 ./backend
nerdctl --namespace k8s.io build -t ai-chatbot-frontend:0.1.0 .

# docker 모드
docker build -t ai-chatbot-api:0.1.0 ./backend
docker build -t ai-chatbot-frontend:0.1.0 .
```

### 4-2. 네임스페이스 생성

```powershell
kubectl apply -f deploy/rancher/namespace.yaml
```

### 4-3. 시크릿 생성

```powershell
# 방법 A: kubectl 직접 (권장)
kubectl create secret generic ai-chatbot-secrets `
  --namespace ai-chatbot `
  --from-literal=POSTGRES_PASSWORD="<strong-password-16chars>" `
  --from-literal=DATABASE_URL="postgresql+asyncpg://aichatbot:<password>@postgres:5432/aichatbot" `
  --from-literal=JWT_SECRET_KEY="<random-32-chars-minimum>"

# 방법 B: 파일로 관리 (절대 커밋 금지)
cp deploy/rancher/secret.example.yaml deploy/rancher/secret.local.yaml
# secret.local.yaml 값 편집 후
kubectl apply -f deploy/rancher/secret.local.yaml
```

### 4-4. 전체 배포

```powershell
kubectl apply -k deploy/rancher/
```

### 4-5. 상태 확인

```powershell
kubectl -n ai-chatbot get pods
kubectl -n ai-chatbot get ingress
```

---

## 5. 로컬 접속 설정

### hosts 파일 등록

**관리자 권한** PowerShell에서 실행합니다.

```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "127.0.0.1  ai-chatbot.local"
```

### Traefik port-forward 시작

> **왜 port-forward가 필요한가?**  
> Rancher Desktop의 QEMU VM (`192.168.127.2`)은 Windows 호스트에서 직접 라우팅되지 않습니다.  
> 또한 Windows HTTP.sys가 포트 80을 점유하므로, **포트 8888**을 통해 Traefik에 터널링합니다.

```powershell
# Traefik pod 이름을 동적으로 조회하여 port-forward
$pod = kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik -o jsonpath='{.items[0].metadata.name}'
kubectl -n kube-system port-forward pod/$pod 8888:8000 --address=0.0.0.0
```

> `deploy-rancher.ps1` 스크립트는 이 port-forward를 자동으로 시작합니다.  
> port-forward가 종료된 경우 위 명령을 다시 실행하거나 `-SkipBuild -SkipSecrets` 플래그로 스크립트를 재실행하세요.

### 브라우저 접속

| 주소 | 설명 |
| --- | --- |
| `http://ai-chatbot.local:8888` | 프론트엔드 |
| `http://ai-chatbot.local:8888/api/v1/health` | 백엔드 health |
| `http://ai-chatbot.local:8888/api/docs` | Swagger UI (staging 환경) |

### 테스트 계정

| 역할 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 일반 사용자 | `user@test.company.com` | `TestUser123!` |
| 관리자 | `admin@test.company.com` | `TestAdmin123!` |

> `APP_ENV=staging`에서는 자동 시드가 실행되지 않습니다.  
> `deploy-rancher.ps1` 스크립트가 배포 후 자동으로 테스트 계정을 생성합니다.

---

## 6. 리소스 구성

| 워크로드 | Kind | 이미지 |
| --- | --- | --- |
| `api` | Deployment (2 replicas) | `ai-chatbot-api:0.1.0` |
| `frontend` | Deployment (1 replica) | `ai-chatbot-frontend:0.1.0` |
| `postgres` | StatefulSet + 10Gi PVC | `postgres:16-alpine` |
| `chroma` | Deployment + PVC | `chromadb/chroma` |

Ingress (`ai-chatbot.local`) 라우팅:

```text
/api  →  svc/api:8080
/     →  svc/frontend:80
```

---

## 7. 이미지 업데이트 (재배포)

```powershell
# 새 이미지 빌드 후 Deployment 재시작
.\scripts\deploy-rancher.ps1 -Tag 0.2.0

# 또는 이미지를 교체하고 rollout restart
kubectl -n ai-chatbot set image deployment/api api=ai-chatbot-api:0.2.0
kubectl -n ai-chatbot set image deployment/frontend frontend=ai-chatbot-frontend:0.2.0
kubectl -n ai-chatbot rollout restart deployment/api deployment/frontend
```

---

## 8. 로그 & 디버깅

```powershell
# 실시간 로그
kubectl -n ai-chatbot logs -f deployment/api
kubectl -n ai-chatbot logs -f deployment/frontend

# Pod 상태 상세 보기
kubectl -n ai-chatbot describe pod -l app.kubernetes.io/name=api

# DB 연결 테스트
kubectl -n ai-chatbot exec -it statefulset/postgres -- psql -U aichatbot -c '\l'
```

---

## 9. 삭제

```powershell
# 전체 네임스페이스 삭제 (PVC 포함)
kubectl delete namespace ai-chatbot

# 이미지만 삭제
nerdctl --namespace k8s.io rmi ai-chatbot-api:0.1.0 ai-chatbot-frontend:0.1.0
# 또는
docker rmi ai-chatbot-api:0.1.0 ai-chatbot-frontend:0.1.0
```

---

## 10. 프로덕션 전환 시 체크리스트

- [ ] `configmap-api.yaml` → `APP_ENV: production` (Swagger UI 자동 비활성화)
- [ ] `CORS_ORIGINS`를 실제 도메인으로 변경
- [ ] 시크릿을 Rancher UI → Secrets 또는 External Secrets Operator로 관리
- [ ] `ingress.yaml` → 실제 도메인 + TLS 인증서 추가
- [ ] `api/deployment.yaml` → IRSA ServiceAccount 활성화 (AWS Bedrock IAM Role)
- [ ] Postgres → 관리형 RDS로 교체
- [ ] `BEDROCK_MOCK_ENABLED: "false"` 확인
