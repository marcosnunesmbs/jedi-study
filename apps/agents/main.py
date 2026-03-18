from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import path_generator, content_gen, task_analyzer, project_analyzer

app = FastAPI(title="Jedi Study Agent Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.api_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(path_generator.router, prefix="/agents/path-generator", tags=["PathGenerator"])
app.include_router(content_gen.router, prefix="/agents/content-gen", tags=["ContentGen"])
app.include_router(task_analyzer.router, prefix="/agents/task-analyzer", tags=["TaskAnalyzer"])
app.include_router(project_analyzer.router, prefix="/agents/project-analyzer", tags=["ProjectAnalyzer"])


@app.get("/health")
async def health():
    return {"status": "ok"}
