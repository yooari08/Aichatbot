from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, DbSession, SettingsDep
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    session: DbSession,
    settings: SettingsDep,
) -> TokenResponse:
    return await AuthService(session, settings).login(payload)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    session: DbSession,
    settings: SettingsDep,
) -> UserResponse:
    return await AuthService(session, settings).register(payload)


@router.get("/me", response_model=UserResponse)
async def me(user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(user)
