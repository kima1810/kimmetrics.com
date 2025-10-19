"""Add team history table

Revision ID: add_team_history
Create Date: 2023-10-13 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from datetime import date

# revision identifiers, used by Alembic.
revision = 'add_team_history'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create team_history table
    op.create_table(
        'team_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('franchise_id', sa.Integer(), nullable=False),
        sa.Column('abbrev', sa.String(length=5), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('division', sa.String(length=50), nullable=True),
        sa.Column('conference', sa.String(length=50), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_team_history_franchise_id', 'team_history', ['franchise_id'])
    op.create_index('ix_team_history_abbrev', 'team_history', ['abbrev'])
    
    # Insert initial Coyotes/Mammoth data
    op.execute("""
    INSERT INTO team_history (franchise_id, abbrev, name, start_date, end_date, division, conference)
    SELECT 
        franchise_id,
        'ARI',
        'Arizona Coyotes',
        '1996-10-01',  -- When they became the Coyotes
        '2023-12-31',  -- Last day as the Coyotes
        division,
        conference
    FROM teams 
    WHERE abbrev = 'ARI'
    """)
    
    op.execute("""
    INSERT INTO team_history (franchise_id, abbrev, name, start_date, division, conference)
    SELECT 
        franchise_id,
        'UTH',
        'Utah Mammoth',
        '2024-01-01',  -- First day as the Mammoth
        division,
        conference
    FROM teams 
    WHERE abbrev = 'ARI'
    """)

def downgrade():
    op.drop_table('team_history')