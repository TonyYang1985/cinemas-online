# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a cinema online booking API built with Koa, TypeORM, and TypeScript. It's based on the `@gaias/basenode` framework which provides the bootstrap infrastructure for RESTful APIs, WebSocket controllers, and distributed event handling.

## Common Development Commands

### Development
```bash
yarn start:dev              # Start in development mode with nodemon
yarn start:dev:debug        # Start in development mode with Node inspector
yarn start:prod             # Start in production mode with API gateway
```

### Building
```bash
yarn build:single           # Build single file with ncc
yarn build:run              # Build and run in development mode
```

### Testing & Linting
```bash
yarn lint                   # Run TypeScript type checking and ESLint
yarn lint:fix               # Auto-fix ESLint issues
yarn test                   # Run Jest tests (if test scripts are added)
yarn test --watch           # Run tests in watch mode
yarn test path/to/test.ts   # Run specific test file
```

### Security & Dependencies
```bash
yarn security               # Run yarn audit for security vulnerabilities
yarn security:summary       # Show security audit summary
yarn security:json          # Output audit results as JSON
yarn deps:check             # Check for available dependency updates
yarn deps:update            # Update dependencies to latest versions
```

### Database Code Generation
```bash
yarn generate:database      # Full database regeneration (schema + repos + indexes + lint)
yarn generate:db-schema     # Generate TypeORM entities from database tables
yarn generate:db-repo       # Generate repository classes from entities
yarn generate:indexes       # Generate index files
```

The `generate:db-schema` command reads table names from `gen_db.json` and generates TypeORM entities in `src/entities/` using typeorm-model-generator. Only tables listed in `gen_db.json` will be generated.

### Key Generation
```bash
yarn generate:keys          # Generate RSA public/private key pair for JWT
```

## Architecture

### Framework Stack
- **@gaias/basenode**: Core framework providing bootstrap, REST/WS controller setup, TypeORM integration, Redis, RabbitMQ, logging, and API registration
- **Koa**: Web framework for REST APIs
- **Socket.io**: WebSocket server via socket-controllers
- **TypeORM**: ORM with MySQL/MariaDB
- **TypeDI**: Dependency injection container
- **routing-controllers**: Decorator-based REST controllers
- **socket-controllers**: Decorator-based WebSocket controllers

### Project Structure
```
src/
├── app.ts                  # Application entry point - bootstraps the framework
├── controllers/            # REST API controllers (@JsonController)
├── wsControllers/          # WebSocket controllers (namespace-based)
├── services/               # Business logic layer
├── repositories/           # Data access layer (extends BaseRepository)
├── entities/               # TypeORM entities (generated from database)
├── events/                 # Distributed event handlers (RabbitMQ)
├── vo/                     # Value objects (request/response DTOs)
│   ├── request/
│   └── response/
└── utils/                  # Utility functions

cfg/                        # YAML configuration files
├── application.yml         # App name, version, port, key paths
├── database.yml           # Database connection settings
├── redis.yml              # Redis configuration
├── rabbitmq.yml           # RabbitMQ/message queue config
└── logger.yml             # Logging configuration

tools/                      # Code generation scripts
├── DBSchemaGenerator.ts    # Generate entities from database
└── RepositoryGenerator.ts  # Generate repository classes
```

### Bootstrap Process
The `src/app.ts` file uses `@gaias/basenode`'s `bootstrap()` function which:
1. Initializes transactional context using `typeorm-transactional` with CLS_HOOKED storage driver
2. Loads configuration from `cfg/*.yml` files
3. Initializes TypeORM with entities and connects to database (with `synchronize: true` for auto-schema sync)
4. Sets up Redis client
5. Initializes RabbitMQ for distributed events
6. Registers REST controllers with Koa (including ApiRegisterController and HealthCheckController)
7. Registers WebSocket controllers with Socket.io
8. Registers event handlers for distributed events
9. Starts the HTTP server on configured port

**Important**: The transactional context must be initialized before bootstrap using `initializeTransactionalContext()` to enable transaction decorators like `@Transactional()`.

### REST Controllers
- Use `@JsonController()` decorator from routing-controllers
- Define routes with `@Get()`, `@Post()`, `@Put()`, `@Delete()` decorators
- Third parameter in route decorators is the API registration key (e.g., `'cinemas-online.bookings.create'`)
- Inject services using `@Inject()` from typedi
- Controllers are automatically registered in bootstrap

Example pattern:
```typescript
@JsonController('/bookings')
export class BookingsController {
  @Inject()
  private bookingsService: BookingsService;

  @Post('', '*', 'cinemas-online.bookings.create')
  async createBooking(@rest.Body() request: CreateBookingRequest) {
    return this.bookingsService.createBooking(request);
  }
}
```

