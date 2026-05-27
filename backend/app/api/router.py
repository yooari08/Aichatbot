from fastapi import APIRouter

from app.api.v1 import (
    admin_documents,
    admin_monitoring,
    admin_stats,
    admin_users,
    auth,
    chat,
    conversations,
    health,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(conversations.router)
api_router.include_router(chat.router)
api_router.include_router(admin_documents.router)
api_router.include_router(admin_users.router)
api_router.include_router(admin_stats.router)
api_router.include_router(admin_monitoring.router)
