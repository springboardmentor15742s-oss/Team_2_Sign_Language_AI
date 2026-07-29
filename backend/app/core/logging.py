import logging
import sys
from pathlib import Path
from app.core.config import settings

# Ensure log directory exists
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Formatter
LOG_FORMAT = "%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
date_format = "%Y-%m-%d %H:%M:%S"

formatter = logging.Formatter(LOG_FORMAT, datefmt=date_format)

# Console Handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)

# File Handler
file_handler = logging.FileHandler(LOG_DIR / "app.log", encoding="utf-8")
file_handler.setFormatter(formatter)

# Error File Handler
error_file_handler = logging.FileHandler(LOG_DIR / "error.log", encoding="utf-8")
error_file_handler.setLevel(logging.ERROR)
error_file_handler.setFormatter(formatter)


def setup_logger(name: str) -> logging.Logger:
    """Utility function to create structured loggers."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    if not logger.handlers:
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
        logger.addHandler(error_file_handler)

    return logger


logger = setup_logger("signlearn")
request_logger = setup_logger("signlearn.request")
error_logger = setup_logger("signlearn.error")
