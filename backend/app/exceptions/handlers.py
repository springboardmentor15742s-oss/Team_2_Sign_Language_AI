from datetime import datetime
from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.exceptions.exceptions import SignLearnException
from app.core.logging import error_logger


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers on FastAPI application instance."""

    @app.exception_handler(SignLearnException)
    async def signlearn_exception_handler(request: Request, exc: SignLearnException):
        error_logger.warning(f"Domain exception on {request.url.path}: {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "statusCode": exc.status_code,
                "errorType": exc.error_type,
                "message": exc.message,
                "path": str(request.url.path),
                "timestamp": datetime.utcnow().isoformat(),
                "details": exc.details,
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        error_logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "statusCode": 422,
                "errorType": "VALIDATION_ERROR",
                "message": "Input validation failed.",
                "path": str(request.url.path),
                "timestamp": datetime.utcnow().isoformat(),
                "details": exc.errors(),
            }
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        error_logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "statusCode": 500,
                "errorType": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred.",
                "path": str(request.url.path),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
