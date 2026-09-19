#!/bin/bash

# Stitch project IDs
PROJECT_ID="5012185308925259622"
SCREEN_1_ID="51d1df9a616e4d7cb36b4e6a624f7b2c"
SCREEN_2_ID="43ccf279d50a44d9a9f9e3f5748a9265"

# Download the images and code
echo "Downloading assets for Smart Crop & Market Access..."

# Screen 1
curl -L -o "assets/screen_${SCREEN_1_ID}.png" "https://storage.googleapis.com/stitch-artifacts/projects/${PROJECT_ID}/screens/${SCREEN_1_ID}/image.png"
curl -L -o "src/screen_${SCREEN_1_ID}.html" "https://storage.googleapis.com/stitch-artifacts/projects/${PROJECT_ID}/screens/${SCREEN_1_ID}/code.html"

# Screen 2
curl -L -o "assets/screen_${SCREEN_2_ID}.png" "https://storage.googleapis.com/stitch-artifacts/projects/${PROJECT_ID}/screens/${SCREEN_2_ID}/image.png"
curl -L -o "src/screen_${SCREEN_2_ID}.html" "https://storage.googleapis.com/stitch-artifacts/projects/${PROJECT_ID}/screens/${SCREEN_2_ID}/code.html"

echo "Download completed."
