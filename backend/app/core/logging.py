import logging
import sys
from typing import Any

from app.core.config import Settings


def configure_logging(settings: Settings) -> None:
    root = logging.getLogger()
    if root.handlers:
        return

    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        stream=sys.stdout,
    )

    logging.getLogger("uvicorn.access").setLevel(logging.INFO if settings.is_production else logging.DEBUG)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def log_context(**fields: Any) -> dict[str, Any]:
    """Structured log fields (JSON logger can be added later)."""
    return {k: v for k, v in fields.items() if v is not None}
