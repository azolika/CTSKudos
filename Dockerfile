FROM python:3.10-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Remove unnecessary files that might have been copied despite .dockerignore
RUN rm -rf frontend tests .agent .gemini test_*.py check_schema.py

EXPOSE 8005

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8005", "--reload"]
