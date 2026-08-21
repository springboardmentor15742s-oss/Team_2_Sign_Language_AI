"""add learner profile fields

Revision ID: 7a4d9e2c1f11
Revises: 6f3c1b9a2e10
"""
from alembic import op
import sqlalchemy as sa

revision = "7a4d9e2c1f11"
down_revision = "6f3c1b9a2e10"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("users", sa.Column("location", sa.String(length=150), nullable=True))
    op.add_column("users", sa.Column("preferred_language", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("learning_level", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("learning_goals", sa.JSON(), nullable=True))


def downgrade():
    op.drop_column("users", "learning_goals")
    op.drop_column("users", "learning_level")
    op.drop_column("users", "preferred_language")
    op.drop_column("users", "location")
