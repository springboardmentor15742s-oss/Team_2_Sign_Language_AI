from typing import Any, Dict, Optional


class SignLearnException(Exception):
    """Base exception class for SignLearn platform."""
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_type: str = "INTERNAL_SERVER_ERROR",
        details: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_type = error_type
        self.details = details
        super().__init__(message)


class NotFoundException(SignLearnException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            message=f"{resource} with identifier '{identifier}' was not found.",
            status_code=404,
            error_type="NOT_FOUND"
        )


class UnauthorizedException(SignLearnException):
    def __init__(self, message: str = "Authentication credentials were invalid or missing."):
        super().__init__(
            message=message,
            status_code=401,
            error_type="UNAUTHORIZED"
        )


class ForbiddenException(SignLearnException):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(
            message=message,
            status_code=403,
            error_type="FORBIDDEN"
        )


class ValidationException(SignLearnException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=422,
            error_type="VALIDATION_ERROR",
            details=details
        )
