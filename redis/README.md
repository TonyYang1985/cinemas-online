# Redis Deployment

## Deployment
To deploy the Redis service:
```bash
./dep.sh
```

## Connection Details
- Host: redis_redis
- Port: 6379
- Network: fotNet (Docker Swarm overlay network)
- Authentication: No password (development mode)

## Connection Examples

### Using redis-cli
```bash
# Connect from within Docker network
docker run --rm --network fotNet redis:latest redis-cli -h redis_redis

# Connect from host machine
redis-cli -h localhost -p 6379
```

### Using RedisClient (TypeScript)
Configure the Redis client with:
```typescript
const redisCfg = {
  host: 'redis_redis',  // Use 'localhost' if connecting from outside Docker
  port: 6379
};
```

## Important Notes
- FLUSHDB and FLUSHALL commands are disabled for safety
- Data persistence is enabled with volume: redis_data
- Development mode: ALLOW_EMPTY_PASSWORD=yes (not recommended for production)