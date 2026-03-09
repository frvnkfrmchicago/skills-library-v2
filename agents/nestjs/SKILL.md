---
name: nestjs
description: Enterprise-grade Node.js with TypeScript, decorators, and structured architecture.
owner: Frank
last_updated: 2026-03
---

# NestJS

Node.js for serious backends. TypeScript-first. Angular-inspired.

---

## Context Questions

Before implementing with NestJS:

1. **What's the app type?** — REST API, GraphQL, microservices, real-time?
2. **What's the scale?** — Startup MVP or enterprise-grade?
3. **Database needs?** — SQL, MongoDB, multiple databases?
4. **Auth requirements?** — JWT, OAuth, session-based?
5. **Team background?** — Angular devs (familiar) or new to decorators?

---

## TL;DR

| Need | Solution |
|------|----------|
| REST API | Controllers + DTOs |
| GraphQL | @nestjs/graphql |
| Database | TypeORM, Prisma, or Mongoose |
| Auth | @nestjs/passport + JWT |
| Validation | class-validator + DTOs |
| Caching | @nestjs/cache-manager |
| Queue jobs | @nestjs/bull |
| WebSocket | @nestjs/websockets |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **API style** | REST ←→ GraphQL |
| **Architecture** | Monolith ←→ Microservices |
| **Database** | SQL (TypeORM) ←→ NoSQL (Mongoose) |
| **Complexity** | Simple CRUD ←→ Domain-driven design |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| REST API | Controllers + Services + DTOs |
| GraphQL API | Resolvers + Services + Type definitions |
| Microservices | @nestjs/microservices + message patterns |
| Real-time | WebSocket gateway + events |
| Enterprise | Full DDD with modules |

---

## When to Use NestJS

### ✅ Great Fit

- **Enterprise backends** — Structure enforced by design
- **Large teams** — Clear patterns reduce confusion
- **TypeScript shops** — Full type safety
- **Angular teams** — Familiar decorators and DI
- **Microservices** — Built-in patterns

### ❌ Consider Alternatives

- **Simple API** — Express or Hono lighter
- **Serverless-first** — Hono/Cloudflare Workers
- **Rapid prototyping** — Less boilerplate options

---

## Quick Start

```bash
# Create new project
npm i -g @nestjs/cli
nest new my-api

# Generate resources
nest g resource users
```

---

## Project Structure

```
src/
├── app.module.ts          # Root module
├── main.ts                # Entry point
├── common/                # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
└── modules/
    └── users/
        ├── users.module.ts
        ├── users.controller.ts
        ├── users.service.ts
        ├── dto/
        │   ├── create-user.dto.ts
        │   └── update-user.dto.ts
        └── entities/
            └── user.entity.ts
```

---

## Core Patterns

### Controller

```typescript
// users.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }
}
```

### Service

```typescript
// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User ${id} not found`)
    }
    return user
  }
}
```

### DTO with Validation

```typescript
// dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsOptional()
  @IsString()
  avatarUrl?: string
}
```

### Module

```typescript
// users.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## Auth with JWT

```typescript
// auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email }
  }
}

// auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

## Exception Handling

```typescript
// common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message,
    })
  }
}
```

---

## Common Packages

| Package | Purpose |
|---------|---------|
| `@nestjs/typeorm` | SQL databases |
| `@nestjs/mongoose` | MongoDB |
| `@nestjs/passport` | Authentication |
| `@nestjs/jwt` | JWT tokens |
| `@nestjs/swagger` | API documentation |
| `@nestjs/graphql` | GraphQL APIs |
| `@nestjs/bull` | Job queues |
| `@nestjs/cache-manager` | Caching |

---

## Related Skills

- `agents/hono/SKILL.md` — Lighter alternative
- `agents/prisma/SKILL.md` — Database ORM
- `agents/auth/SKILL.md` — Authentication patterns
- `agents/testing/SKILL.md` — Testing NestJS apps
