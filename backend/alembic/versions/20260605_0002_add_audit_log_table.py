"""add audit_log table

Revision ID: 20260605_0002
Revises: 20260605_0001
Create Date: 2026-06-05
"""

import sqlalchemy as sa
from alembic import op

revision = "20260605_0002"
down_revision = "20260605_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    if "audit_log" not in existing_tables:
        op.create_table(
            "audit_log",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
            sa.Column(
                "user_id",
                sa.Uuid(as_uuid=True),
                sa.ForeignKey("users.id", ondelete="SET NULL"),
                nullable=True,
            ),
            sa.Column("user_email", sa.String(255), nullable=True),
            sa.Column("action", sa.String(16), nullable=False),
            sa.Column("resource_type", sa.String(64), nullable=True),
            sa.Column("resource_id", sa.String(255), nullable=True),
            sa.Column("detail", sa.Text, nullable=True),
            sa.Column("ip_address", sa.String(64), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
                nullable=False,
            ),
        )

    existing_indexes = {idx["name"] for idx in inspector.get_indexes("audit_log")} if "audit_log" in existing_tables else set()
    if "ix_audit_log_user_id" not in existing_indexes:
        op.create_index("ix_audit_log_user_id", "audit_log", ["user_id"])
    if "ix_audit_log_user_email" not in existing_indexes:
        op.create_index("ix_audit_log_user_email", "audit_log", ["user_email"])
    if "ix_audit_log_action" not in existing_indexes:
        op.create_index("ix_audit_log_action", "audit_log", ["action"])
    if "ix_audit_log_created_at" not in existing_indexes:
        op.create_index("ix_audit_log_created_at", "audit_log", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_audit_log_created_at", "audit_log")
    op.drop_index("ix_audit_log_action", "audit_log")
    op.drop_index("ix_audit_log_user_email", "audit_log")
    op.drop_index("ix_audit_log_user_id", "audit_log")
    op.drop_table("audit_log")
