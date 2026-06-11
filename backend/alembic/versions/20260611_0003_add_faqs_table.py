"""add faqs table

Revision ID: 20260611_0003
Revises: 20260605_0002
Create Date: 2026-06-11
"""

import sqlalchemy as sa
from alembic import op

revision = "20260611_0003"
down_revision = "20260605_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    if "faqs" not in existing_tables:
        op.create_table(
            "faqs",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
            sa.Column("question", sa.Text, nullable=False),
            sa.Column("answer", sa.Text, nullable=False),
            sa.Column("category", sa.String(64), nullable=True),
            sa.Column("display_order", sa.Integer, nullable=False, server_default="0"),
            sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
                nullable=False,
            ),
        )

    existing_indexes = (
        {idx["name"] for idx in inspector.get_indexes("faqs")}
        if "faqs" in existing_tables
        else set()
    )
    if "ix_faqs_category" not in existing_indexes:
        op.create_index("ix_faqs_category", "faqs", ["category"])


def downgrade() -> None:
    op.drop_index("ix_faqs_category", "faqs")
    op.drop_table("faqs")
