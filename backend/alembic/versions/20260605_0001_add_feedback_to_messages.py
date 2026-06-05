"""add feedback to messages

Revision ID: 20260605_0001
Revises: 20260519_0001
Create Date: 2026-06-05

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260605_0001"
down_revision: Union[str, None] = "20260527_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "messages",
        sa.Column("feedback", sa.Boolean(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("messages", "feedback")
