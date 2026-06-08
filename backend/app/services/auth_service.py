import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.audit_log import AuditAction
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.audit_service import log_action


class AuthService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._settings = settings
        self._session = session
        self._users = UserRepository(session)

    async def login(self, payload: LoginRequest, ip_address: str | None = None) -> TokenResponse:
        user = await self._users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.hashed_password):
            await self._log_login_failure(
                email=payload.email,
                user_id=user.id if user is not None else None,
                ip_address=ip_address,
                detail="invalid credentials",
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            await self._log_login_failure(
                email=user.email,
                user_id=user.id,
                ip_address=ip_address,
                detail="account disabled",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled",
            )
        await log_action(
            self._session,
            action=AuditAction.LOGIN,
            user_id=user.id,
            user_email=user.email,
            resource_type="session",
            ip_address=ip_address,
        )
        return self._build_token_response(user)

    async def _log_login_failure(
        self,
        *,
        email: str,
        user_id: uuid.UUID | None,
        ip_address: str | None,
        detail: str,
    ) -> None:
        await log_action(
            self._session,
            action=AuditAction.LOGIN_FAILED,
            user_id=user_id,
            user_email=email,
            resource_type="session",
            detail=detail,
            ip_address=ip_address,
        )
        await self._session.commit()

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
