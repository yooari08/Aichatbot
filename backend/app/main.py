from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger as get_app_logger

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging, get_logger
from app.db.bootstrap import create_tables
from app.db.session import close_db, init_db
from app.schemas.common import ErrorResponse
from app.services.auth_service import AuthService

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    configure_logging(settings)
    logger.info("Starting %s (%s)", settings.app_name, settings.app_env)
    await init_db(settings)
    await create_tables(settings)
    from app.db.session import get_session_factory

    async with get_session_factory()() as session:
        auth_service = AuthService(session, settings)
        await auth_service.bootstrap_admin_if_needed()
        from app.repositories.user_repository import UserRepository
        from app.services.dev_users import seed_dev_test_users

        await seed_dev_test_users(settings, UserRepository(session))
        await session.commit()
    yield
    await close_db()
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(detail=str(exc.detail)).model_dump(),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=ErrorResponse(
                detail="Validation error",
                code="validation_error",
                errors=exc.errors(),
            ).model_dump(),
        )

    if not settings.is_production:

        @app.exception_handler(Exception)
        async def unhandled_exception_handler(
            request: Request, exc: Exception
        ) -> JSONResponse:
            get_app_logger(__name__).exception("Unhandled error on %s", request.url.path)
            return JSONResponse(
                status_code=500,
                content=ErrorResponse(
                    detail="Internal server error",
                    code="internal_error",
                ).model_dump(),
            )

    return app


app = create_app()
