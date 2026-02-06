#!/bin/bash

##############################################
# VPS Initial Setup Script
# Run this ONCE on a fresh Ubuntu VPS
##############################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  VPS Initial Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Get configuration from user
echo -e "\n${YELLOW}Please provide the following information:${NC}"
read -p "Enter domain name (e.g., example.com): " DOMAIN
read -p "Enter database password: " DB_PASSWORD
read -p "Enter email for SSL certificate: " EMAIL

# Update system
echo -e "\n${YELLOW}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Python and dependencies
echo -e "\n${YELLOW}[2/10] Installing Python and build tools...${NC}"
apt install -y python3.11 python3.11-venv python3-pip python3.11-dev \
    build-essential libssl-dev libffi-dev libpq-dev

# Install Node.js
echo -e "\n${YELLOW}[3/10] Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx
echo -e "\n${YELLOW}[4/10] Installing Nginx...${NC}"
apt install -y nginx

# Install PostgreSQL
echo -e "\n${YELLOW}[5/10] Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Install other tools
echo -e "\n${YELLOW}[6/10] Installing additional tools...${NC}"
apt install -y git curl wget ufw certbot python3-certbot-nginx

# Setup PostgreSQL database
echo -e "\n${YELLOW}[7/10] Setting up PostgreSQL database...${NC}"
sudo -u postgres psql <<EOF
CREATE DATABASE theses_db;
CREATE USER theses_user WITH PASSWORD '$DB_PASSWORD';
ALTER ROLE theses_user SET client_encoding TO 'utf8';
ALTER ROLE theses_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE theses_user SET timezone TO 'Africa/Tunis';
GRANT ALL PRIVILEGES ON DATABASE theses_db TO theses_user;
EOF

echo -e "${GREEN}✓ Database created${NC}"

# Setup firewall
echo -e "\n${YELLOW}[8/10] Configuring firewall...${NC}"
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo -e "${GREEN}✓ Firewall configured${NC}"

# Create directory structure
echo -e "\n${YELLOW}[9/10] Creating directory structure...${NC}"
mkdir -p /var/www/thesis-app
mkdir -p /var/log/gunicorn
mkdir -p /home/deploy/backups/database

# Set permissions
chown -R www-data:www-data /var/www/thesis-app
chown -R deploy:www-data /var/log/gunicorn

# Install SSL certificate
echo -e "\n${YELLOW}[10/10] Setting up SSL certificate...${NC}"
echo -e "${YELLOW}Make sure your domain $DOMAIN points to this server's IP!${NC}"
read -p "Press Enter to continue with SSL setup or Ctrl+C to cancel..."

certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  VPS Setup Completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Clone your repository to /home/deploy/"
echo -e "2. Create .env file with configuration"
echo -e "3. Setup Python virtual environment"
echo -e "4. Configure Nginx site"
echo -e "5. Setup Gunicorn systemd service"
echo -e "\nRefer to VPS_DEPLOYMENT_GUIDE.md for detailed instructions."
