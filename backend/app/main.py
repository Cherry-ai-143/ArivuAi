from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.api import api_router
from app.core.config import settings
from app.database.database import engine

# Import all models so they are registered with Base.metadata
import app.models


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database tables...")

    # We are using Alembic migrations,
    # so we don't use Base.metadata.create_all()

    yield

    print("Application shutting down...")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

# ----------------------------------------------------
# CORS
# ----------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin") or "http://localhost:3000"
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

import os
from fastapi.staticfiles import StaticFiles

# ----------------------------------------------------
# Static Files Setup
# ----------------------------------------------------
os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ----------------------------------------------------
# API Routes
# ----------------------------------------------------
app.include_router(
    api_router,
    prefix="/api/v1",
)

# ----------------------------------------------------
# Root
# ----------------------------------------------------
@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
    }

# ----------------------------------------------------
# Health Check
# ----------------------------------------------------
@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "Database Connected Successfully"
        }

    except Exception as e:
        return {
            "status": "Database Connection Failed",
            "error": str(e)
        }