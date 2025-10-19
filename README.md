# Cinemas Online - 电影院在线订票系统

一个基于 Koa 和 TypeORM 的电影院在线订票 API 系统，提供智能座位分配算法和实时座位管理功能。

A cinema online booking API system built with Koa and TypeORM, featuring intelligent seat allocation algorithms and real-time seat management.

## 功能特性 | Features

### 核心功能 | Core Features

- **电影管理** | Movie Management
  - 创建和管理电影场次
  - 自定义座位布局（行数和每行座位数）
  - 查询可用座位数量

- **智能订票系统** | Intelligent Booking System
  - 自动生成唯一订票码（GIC####格式）
  - 智能座位分配算法
  - 支持用户指定起始座位
  - 座位更新和重新分配

- **座位分配策略** | Seat Allocation Strategy
  - **默认分配**：从最后排开始，优先分配中间座位，保证连续座位
  - **用户指定**：从用户选择的座位开始连续分配
  - 自动处理座位不足和跨行分配

- **实时通信** | Real-time Communication
  - WebSocket 支持（Socket.io）
  - 系统配置实时推送
  - 员工端实时数据更新

### 技术特性 | Technical Features

- RESTful API 设计
- TypeScript 强类型支持
- 依赖注入（TypeDI）
- 数据库实体自动生成
- 代码仓库自动生成
- 分布式事件处理（RabbitMQ）
- Redis 缓存支持

## 技术栈 | Tech Stack

### 后端框架 | Backend Framework
- **@gaias/basenode** - 核心框架，提供引导、REST/WebSocket 控制器、数据库集成
- **Koa** - Web 框架
- **TypeORM** - ORM 框架
- **Socket.io** - WebSocket 服务器

### 数据库与缓存 | Database & Cache
- **MySQL/MariaDB** - 关系型数据库
- **Redis** - 缓存和会话管理
- **RabbitMQ** - 消息队列

### 开发工具 | Development Tools
- **TypeScript** - 类型安全的 JavaScript
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Jest** - 单元测试框架
- **Nodemon** - 开发热重载

## 快速开始 | Quick Start

### 环境要求 | Prerequisites

- Node.js >= 14.x
- Yarn
- MySQL/MariaDB
- Redis
- RabbitMQ（可选，用于分布式事件）

### 安装 | Installation

```bash
# 克隆项目
git clone <repository-url>
cd cinemas-online

# 安装依赖
yarn install

# 生成 JWT 密钥（首次运行）
yarn generate:keys
```

### 配置 | Configuration

在 `cfg/` 目录下配置以下文件：

#### cfg/database.yml
```yaml
mariaDBUrl: mysql://username:password@localhost:3306/fotNet
output: ./src
```

#### cfg/application.yml
```yaml
appName: cinemas-online
version: 1
port: 3000
privateKeyPath: ./keys/privateKey
publicKeyPath: ./keys/publicKey
```

#### cfg/redis.yml
```yaml
host: localhost
port: 6379
password: ""  # 如果需要
```

#### cfg/rabbitmq.yml
```yaml
url: amqp://localhost
# 配置你的 RabbitMQ 连接
```

### 数据库设置 | Database Setup

1. 创建数据库：
```sql
CREATE DATABASE fotNet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 运行数据库迁移（如果有迁移文件）或让应用自动同步：
```typescript
// src/app.ts 中 synchronize: true 会自动创建表
```

3. 配置需要生成的表（编辑 `gen_db.json`）：
```json
[
  "movies",
  "bookings",
  "seats",
  "seat_selection_rules",
  "system_configs"
]
```

4. 生成实体和仓库代码：
```bash
yarn generate:database
```

### 运行 | Running

```bash
# 开发模式
yarn start:dev

# 开发模式（带调试）
yarn start:dev:debug

# 生产模式
yarn start:prod
```

服务将运行在 `http://localhost:3000`

## API 文档 | API Documentation

### 电影管理 | Movies

#### 获取所有电影
```http
GET /movies
```

#### 获取单个电影
```http
GET /movies/:id
```

#### 创建电影
```http
POST /movies
Content-Type: application/json

{
  "title": "The Matrix",
  "totalRows": 10,
  "seatsPerRow": 15,
  "sort": "A"
}
```

### 订票管理 | Bookings

#### 创建订票
```http
POST /bookings
Content-Type: application/json

{
  "movieId": "movie-id-here",
  "numTickets": 3
}
```

