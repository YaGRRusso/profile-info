# @profile-info/api

Code-first NestJS GraphQL API for the profile-info project. It stores profile data
(skills, experiences, educations, organizations, projects, users) in MongoDB and
serves it over a GraphQL endpoint protected by JWT authentication. It is consumed
by the `@profile-info/admin` dashboard.

## Tech stack

- **NestJS 11**: the application framework. Modules, resolvers, services, and DI
  throughout `src/`.
- **Apollo GraphQL (code-first)**: `@nestjs/graphql` + `@nestjs/apollo` in
  `app.module.ts`. The schema is generated from TypeScript decorators to
  `src/schema.gql`.
- **MongoDB + Mongoose**: `@nestjs/mongoose`, ODM schemas in `src/schemas/`,
  connection configured in `app.module.ts`.
- **Passport JWT**: `src/auth/`, a global guard with a `@Public()` opt-out.
- **class-validator / class-transformer**: input validation on GraphQL inputs via
  a global `ValidationPipe`.
- **DataLoader**: `src/core/helpers/loaders.helper.ts`, batches skill and
  organization lookups to avoid N+1 queries on nested fields.
- **Jest**: unit (`*.spec.ts`) and e2e (`test/*.e2e-spec.ts`) tests.

## Project structure

```
src/
├── main.ts                   # Bootstrap: create app, validation pipe, start server.
├── app.module.ts             # Root module: Config, Mongoose, GraphQL, feature modules.
├── app.controller.ts         # Minimal REST GET / health route ("Hello World!").
├── schema.gql                # Auto-generated GraphQL schema (code-first output).
├── auth/                     # JWT auth: signIn mutation, strategy, global guard.
│   ├── auth.resolver.ts      # signIn (public) and getMe (protected).
│   ├── auth.strategy.ts      # Passport JWT strategy; validates user from payload.
│   ├── auth.guard.ts         # GqlAuthGuard; honors @Public(); reads GraphQL req.
│   └── dto/sign-in.input.ts  # { email, password }.
├── core/                     # Shared building blocks for every feature module.
│   ├── resolvers/base.resolver.ts  # Factory: generates the CRUD resolver surface.
│   ├── services/base.service.ts    # Factory: generic CRUD + paginated findMany.
│   ├── schemas/              # BaseModel, paginated/translation/daterange schemas.
│   ├── entities/             # BaseEntity and shared GraphQL object types.
│   ├── inputs/               # Pagination, sort, date-range, translation, url inputs.
│   ├── decorators/           # @Public, @CurrentUser, @OptionalField.
│   ├── helpers/loaders.helper.ts   # DataLoaders for skills and organizations.
│   └── configs/              # app.config (port/host/CORS), validation.config.
├── skills/                   # Feature module (the canonical example to copy).
│   ├── skills.resolver.ts    # Extends BaseResolver(SkillEntity, ...inputs).
│   ├── skills.service.ts     # Extends BaseService(SkillModel, ...inputs).
│   ├── entities/skill.entity.ts    # GraphQL ObjectType.
│   ├── enums/category.enum.ts      # SkillCategory.
│   └── dto/                  # create / update / filter / sort inputs.
├── users/                    # Users; service hashes passwords (bcryptjs).
├── experiences/              # Work experience; @ResolveField uses DataLoaders.
├── educations/               # Education history.
├── organizations/            # Organizations referenced by experiences/educations.
├── projects/                 # Portfolio projects.
└── schemas/                  # Mongoose models for each feature entity.
```

## Requirements

- Node >= 22
- npm >= 11
- Docker with the Compose plugin (for MongoDB), or a reachable MongoDB instance

## Getting started

1. Install dependencies (from the repo root, installs all workspaces):

```bash
npm install
```

2. Start MongoDB (from the repo root):

```bash
npm run docker:up
```

3. Create the env file from the example:

```bash
cp .env.example .env.development
```

4. Run the API in watch mode (from the repo root):

```bash
npm run api:dev
```
