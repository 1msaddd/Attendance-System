FROM python:3.10-slim

# Install system libraries for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Install dependencies (timeout increased for TensorFlow)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --timeout 1000

COPY . .

# Create dataset folder
RUN mkdir -p dataset && chmod 777 dataset

# Render uses the PORT environment variable
ENV PORT=5000
EXPOSE 5000

# Start command
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]