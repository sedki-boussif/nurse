#!/bin/bash

##############################################
# Database Backup Script
# Backs up PostgreSQL database with timestamp
##############################################

# Configuration
DB_NAME="theses_db"
DB_USER="theses_user"
BACKUP_DIR="/home/deploy/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7  # Keep backups for 7 days

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"
echo -e "${YELLOW}Backing up to: $BACKUP_FILE${NC}"

if pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE; then
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    
    # Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip $BACKUP_FILE
    echo -e "${GREEN}✓ Backup compressed: ${BACKUP_FILE}.gz${NC}"
    
    # Calculate size
    SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}Backup size: $SIZE${NC}"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

# Delete old backups
echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✓ Old backups cleaned up${NC}"

# List current backups
echo -e "\n${YELLOW}Current backups:${NC}"
ls -lh $BACKUP_DIR

echo -e "\n${GREEN}Backup completed at: $(date)${NC}"
