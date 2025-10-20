# 资源配置说明

本文档说明针对 **小型服务器（2核4GB）** 的 Docker Compose 资源配置优化。

## 服务器配置

- **CPU**: 2 核心
- **内存**: 4GB RAM
- **目标**: 开发/测试环境或低流量生产环境

## 资源分配策略

### 总体分配概览

| 服务 | CPU 限制 | CPU 预留 | 内存限制 | 内存预留 | 说明 |
|------|----------|----------|----------|----------|------|
| **App** | 1 核 | 0.25 核 | 1GB | 256MB | Node.js 应用 |
| **MySQL** | 0.5 核 | 0.25 核 | 1GB | 256MB | 数据库 |
| **Redis** | 0.25 核 | 0.1 核 | 256MB | 64MB | 缓存服务 |
| **RabbitMQ** | 0.25 核 | 0.1 核 | 512MB | 128MB | 消息队列 |
| **总计** | **2 核** | **0.7 核** | **2.75GB** | **704MB** | - |
| **系统预留** | - | **1.3 核** | - | **~1.25GB** | Docker + OS |

### 关键优化点

#### 1. 应用服务 (App)
- **Node.js 内存限制**: 768MB (`--max-old-space-size=768`)
- **容器内存**: 1GB（留有余量防止 OOM）
- **CPU**: 最多使用 1 核，保证应用响应性能
- **适用场景**: 中小型 API 服务，日均请求 < 10万

#### 2. MySQL/MariaDB
- **InnoDB 缓冲池**: 512MB（主要内存占用）
- **最大连接数**: 200（从默认 500 降低）
- **日志文件**: 128MB
- **查询缓存**: 32MB
- **线程缓存**: 50
- **适用场景**: 数据库大小 < 10GB，并发连接 < 100

#### 3. Redis
- **最大内存**: 256MB
- **淘汰策略**: `allkeys-lru`（最近最少使用）
- **持久化**: RDB（关闭 AOF 以节省资源）
- **适用场景**: 会话存储、热点数据缓存

#### 4. RabbitMQ
- **内存水位线**: 384MB
- **容器限制**: 512MB
- **Management UI**: 启用（用于监控）
- **适用场景**: 中低流量消息队列

## 监控和调优

### 实时监控

```bash
# 查看资源使用情况
docker stats

# 查看特定服务
docker stats base-node-api base-node-mysql base-node-redis base-node-rabbitmq

# 使用 Makefile
make stats
```

### 性能基准

**正常运行状态预期值**：

| 服务 | CPU 使用率 | 内存使用 | 备注 |
|------|-----------|----------|------|
| App | 5-20% | 200-600MB | 空闲-中等负载 |
| MySQL | 5-15% | 400-800MB | 包含缓冲池 |
| Redis | 1-5% | 50-200MB | 取决于缓存数据量 |
| RabbitMQ | 2-8% | 150-400MB | 空闲-中等负载 |

**警告阈值**：
- CPU 持续 > 80%：考虑优化代码或扩容
- 内存接近限制：调整配置或升级服务器
- MySQL 连接数 > 150：考虑增加最大连接数或优化查询

### 调优建议

#### 场景 1: 应用内存不足
```yaml
# 增加应用内存限制
app:
  environment:
    - NODE_OPTIONS=--max-old-space-size=1536
  deploy:
    resources:
      limits:
        memory: 2G
```

#### 场景 2: 数据库性能瓶颈
```yaml
# 增加 MySQL 资源
mysql:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1.5G
  command:
    - --innodb-buffer-pool-size=768M
    - --max-connections=300
```

#### 场景 3: Redis 内存不足
```bash
# 修改 redis.conf
maxmemory 512mb

# 或在 docker-compose.yml 中
command: redis-server /usr/local/etc/redis/redis.conf --requirepass redis_password --maxmemory 512mb
```

## 扩容方案

