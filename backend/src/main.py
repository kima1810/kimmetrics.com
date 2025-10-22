from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from src.sports.nhl.routes import router as nhl_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Kimmetrics API",
    version="1.0.0",
    description="Multi-sport analytics platform API"
)

# Configure CORS - allow from environment variable or default to localhost
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include NHL routes
app.include_router(nhl_router, prefix="/api/nhl", tags=["NHL"])

@app.get("/")
async def root():
    return {"message": "Kimmetrics API is running!", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
