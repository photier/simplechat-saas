#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/root/backups/organized/postgresql
mkdir -p $BACKUP_DIR

# Backup al
docker exec root-postgres-1 pg_dump -U simplechat -d simplechat --clean --if-exists | gzip > $BACKUP_DIR/simplechat_$TIMESTAMP.sql.gz

# Son 3 versiyon dışındakileri sil
ls -t $BACKUP_DIR/simplechat_*.sql.gz | tail -n +4 | xargs -r rm -f

echo "$(date): PostgreSQL backup completed - simplechat_$TIMESTAMP.sql.gz"
