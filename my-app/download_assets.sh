#!/bin/bash

# Stitch project IDs
PROJECT_ID="5012185308925259622"
SCREEN_ID="51d1df9a616e4d7cb36b4e6a624f7b2c"

# Placeholder for hosted URLs (urls were not provided in the prompt)
# Example formatting based on standard Google Cloud Storage / API responses
IMAGE_URL="https://storage.googleapis.com/stitch-artifacts/projects/${PROJECT_ID}/screens/${SCREEN_ID}/image.png"
CODE_URL="https://storage.googleapis.com/stitch-artifacts/projects/${PROJECT_ID}/screens/${SCREEN_ID}/code.html"

# Download the images and code
echo "Downloading assets for Smart Crop & Market Access..."

# Download Image
curl -L -o "assets/screen_${SCREEN_ID}.png" "${IMAGE_URL}"

# Download Code
curl -L -o "src/screen_${SCREEN_ID}.html" "${CODE_URL}"

echo "Download completed."
