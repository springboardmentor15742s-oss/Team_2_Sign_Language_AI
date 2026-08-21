"""add sign assessment attempts table

Revision ID: a8d29b01c3f2
Revises: 7a4d9e2c1f11
"""
from alembic import op
import sqlalchemy as sa

revision = "a8d29b01c3f2"
down_revision = "7a4d9e2c1f11"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "sign_assessment_attempts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("lesson_id", sa.Integer(), nullable=True),
        sa.Column("expected_sign", sa.String(length=50), nullable=False),
        sa.Column("predicted_sign", sa.String(length=50), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("is_correct", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("landmarks_data", sa.JSON(), nullable=True),
        sa.Column("model_version", sa.String(length=50), nullable=False, server_default="v1.0.0-rf"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_sign_assessment_attempts_id"), "sign_assessment_attempts", ["id"], unique=False)
    op.create_index(op.f("ix_sign_assessment_attempts_user_id"), "sign_assessment_attempts", ["user_id"], unique=False)
    op.create_index(op.f("ix_sign_assessment_attempts_lesson_id"), "sign_assessment_attempts", ["lesson_id"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_sign_assessment_attempts_lesson_id"), table_name="sign_assessment_attempts")
    op.drop_index(op.f("ix_sign_assessment_attempts_user_id"), table_name="sign_assessment_attempts")
    op.drop_index(op.f("ix_sign_assessment_attempts_id"), table_name="sign_assessment_attempts")
    op.drop_table("sign_assessment_attempts")