**响应示例 | Response:**
```json
{
  "success": true,
  "bookingId": "abc123",
  "bookingCode": "GIC0001",
  "movieId": "movie-id-here",
  "numTickets": 3,
  "seats": [
    {
      "id": "seat1",
      "bookingId": "abc123",
      "rowLetter": "J",
      "seatNumber": 7
    },
    {
      "id": "seat2",
      "bookingId": "abc123",
      "rowLetter": "J",
      "seatNumber": 8
    },
    {
      "id": "seat3",
      "bookingId": "abc123",
      "rowLetter": "J",
      "seatNumber": 9
    }
  ]
}
```

#### 查询订票
```http
# 通过 ID 查询
GET /bookings/:id

# 通过订票码查询
GET /bookings/code/:bookingCode

# 查询订票及座位信息
GET /bookings/:id/with-seats
GET /bookings/code/:bookingCode/with-seats

# 查询指定电影的所有订票
GET /bookings/movie/:movieId
```

#### 更新订票座位
```http
PUT /bookings/:id/seats
Content-Type: application/json

{
  "rowLetter": "H",
  "seatNumber": 5
}
```

#### 更新订票信息
```http
PUT /bookings/:id
Content-Type: application/json

{
  "bookingData": {
    "numTickets": 4
  },
  "updateSeats": true,
  "startingPosition": {
    "rowLetter": "G",
    "seatNumber": 8
  }
}
```

### 座位管理 | Seats

#### 获取订票的座位
```http
GET /bookings/:id/seats
```

#### 获取电影的所有座位
```http
GET /seats/movie/:movieId
```

#### 检查座位可用性
```http
POST /seats/check-availability
Content-Type: application/json

{
  "movieId": "movie-id-here",
  "rowLetter": "G",
  "seatNumber": 8,
  "numSeats": 3
}
```

### 系统配置 | System Configuration

#### 获取所有配置
```http
GET /system-configs
```

#### 获取单个配置
```http
GET /system-configs/:key
```

#### 创建/更新配置
```http
POST /system-configs
Content-Type: application/json

{
  "key": "max_tickets_per_booking",
  "value": "10"
}
```

### WebSocket 事件 | WebSocket Events

连接到员工命名空间：
```javascript
const socket = io('http://localhost:3000/employees');

// 连接时自动接收所有配置
socket.on('all', (configs) => {
  console.log('System configs:', configs);
});

// 加载配置
socket.emit('load', 'employee@example.com');
socket.on('done', (configs) => {
  console.log('Loaded configs:', configs);
});

// 错误处理
socket.on('error', (error) => {
  console.error('Error:', error);
});
```

## 座位分配算法 | Seat Allocation Algorithm

### 默认分配策略 | Default Allocation Strategy

1. **从后往前**：从影厅最后一排开始分配
2. **优先中间**：计算每排的中间位置，优先分配中间座位
3. **连续座位**：尽可能分配连续的座位
4. **最佳匹配**：在所有可能的连续座位组合中，选择最接近中间的组合

算法示例：
```
影厅布局：10排，每排15个座位
预订：3张票

第1步：从最后一排（J排）开始
第2步：计算中间位置：15 / 2 = 7-8号座位
第3步：查找包含3个连续座位的最佳位置
第4步：分配座位：J7, J8, J9（最接近中间）
```

### 用户指定分配策略 | User-Specified Allocation

1. 从用户指定的座位开始
2. 向右连续分配座位
3. 如果当前排座位不足，移动到前一排继续分配
4. 使用默认策略分配剩余座位

示例：
```
用户选择：G排5号座位
预订：4张票

结果：G5, G6, G7, G8（从选定座位开始连续分配）
```

## 开发指南 | Development Guide

### 项目结构 | Project Structure

```
cinemas-online/
├── cfg/                    # 配置文件（YAML）
│   ├── application.yml     # 应用配置
│   ├── database.yml       # 数据库配置
│   ├── redis.yml          # Redis 配置
│   ├── rabbitmq.yml       # RabbitMQ 配置
│   └── logger.yml         # 日志配置
├── src/
│   ├── app.ts             # 应用入口
│   ├── controllers/       # REST 控制器
│   ├── wsControllers/     # WebSocket 控制器
│   ├── services/          # 业务逻辑层
│   ├── repositories/      # 数据访问层
│   ├── entities/          # TypeORM 实体（自动生成）
│   ├── events/            # 事件处理器
│   ├── vo/                # 值对象（DTO）
│   │   ├── request/       # 请求 DTO
│   │   └── response/      # 响应 DTO
│   └── utils/             # 工具函数
├── tools/                 # 代码生成工具
│   ├── DBSchemaGenerator.ts    # 实体生成器
│   └── RepositoryGenerator.ts  # 仓库生成器
├── keys/                  # JWT 密钥
├── gen_db.json           # 数据库表配置
└── package.json
```

