from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import meetings, transcripts, action_items, topics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Notes Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings.router, prefix="/api/meetings", tags=["meetings"])
app.include_router(transcripts.router, prefix="/api", tags=["transcripts"])
app.include_router(action_items.router, prefix="/api", tags=["action-items"])
app.include_router(topics.router, prefix="/api", tags=["topics"])

@app.get("/")
def root():
    return {"message": "Meeting Notes Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
