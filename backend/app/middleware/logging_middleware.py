import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import request_logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for timing and logging all incoming HTTP requests."""
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000

        request_logger.info(
            f"[{request.method}] {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {process_time:.2f}ms"
        )
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        return response