### 开发工作流 | Development Workflow

#### 1. 添加新实体
```bash
# 1. 在数据库中创建表
# 2. 将表名添加到 gen_db.json
# 3. 生成代码
yarn generate:database
```

#### 2. 创建新的 REST 控制器
```typescript
// src/controllers/ExampleController.ts
import { JsonController, Get, Post } from '@gaias/basenode';
import { Inject } from 'typedi';

@JsonController('/examples')
export class ExampleController {
  @Inject()
  private exampleService: ExampleService;

  @Get('', '*', 'app.examples.list')
  async list() {
    return this.exampleService.findAll();
  }

  @Post('', '*', 'app.examples.create')
  async create(@rest.Body() request: CreateExampleRequest) {
    return this.exampleService.create(request);
  }
}
```

#### 3. 创建服务
```typescript
// src/services/ExampleService.ts
import { Service, Inject } from 'typedi';
import { ExampleRepo } from '@footy/repositories';

@Service()
export class ExampleService {
  @Inject()
  private exampleRepo: ExampleRepo;

  async findAll() {
    return this.exampleRepo.findAll();
  }

  async create(data: any) {
    return this.exampleRepo.create(data);
  }
}
```

#### 4. 创建仓库
```typescript
// src/repositories/ExampleRepo.ts
import { Service } from 'typedi';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@gaias/basenode';
import { Example } from '@footy/entities';

@Service()
export class ExampleRepo extends BaseRepository<Example> {
  constructor(dataSource: DataSource) {
    super(dataSource, Example);
  }

  async findAll() {
    return this.repository.find();
  }
}
```

### 常用命令 | Common Commands

```bash
# 开发
yarn start:dev              # 启动开发服务器
yarn start:dev:debug        # 启动调试模式

# 代码质量
yarn lint                   # 检查代码
yarn lint:fix               # 修复代码问题

# 数据库
yarn generate:database      # 完整数据库代码生成
yarn generate:db-schema     # 仅生成实体
yarn generate:db-repo       # 仅生成仓库
yarn generate:indexes       # 生成索引文件

# 构建
yarn build:single           # 构建单文件
yarn build:run              # 构建并运行

# 工具
yarn generate:keys          # 生成 JWT 密钥
```

### 路径别名 | Path Aliases

项目使用 `@footy/*` 作为路径别名，映射到 `src/*`：

```typescript
// 好的做法
import { BookingsService } from '@footy/services';
import { Bookings } from '@footy/entities';

// 避免相对路径
import { BookingsService } from '../services/BookingsService';
```

### 代码规范 | Code Style

项目使用 ESLint 和 Prettier 进行代码格式化：

```bash
# 检查代码风格
yarn lint

# 自动修复
yarn lint:fix
```

## 测试 | Testing

```bash
# 运行所有测试
yarn test

# 运行特定测试
yarn test path/to/test.ts

# 监视模式
yarn test --watch

# 覆盖率报告
yarn test --coverage
```

## 部署 | Deployment

### 生产环境构建
```bash
# 构建项目
yarn build:single

# 生成版本号
yarn build:number

# 启动生产服务器
yarn start:prod
```

### 环境变量
```bash
NODE_ENV=production
ENABLE_API_GATEWAY=true
API_GATEWAY_HOST_PORT=192.168.52.35:80
DOMAINS=example.com,*.example.com
```

### Docker 部署（示例）
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . .
RUN yarn build:single

EXPOSE 3000

CMD ["node", "dist/single/index.js"]
```

## 常见问题 | FAQ

### 如何更改数据库？
1. 修改 `cfg/database.yml` 中的 `mariaDBUrl`
2. 重启应用

### 如何添加新的实体？
1. 在数据库中创建表
2. 将表名添加到 `gen_db.json`
3. 运行 `yarn generate:database`

### 座位分配失败怎么办？
检查以下几点：
- 电影是否存在
- 是否有足够的可用座位
- 指定的起始座位是否可用
- 查看服务器日志获取详细错误信息

### 如何自定义座位分配算法？
修改 `src/services/SeatSelectionService.ts` 中的分配逻辑：
- `allocateUsingDefaultRules()` - 默认分配策略
- `allocateFromSpecifiedPosition()` - 用户指定分配策略
- `findBestConsecutiveSequence()` - 最佳连续座位查找

## 许可证 | License

MIT License

## 作者 | Author

TonyYang

## 贡献 | Contributing

欢迎提交 Issue 和 Pull Request！

Welcome to submit Issues and Pull Requests!
