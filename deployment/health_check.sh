#!/bin/bash

##############################################
# Health Check Script
# Monitors application health and services
##############################################

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Application Health Check${NC}"
echo -e "${GREEN}========================================${NC}"

# Check Gunicorn
echo -e "\n${YELLOW}Checking Gunicorn...${NC}"
if systemctl is-active --quiet gunicorn; then
    echo -e "${GREEN}✓ Gunicorn is running${NC}"
    GUNICORN_PID=$(systemctl show --property MainPID gunicorn | cut -d= -f2)
    echo -e "  PID: $GUNICORN_PID"
else
    echo -e "${RED}✗ Gunicorn is not running${NC}"
fi

# Check Nginx
echo -e "\n${YELLOW}Checking Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx is not running${NC}"
fi

# Check PostgreSQL
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
fi

# Check disk space
echo -e "\n${YELLOW}Disk Usage:${NC}"
df -h / | tail -1 | awk '{print "  Used: "$3" / "$2" ("$5")"}'

# Check memory
echo -e "\n${YELLOW}Memory Usage:${NC}"
free -h | grep Mem | awk '{print "  Used: "$3" / "$2}'

# Check port 80 and 443
echo -e "\n${YELLOW}Checking ports...${NC}"
if netstat -tlnp | grep -q ':80 '; then
    echo -e "${GREEN}✓ Port 80 (HTTP) is listening${NC}"
else
    echo -e "${RED}✗ Port 80 (HTTP) is not listening${NC}"
fi

if netstat -tlnp | grep -q ':443 '; then
    echo -e "${GREEN}✓ Port 443 (HTTPS) is listening${NC}"
else
    echo -e "${RED}✗ Port 443 (HTTPS) is not listening${NC}"
fi

# Check SSL certificate expiration
echo -e "\n${YELLOW}Checking SSL certificate...${NC}"
if [ -d "/etc/letsencrypt/live" ]; then
    CERT_DIR=$(ls -t /etc/letsencrypt/live | grep -v README | head -1)
    if [ -n "$CERT_DIR" ]; then
        EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$CERT_DIR/cert.pem | cut -d= -f2)
        echo -e "${GREEN}✓ SSL certificate expires: $EXPIRY${NC}"
    fi
else
    echo -e "${YELLOW}No SSL certificate found${NC}"
fi

# Check recent errors in Gunicorn
echo -e "\n${YELLOW}Recent Gunicorn errors (last 5):${NC}"
if [ -f "/var/log/gunicorn/error.log" ]; then
    tail -5 /var/log/gunicorn/error.log | grep -i error || echo -e "${GREEN}  No recent errors${NC}"
else
    echo -e "${YELLOW}  Log file not found${NC}"
fi

# Check recent Nginx errors
echo -e "\n${YELLOW}Recent Nginx errors (last 5):${NC}"
if [ -f "/var/log/nginx/error.log" ]; then
    tail -5 /var/log/nginx/error.log | grep -i error || echo -e "${GREEN}  No recent errors${NC}"
else
    echo -e "${YELLOW}  Log file not found${NC}"
fi

# Test database connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
if sudo -u postgres psql -c "SELECT 1;" theses_db >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
fi

# Check CPU load
echo -e "\n${YELLOW}CPU Load:${NC}"
uptime | awk -F'load average:' '{print "  "$2}'

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Health check completed${NC}"
echo -e "${GREEN}========================================${NC}"
