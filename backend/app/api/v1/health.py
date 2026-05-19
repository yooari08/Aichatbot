from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.db.health import check_database
from app.db.session import get_engine
from app.schemas.common import HealthResponse, ReadyResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        environment=settings.app_env,
    )


@router.get("/ready", response_model=ReadyResponse)
async def ready(settings: Settings = Depends(get_settings)) -> ReadyResponse:
    postgres_ok = False
    try:
        postgres_ok = await check_database(get_engine())
    except RuntimeError:
        postgres_ok = False

    checks = {
        "api": "ok",
        "postgres": "ok" if postgres_ok else "unavailable",
        "chroma": "pending",
    }
    all_ok = postgres_ok
    return ReadyResponse(
        status="ready" if all_ok else "degraded",
        checks=checks,
    )