### 升级到中型服务器 (4核8GB)

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '0.5'
        memory: 512M

mysql:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 2G
      reservations:
        cpus: '0.5'
        memory: 512M
  command:
    - --innodb-buffer-pool-size=1G
    - --max-connections=500

redis:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
  command: ... --maxmemory 512mb

rabbitmq:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 1G
  environment:
    - RABBITMQ_VM_MEMORY_HIGH_WATERMARK=768MB
```

### 水平扩展（多实例）

当单服务器无法满足需求时：

1. **应用层扩展**：
   ```bash
   docker-compose up -d --scale app=3
   ```
   配合 Nginx/Traefik 负载均衡

2. **数据库读写分离**：
   - 主库：写操作
   - 从库：读操作
   - 使用 ProxySQL 或 MaxScale

3. **Redis 集群**：
   - 使用 Redis Cluster 或 Sentinel
   - 支持高可用和分片

## 故障排查

### 内存溢出 (OOM)

**症状**：容器频繁重启，日志显示 "Out of memory"

**解决方案**：
```bash
# 1. 查看内存使用
docker stats

# 2. 检查应用内存泄漏
docker exec base-node-api node --expose-gc --inspect=0.0.0.0:9229 ./dist/single/index.js

# 3. 临时增加内存限制
docker update --memory 1.5G base-node-api

# 4. 永久修改 docker-compose.yml
```

### CPU 瓶颈

**症状**：响应缓慢，CPU 使用率持续 100%

**解决方案**：
```bash
# 1. 定位 CPU 占用进程
docker exec base-node-api top

# 2. 检查慢查询
docker exec base-node-mysql mysql -u root -p -e "SHOW FULL PROCESSLIST;"

# 3. 优化代码或查询
# 4. 考虑增加 CPU 限制
```

### 磁盘空间不足

**症状**：容器启动失败，日志写入错误

**解决方案**：
```bash
# 1. 清理日志
docker-compose exec app sh -c "rm -rf /fot.sg/app/logs/*.log"

# 2. 清理 Docker 镜像和容器
docker system prune -af

# 3. 清理数据库二进制日志
docker exec base-node-mysql mysql -u root -p -e "PURGE BINARY LOGS BEFORE NOW();"
```

## 成本优化建议

### 云服务器选型

**阿里云 ECS**：
- **开发/测试**: ecs.t6-c1m2.large (2核4GB, 约¥100/月)
- **生产**: ecs.c6.xlarge (4核8GB, 约¥350/月)

**腾讯云 CVM**：
- **开发/测试**: S5.MEDIUM4 (2核4GB, 约¥90/月)
- **生产**: S5.LARGE8 (4核8GB, 约¥320/月)

**AWS EC2**：
- **开发/测试**: t3.medium (2核4GB, 约$30/月)
- **生产**: t3.large (2核8GB, 约$60/月)

### 资源节省技巧

1. **开发环境共享**：多个开发者共用一台服务器
2. **定时启停**：非工作时间自动关闭
3. **按需扩容**：使用云服务商的自动伸缩
4. **使用托管服务**：RDS、ElastiCache 替代自建（适合生产环境）

## 总结

当前配置适用于：
- ✅ 开发和测试环境
- ✅ MVP 或初创项目
- ✅ 低流量生产环境（日活 < 1000）
- ✅ 内部管理系统

不适用于：
- ❌ 高并发场景（QPS > 1000）
- ❌ 大数据量（数据库 > 50GB）
- ❌ 关键业务系统（需要高可用）

**升级建议**：
- 当日均 API 请求超过 10 万时，升级到 4核8GB
- 当数据库大小超过 10GB 时，考虑使用云数据库服务
- 当需要高可用时，部署多实例 + 负载均衡

---

**相关文档**：
- [Docker 部署指南](./DOCKER.md)
- [主配置文件](./docker-compose.yml)
- [开发环境配置](./docker-compose.dev.yml)
