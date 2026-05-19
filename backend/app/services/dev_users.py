from app.core.config import Settings
from app.core.logging import get_logger
from app.core.security import hash_password
from app.models.user import UserRole
from app.repositories.user_repository import UserRepository

logger = get_logger(__name__)


async def seed_dev_test_users(settings: Settings, users: UserRepository) -> None:
    if settings.app_env != "development" or not settings.seed_dev_test_users:
        return

    accounts = [
        (settings.dev_test_user_email, settings.dev_test_user_password, UserRole.USER),
        (settings.dev_test_admin_email, settings.dev_test_admin_password, UserRole.ADMIN),
    ]

    for email, password, role in accounts:
        existing = await users.get_by_email(email)
        if existing is None:
            await users.create(
                email=email,
                hashed_password=hash_password(password),
                role=role,
            )
            logger.info("Seeded dev test user: %s (%s)", email, role.value)
            continue

        if existing.role != role:
            existing.role = role
        existing.hashed_password = hash_password(password)
        existing.is_active = True
        logger.info("Updated dev test user: %s (%s)", email, role.value)
