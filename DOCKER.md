# Docker Deployment Guide

This guide covers deploying the Base Node API using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

## Quick Start

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update the following (especially passwords in production):
- `DB_PASSWORD` - Database password
- `REDIS_PASSWORD` - Redis password
- `RABBITMQ_PASSWORD` - RabbitMQ password
- `JWT_SECRET` - JWT secret key
- `MYSQL_ROOT_PASSWORD` - MySQL root password

### 2. Start All Services

```bash
# Build and start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
```

### 3. Verify Deployment

Check health status:
```bash
# Check container status
docker-compose ps

# Check application health
curl http://localhost:3000/_healthcheck

# Expected response:
# {"healthy":true,"dbAlive":true}
```

Access services:
- **API**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672 (rabbitmq/rabbitmq_password)
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## Development Mode

Use the development override for hot-reload:

```bash
# Start with development configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or rebuild if dependencies changed
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Features in development mode:
- Hot reload with volume mounting
- Node.js debugger on port 9229
- Development environment variables
- Source code changes reflected immediately

## Common Operations

### Starting and Stopping

```bash
# Start all services
docker-compose up -d

# Stop all services (preserves data)
docker-compose stop

# Stop and remove containers (preserves data)
docker-compose down

# Stop and remove containers + volumes (deletes all data!)
docker-compose down -v
```

### Rebuilding

```bash
# Rebuild application image
docker-compose build app

# Rebuild and restart
docker-compose up -d --build app

# Force rebuild without cache
docker-compose build --no-cache app
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View specific service logs
docker-compose logs -f app
docker-compose logs -f mysql
docker-compose logs -f redis

# Execute commands in container
docker-compose exec app sh
docker-compose exec mysql mysql -u root -p
docker-compose exec redis redis-cli -a redis_password
```

### Database Operations

```bash
# Access MySQL CLI
docker-compose exec mysql mysql -u basenode -p basenode

# Run SQL script
docker-compose exec -T mysql mysql -u basenode -p basenode < backup.sql

# Backup database
docker-compose exec mysql mysqldump -u basenode -p basenode > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u basenode -p basenode < backup.sql
```

### Redis Operations

```bash
# Access Redis CLI
docker-compose exec redis redis-cli -a redis_password

# Clear all cache
docker-compose exec redis redis-cli -a redis_password FLUSHALL

# Monitor Redis commands
docker-compose exec redis redis-cli -a redis_password MONITOR
```

### Scaling

```bash
# Scale application to 3 instances
docker-compose up -d --scale app=3

# Note: You'll need a load balancer (nginx, traefik) in front
```

## Data Persistence

Data is stored in Docker volumes:
- `mysql-data` - Database files
- `redis-data` - Redis persistence
- `rabbitmq-data` - RabbitMQ data

View volumes:
```bash
docker volume ls | grep cinemas-online
```

Backup volumes:
```bash
# Backup MySQL volume
docker run --rm -v cinemas-online_mysql-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mysql-backup.tar.gz /data
```

## Health Checks

All services have health checks configured:

```bash
# Check all service health status
docker-compose ps

# Inspect specific service health
docker inspect --format='{{.State.Health.Status}}' base-node-api
```

Health check endpoints:
- **App**: `curl http://localhost:3000/_healthcheck`
- **MySQL**: Automatic via Docker health check
- **Redis**: Automatic via Docker health check
- **RabbitMQ**: Automatic via Docker health check

## Resource Management

### View Resource Usage

```bash
# Real-time resource monitoring
docker stats

# View specific services
docker stats base-node-api base-node-mysql base-node-redis
```

### Resource Limits

Configured in `docker-compose.yml`:
- **App**: 2 CPU, 2GB RAM (limit), 0.5 CPU, 512MB (reservation)
- **MySQL**: 2 CPU, 2GB RAM (limit), 0.5 CPU, 512MB (reservation)
- **Redis**: 1 CPU, 512MB RAM (limit), 0.25 CPU, 128MB (reservation)
- **RabbitMQ**: 1 CPU, 1GB RAM (limit), 0.25 CPU, 256MB (reservation)

Adjust limits in `docker-compose.yml` under `deploy.resources`.

## Troubleshooting

### Application won't start

1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify dependencies are healthy:
   ```bash
   docker-compose ps
   ```

3. Ensure environment variables are set:
   ```bash
   docker-compose config
   ```

### Database connection errors

1. Check MySQL is running:
   ```bash
   docker-compose ps mysql
   ```

2. Verify credentials in `.env`

3. Test connection:
   ```bash
   docker-compose exec mysql mysql -u basenode -p
   ```

### Out of memory errors

1. Check resource usage:
   ```bash
   docker stats
   ```

2. Increase limits in `docker-compose.yml`

3. Restart services:
   ```bash
   docker-compose restart
   ```

### Port conflicts

If ports are already in use:

1. Change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Host:Container
   ```

2. Or stop conflicting services

### Permission errors

If running on Linux and encountering permission issues:

```bash
# Fix ownership of volumes
sudo chown -R $USER:$USER ./logs

# Or run with sudo
sudo docker-compose up -d
```

## Security Best Practices

### Production Deployment

1. **Change all default passwords** in `.env`
2. **Use secrets management** (Docker secrets, vault)
3. **Enable TLS/SSL** for external access
4. **Restrict network access**:
   ```yaml
   networks:
     base-node-network:
       internal: true  # No external access
   ```
5. **Regular security updates**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Network Isolation

Only the app service exposes ports externally. Database services are only accessible within the Docker network.

### User Permissions

The application runs as non-root user (nodejs:1001) inside the container for security.

## Production Configuration

For production deployment:

1. Use production `.env`:
   ```bash
   NODE_ENV=production
   LOG_LEVEL=warn
   ```

2. Enable monitoring (Prometheus, Grafana)

3. Set up log aggregation (ELK stack, Loki)

4. Configure backups:
   ```bash
   # Add to crontab
   0 2 * * * docker-compose exec mysql mysqldump -u basenode -p > /backups/$(date +%Y%m%d).sql
   ```

5. Use reverse proxy (Nginx, Traefik) for SSL termination

6. Implement CI/CD pipeline

## Additional Resources

- [Dockerfile](./Dockerfile) - Multi-stage build configuration
- [docker-compose.yml](./docker-compose.yml) - Main orchestration file
- [docker-compose.dev.yml](./docker-compose.dev.yml) - Development overrides
- [.env.example](./.env.example) - Environment variables template
- [redis.conf](./redis.conf) - Redis configuration

## Support

For issues related to:
- **Docker configuration**: Check this guide
- **Application errors**: See main [README.md](./README.md) or [CLAUDE.md](./CLAUDE.md)
- **Security**: Review [SECURITY.md](./SECURITY.md)