### WebSocket Controllers
- Implement `getNamespace()` to define Socket.io namespace
- Implement `handleConnection()` for connection events
- Implement `disconnect()` for disconnection events
- Implement `registerEvents()` to register socket event listeners
- Use `@Service()` decorator for dependency injection

### Services Layer
- Decorated with `@Service()` from typedi
- Contain business logic and orchestrate repository calls
- Services are singleton by default in TypeDI
- Use `@Inject()` to inject repositories and other services
- Can use `@Transactional()` decorator from `typeorm-transactional` for automatic transaction management

Example with transaction:
```typescript
@Service()
export class BookingsService {
  @Inject()
  private bookingsRepo: BookingsRepo;

  @Transactional()
  async createBookingWithSeats(request: CreateBookingRequest) {
    const booking = await this.bookingsRepo.create(request);
    await this.seatsRepo.createMultiple(booking.id, request.seats);
    return booking;
  }
}
```

### Repositories
- Extend `BaseRepository<Entity>` from `@gaias/basenode`
- Provide data access methods for entities
- Decorated with `@Service()` for dependency injection
- Inject `DataSource` in constructor to initialize base repository

Example pattern:
```typescript
@Service()
export class BookingsRepo extends BaseRepository<Bookings> {
  constructor(dataSource: DataSource) {
    super(dataSource, Bookings);
  }
}
```

### Entities
- TypeORM entities using decorators
- Schema is `'fotNet'` for all entities
- Generated from database using `yarn generate:db-schema`
- Relationships defined with `@ManyToOne`, `@OneToMany`, etc.

### Path Aliases
- `@footy/*` maps to `src/*` (configured in tsconfig.json)
- Always use path aliases for imports within the project
- Example: `import { BookingsService } from '@footy/services'`

### Configuration
All configuration files are in `cfg/` directory in YAML format. The ConfigManager from `@gaias/basenode` loads these automatically during bootstrap.

## Domain Logic: Cinema Booking System

The application implements a cinema seat booking system with intelligent seat allocation:

### Core Entities
The system currently has 4 main entities (as defined in `gen_db.json`):
- **Movies**: Cinema showings with configurable rows and seats per row
- **Bookings**: Customer bookings with auto-generated booking codes (GIC####)
- **Seats**: Individual seat assignments linked to bookings
- **SystemConfigs**: System-wide configuration key-value pairs

### Seat Allocation Algorithm
The `SeatSelectionService` implements two allocation strategies:

1. **Default Allocation** (when no starting position specified):
   - Starts from furthest row (back of cinema) and moves forward
   - Prioritizes middle seats (calculates middle position of row)
   - Attempts to find consecutive seats closest to middle
   - Falls back to non-consecutive if needed

2. **User-Specified Allocation** (when starting position provided):
   - Starts from user's selected row and seat number
   - Allocates consecutively to the right from starting position
   - If insufficient seats in row, continues to next row using default rules

### Key Business Rules
- Bookings validate available seats against movie capacity (totalRows * seatsPerRow)
- Booking codes auto-increment from count (GIC0001, GIC0002, etc.)
- Seat updates require deleting existing seats and reallocating
- All seat operations are transactional to prevent orphaned data

### Error Codes
- `ERROR_CODE1`: Movie not found
- `ERROR_CODE3`: Failed to allocate seats
- `ERROR_CODE4`: Not enough seats available
- `ERROR_CODE5`: Booking not found
- `ERROR_CODE6`: Failed to update seats

## Testing

Tests use Jest with ts-jest preset. Configuration is in `jest.config.js`. Path mapping from tsconfig (`@footy/*`) is automatically mapped to Jest module resolution using `pathsToModuleNameMapper`.

**Note**: Test scripts are not yet defined in package.json. To add testing capability:
1. Add test scripts to package.json
2. Create test files with `.test.ts` or `.spec.ts` extensions
3. Use the `@footy/*` path alias in test imports

Example test script to add:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Development Notes

### Removed Framework Code
The `src/fmk/` directory has been deleted from this repository. All framework functionality is now provided by the `@gaias/basenode` npm package. If you need to understand framework internals, refer to that package's documentation or source code.

### Working with Database Changes
1. Make schema changes directly in the database
2. Update `gen_db.json` to include/exclude tables (currently configured for: system_configs, movies, bookings, seats)
3. Run `yarn generate:database` to regenerate entities, repositories, and indexes
4. This will also run `yarn lint:fix` automatically

**Note**: The bootstrap is configured with `synchronize: true`, which means TypeORM will automatically sync entity changes to the database schema on startup. This is convenient for development but should be disabled in production.

### API Registration
The framework includes automatic API registration functionality. Each route decorator's third parameter is an API key that can be used for documentation or gateway registration. The `ApiRegisterController` and `HealthCheckController` are automatically included in the bootstrap.
