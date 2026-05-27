"""fix sqlite timestamp defaults for document tables

Revision ID: 20260527_0004
Revises: 20260520_0003
Create Date: 2026-05-27
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260527_0004"
down_revision: Union[str, None] = "20260520_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TS = sa.text("(CURRENT_TIMESTAMP)")


def _needs_fix(connection) -> bool:
    if connection.dialect.name != "sqlite":
        return False
    rows = connection.execute(
        sa.text("SELECT sql FROM sqlite_master WHERE type='table' AND name='documents'")
    ).fetchall()
    if not rows or not rows[0][0]:
        return False
    return "now()" in rows[0][0].lower()


def upgrade() -> None:
    connection = op.get_bind()
    if not _needs_fix(connection):
        return

    op.drop_index("ix_index_jobs_created_at", table_name="index_jobs")
    op.drop_index("ix_index_jobs_status", table_name="index_jobs")
    op.drop_index("ix_index_jobs_document_id", table_name="index_jobs")
    op.drop_table("index_jobs")

    op.drop_index("ix_documents_created_at", table_name="documents")
    op.drop_index("ix_documents_category", table_name="documents")
    op.drop_index("ix_documents_status", table_name="documents")
    op.drop_table("documents")

    op.create_table(
        "documents",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=1024), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=True),
        sa.Column("owner_name", sa.String(length=128), nullable=True),
        sa.Column(
            "status",
            sa.Enum("processing", "done", "failed", name="document_status", native_enum=False),
            nullable=False,
        ),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=_TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=_TS, nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_documents_status", "documents", ["status"])
    op.create_index("ix_documents_category", "documents", ["category"])
    op.create_index("ix_documents_created_at", "documents", ["created_at"])

    op.create_table(
        "index_jobs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("document_id", sa.Uuid(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "running", "succeeded", "failed", name="index_job_status", native_enum=False),
            nullable=False,
        ),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=_TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=_TS, nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_index_jobs_document_id", "index_jobs", ["document_id"])
    op.create_index("ix_index_jobs_status", "index_jobs", ["status"])
    op.create_index("ix_index_jobs_created_at", "index_jobs", ["created_at"])


def downgrade() -> None:
    pass
