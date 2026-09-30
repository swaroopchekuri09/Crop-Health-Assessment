import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from database.connection import init_db_indexes
from ai.model_loader import load_model
from api.auth import router as auth_router
from api.crops import router as crops_router
from api.assessments import router as assessments_router
from api.recommendations import router as recommendations_router
from api.health import router as health_router

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database indexes and load AI model
    try:
        init_db_indexes()
        print("[Startup] MongoDB indexes verified.")
    except Exception as e:
        print(f"[Startup Warning] Could not connect to MongoDB on startup: {e}")

    try:
        load_model()
        print("[Startup] Agricultural AI model loaded.")
    except Exception as e:
        print(f"[Startup Warning] AI Model failed to load on startup: {e}")

    yield

    # Shutdown logic if any
    print("[Shutdown] Cleaning up resources.")


app = FastAPI(
    title="Crop Health Assessment & Recommendation API",
    description="Production-grade AI-assisted agricultural diagnosis and recommendation service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded crop photographs safely as static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(crops_router)
app.include_router(assessments_router)
app.include_router(recommendations_router)


@app.get("/")
def root():
    return {
        "service": "Crop Health Assessment & Recommendation API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "active"
    }


# Global exception handler for uncaught server errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. Please try again or contact system support."
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
