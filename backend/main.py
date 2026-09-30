import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()

from database.connection import init_db_indexes
from ai.model_loader import load_model

from api.auth import router as auth_router
from api.crops import router as crops_router
from api.assessments import router as assessments_router
from api.recommendations import router as recommendations_router
from api.health import router as health_router


# ============================================================
# Upload directory
# ============================================================

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================================
# Application lifespan
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    # Initialize MongoDB indexes
    try:
        init_db_indexes()
        print("[Startup] MongoDB indexes verified.")

    except Exception as e:
        print(f"[Startup Warning] Could not connect to MongoDB on startup: {e}")

    # Load AI model
    try:
        load_model()
        print("[Startup] Agricultural AI model loaded.")

    except Exception as e:
        print(
            f"[Startup Warning] AI Model failed to load on startup: {e}"
        )

    yield

    print("[Shutdown] Cleaning up resources.")


# ============================================================
# FastAPI application
# ============================================================

app = FastAPI(
    title="Crop Health Assessment & Recommendation API",
    description=(
        "Production-grade AI-assisted agricultural "
        "diagnosis and recommendation service"
    ),
    version="1.0.0",
    lifespan=lifespan
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

origins = [
    # Deployed frontend
    "https://crop-health-assessment-hbji-owxotu9nb.vercel.app",

    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Static uploaded files
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)


# ============================================================
# API Routers
# ============================================================

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(crops_router)
app.include_router(assessments_router)
app.include_router(recommendations_router)


# ============================================================
# Root endpoint
# ============================================================

@app.get("/")
def root():
    return {
        "service": "Crop Health Assessment & Recommendation API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "active"
    }


# ============================================================
# Global exception handler
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": (
                "An internal server error occurred. "
                "Please try again or contact system support."
            )
        }
    )


# ============================================================
# Run locally
# ============================================================

if __name__ == "__main__":

    import uvicorn

    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port
    )