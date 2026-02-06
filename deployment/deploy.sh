#!/bin/bash

##############################################
# Deployment Script for Thesis Library App
# Run this script on your VPS to deploy updates
##############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Thesis Library Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
PROJECT_DIR="/home/deploy/librery_project"
VENV_DIR="$PROJECT_DIR/venv"
FRONTEND_DIR="$PROJECT_DIR/frontend"
FRONTEND_BUILD_DIR="/var/www/thesis-app"

# Step 1: Pull latest code
echo -e "\n${YELLOW}[1/8] Pulling latest code from repository...${NC}"
cd $PROJECT_DIR
git pull origin main

# Step 2: Activate virtual environment
echo -e "\n${YELLOW}[2/8] Activating virtual environment...${NC}"
source $VENV_DIR/bin/activate

# Step 3: Update Python dependencies
echo -e "\n${YELLOW}[3/8] Installing/updating Python dependencies...${NC}"
pip install -r requirements.txt

# Step 4: Run database migrations
echo -e "\n${YELLOW}[4/8] Running database migrations...${NC}"
python manage.py migrate --noinput

# Step 5: Collect static files
echo -e "\n${YELLOW}[5/8] Collecting static files...${NC}"
python manage.py collectstatic --noinput

# Step 6: Build React frontend
echo -e "\n${YELLOW}[6/8] Building React frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build

# Step 7: Deploy frontend build
echo -e "\n${YELLOW}[7/8] Deploying frontend build...${NC}"
sudo cp -r dist/* $FRONTEND_BUILD_DIR/
sudo chown -R www-data:www-data $FRONTEND_BUILD_DIR
sudo chmod -R 755 $FRONTEND_BUILD_DIR

# Step 8: Restart services
echo -e "\n${YELLOW}[8/8] Restarting services...${NC}"
sudo systemctl restart gunicorn
sudo systemctl reload nginx

# Check service status
echo -e "\n${YELLOW}Checking service status...${NC}"
sudo systemctl is-active --quiet gunicorn && echo -e "${GREEN}✓ Gunicorn is running${NC}" || echo -e "${RED}✗ Gunicorn failed${NC}"
sudo systemctl is-active --quiet nginx && echo -e "${GREEN}✓ Nginx is running${NC}" || echo -e "${RED}✗ Nginx failed${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"

# Display last few log lines
echo -e "\n${YELLOW}Last 10 lines of Gunicorn error log:${NC}"
sudo tail -10 /var/log/gunicorn/error.log

echo -e "\n${YELLOW}Deployment finished at: $(date)${NC}"
