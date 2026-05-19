import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._settings = settings
        self._users = UserRepository(session)

    async def login(self, payload: LoginRequest) -> TokenResponse:
        user = await self._users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled",
            )
        return self._build_token_response(user)

    async def register(self, payload: RegisterRequest) -> UserResponse:
        if not self._settings.allow_registration:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Registration is disabled",
            )
        if payload.role == UserRole.ADMIN and not self._settings.allow_admin_registration:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin self-registration is not allowed",
            )
        existing = await self._users.get_by_email(payload.email)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        user = await self._users.create(
            email=payload.email,
            hashed_password=hash_password(payload.password),
            role=payload.role,
        )
        return UserResponse.model_validate(user)

    async def get_user(self, user_id: uuid.UUID) -> User:
        user = await self._users.get_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def bootstrap_admin_if_needed(self) -> None:
        if not self._settings.bootstrap_admin_email or not self._settings.bootstrap_admin_password:
            return
        count = await self._users.count()
        if count > 0:
            return
        await self._users.create(
            email=self._settings.bootstrap_admin_email,
            hashed_password=hash_password(self._settings.bootstrap_admin_password),
            role=UserRole.ADMIN,
        )

    def _build_token_response(self, user: User) -> TokenResponse:
        token = create_access_token(
            subject=user.id,
            role=user.role.value,
            settings=self._settings,
        )
        return TokenResponse(
            access_token=token,
            expires_in=self._settings.jwt_access_token_expire_minutes * 60,
        )
