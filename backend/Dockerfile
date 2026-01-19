# Use "bookworm" (Debian 12) which is stable. 
# "slim" alone might pull "trixie" (unstable) which caused your error.
FROM python:3.10-slim-bookworm

# Install system libraries for OpenCV
# We replaced 'libgl1-mesa-glx' with 'libgl1' and 'libglx-mesa0'
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy files with ownership set to the non-root user
COPY --chown=user . $HOME/app

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --timeout 1000

# Create the dataset folder and database file with write permissions
RUN mkdir -p dataset && chmod 777 dataset
RUN touch face_db.pkl && chmod 777 face_db.pkl

# Hugging Face Spaces expects port 7860
ENV PORT=7860
EXPOSE 7860

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]