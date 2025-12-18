# -----------------------------------------------------
# Stage 1: Build dependencies (compile wheels)
# -----------------------------------------------------
FROM python:3.10-slim AS builder

WORKDIR /app

# Install build dependencies for heavy libs
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libffi-dev \
    libssl-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip wheel --no-cache-dir --no-deps -r requirements.txt -w /wheels


# -----------------------------------------------------
# Stage 2: Final runtime image (lightweight)
# -----------------------------------------------------
FROM python:3.10-slim

WORKDIR /app

# Install only runtime deps
RUN apt-get update && apt-get install -y \
    libffi8 \
    libssl3 \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*


# Copy application
COPY . /app

ENV STREAMLIT_SERVER_PORT=9000
ENV STREAMLIT_SERVER_ENABLECORS=false

ENV STREAMLIT_SERVER_HEADLESS=true

EXPOSE 9000

CMD ["streamlit", "run", "app.py", "--server.port=9000", "--server.address=0.0.0.0"]
