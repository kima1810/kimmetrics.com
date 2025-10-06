from .config import engine, Base
from .models import Team, Game

def init_database():
    """Initialize database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def drop_all_tables():
    """Drop all tables (use with caution!)"""
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped!")

if __name__ == "__main__":
    init_database()