# Rancher / Kubernetes deployment

This stack replaces Docker Compose with **Rancher-managed Kubernetes** manifests.

## Components

| Workload | K8s kind | Purpose |
|----------|----------|---------|
| `postgres` | StatefulSet + PVC | Relational DB |
| `chroma` | Deployment + PVC | Vector store |
| `api` | Deployment | FastAPI application |

Namespace: `ai-chatbot`

## Prerequisites

- Rancher 2.x with a downstream cluster (RKE2, EKS, AKS, etc.)
- `kubectl` configured for the target cluster
- Container registry access for the API image
- StorageClass for PVCs (default or enterprise CSI)

## 1. Create secrets (do not commit real values)

Copy the example and set values in Rancher UI (**Cluster → Secrets**) or via CLI:

```bash
cp deploy/rancher/secret.example.yaml deploy/rancher/secret.local.yaml
# Edit secret.local.yaml — never commit secret.local.yaml
kubectl apply -f deploy/rancher/secret.local.yaml
```

Required keys in `ai-chatbot-secrets`:

- `POSTGRES_PASSWORD`
- `DATABASE_URL` — e.g. `postgresql+asyncpg://aichatbot:<password>@postgres:5432/aichatbot`
- `JWT_SECRET_KEY` — min 32 characters

## 2. Build and push API image

```bash
docker build -t <registry>/ai-chatbot-api:0.1.0 ./backend
docker push <registry>/ai-chatbot-api:0.1.0
```

Update `deploy/rancher/api/deployment.yaml` image reference.

## 3. Deploy with kubectl

```bash
kubectl apply -k deploy/rancher/
```

## 4. Deploy via Rancher UI

1. **Cluster Explorer → Workloads → Import YAML**
2. Paste contents of `deploy/rancher/kustomization.yaml` resources, or use **Apps → Install** with a Git repo path `deploy/rancher` if using Fleet/Helm later.
3. Alternatively: **Continuous Delivery (Fleet)** — point a GitRepo at this directory.

Recommended for production:

- Use Rancher **Projects/Namespaces** RBAC for `ai-chatbot`
- Store secrets in Rancher Secrets or external secret operator
- Attach **IAM roles for service accounts (IRSA)** for Bedrock (no static AWS keys)
- Configure **Ingress** + TLS at the cluster ingress controller

## 5. Verify

```bash
kubectl -n ai-chatbot get pods
kubectl -n ai-chatbot port-forward svc/api 8080:8080
curl http://localhost:8080/api/v1/health
```

## Local dev without full cluster

Run API on the host (`uvicorn`) and port-forward dependencies:

```bash
kubectl -n ai-chatbot port-forward svc/postgres 5432:5432
kubectl -n ai-chatbot port-forward svc/chroma 8000:8000
```

## Production notes

- Replace `postgres` single-replica StatefulSet with managed RDS when available.
- Run Chroma HA or managed vector DB per ops standards.
- Set `APP_ENV=production` in ConfigMap; disable `/docs` (handled in `app/main.py`).
- Add NetworkPolicies to restrict API → postgres/chroma only.
- Enable resource requests/limits (templates include starter values).
