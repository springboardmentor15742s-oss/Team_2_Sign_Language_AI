FROM python:3.13-slim

WORKDIR /app

# System dependencies required by OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for Docker caching
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application + packaged ML models
COPY . .

ENV PYTHONUNBUFFERED=1
ENV SIGNSPEAK_MODEL_DIR=/app/models

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]