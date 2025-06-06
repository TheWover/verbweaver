"""
Main API router
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, projects, git, editor, graph, tasks, compiler, oauth, passkey, docs, templates

api_router = APIRouter()

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """API health check endpoint."""
    return {"status": "healthy", "api_version": "v1"}

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(git.router, prefix="/git", tags=["git"])
api_router.include_router(editor.router, prefix="/editor", tags=["editor"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(compiler.router, prefix="/compiler", tags=["compiler"])
api_router.include_router(oauth.router, prefix="/oauth", tags=["oauth"])
api_router.include_router(passkey.router, prefix="/passkey", tags=["passkey"])
api_router.include_router(docs.router, prefix="/docs", tags=["documentation"])
api_router.include_router(templates.router, prefix="/projects", tags=["templates"]) 