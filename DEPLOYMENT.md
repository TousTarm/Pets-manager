# Production Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Cloudflare Tunnel configured
- Domain: kocky.rindt.space

## Setup Steps

### 1. Generate Secrets

Generate strong secrets for production:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate NOTIFICATION_API_KEY
openssl rand -hex 32
```

### 2. Configure Environment Variables

Copy `.env.production` and update with your secrets:

```bash
cp .env.production .env.production.local
```

Edit `.env.production.local`:
- Replace `GENERATE_STRONG_SECRET_HERE` with generated NEXTAUTH_SECRET
- Replace `GENERATE_STRONG_API_KEY_HERE` with generated NOTIFICATION_API_KEY
- Verify `NEXTAUTH_URL=https://kocky.rindt.space`

### 3. Build and Deploy

```bash
# Build the Docker image
docker-compose build

# Start the application
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 4. Cloudflare Tunnel Configuration

Configure Cloudflare Tunnel to point to `localhost:6001`:

```yaml
tunnel: <your-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: kocky.rindt.space
    service: http://localhost:6001
  - service: http_status:404
```

Start the tunnel:
```bash
cloudflared tunnel run <your-tunnel-name>
```

### 5. Setup Cron for Notifications

Use an external cron service (e.g., cron-job.org) to call the notification endpoint daily at 18:30:

**URL:** `https://kocky.rindt.space/api/notifications/check`  
**Method:** GET  
**Headers:** `x-api-key: <NOTIFICATION_API_KEY>`  
**Schedule:** Daily at 18:30 (Europe/Prague timezone)

## Security Checklist

- [x] HTTPS enforced (via Cloudflare)
- [x] Strong secrets generated
- [x] CSP headers configured
- [x] Security headers enabled
- [x] Database in persistent volume
- [x] Non-root user in Docker
- [x] Health checks enabled
- [x] API key protection for notification endpoint

## Monitoring

### Check Application Health
```bash
curl https://kocky.rindt.space/api/auth/session
```

### View Logs
```bash
docker-compose logs -f kocky-app
```

### Database Backup
```bash
# Backup database
docker exec kocky-app sqlite3 /app/db/prod.db ".backup '/app/db/backup.db'"

# Copy backup to host
docker cp kocky-app:/app/db/backup.db ./backup-$(date +%Y%m%d).db
```

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs kocky-app
```

### Database issues
```bash
# Reset database (WARNING: deletes all data)
docker-compose down
rm -rf ./db
docker-compose up -d
```

### Notification endpoint not working
- Verify NOTIFICATION_API_KEY matches in .env and cron service
- Check Cloudflare tunnel is running
- Test manually: `curl -H "x-api-key: YOUR_KEY" https://kocky.rindt.space/api/notifications/check`
