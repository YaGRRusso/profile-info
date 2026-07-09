# Clean Architecture — NestJS Idiomático

> Documento de estudo para whiteboard. Mostra como este projeto aplica Clean Architecture
> sem over-engineering, respeitando os patterns do NestJS.

---

## A Premissa

Clean Architecture **não é uma estrutura de pastas**. É uma regra de dependência:

```
Dependências apontam sempre para DENTRO (do genérico/estável para o específico/volátil).
```

No NestJS, isso já é resolvido naturalmente pelo framework:
- O **Resolver** (apresentação) não é importado pelo **Service** (lógica)
- O **Service** não é importado pelo **Schema** (persistência)
- O **Module** amarra tudo via DI — ninguém precisa se conhecer diretamente

---

## Estrutura do Projeto (Macro)

```
src/
├── common/          ← TS puro. Sem NestJS, sem Mongoose. Helpers genéricos.
│                       Regra: NÃO importa nada de cima.
│
├── core/            ← Infra cross-cutting. Coisas compartilhadas entre módulos.
│   ├── configs/        App bootstrap (port, host, validation pipe)
│   ├── decorators/     @Public(), @OptionalField(), @Roles()
│   ├── entities/       GraphQL types base (BaseEntity, BatchEntity)
│   ├── enums/          Enums compartilhados (UserRole, SortEnum)
│   ├── events/         Domain events (payloads + constantes de nomes)
│   ├── inputs/         Inputs GraphQL genéricos (pagination, sort factory)
│   ├── persistence/    CrudRepository, StatsRepository, CrudMapperInterface, scoped()
│   └── schemas/        Mongoose sub-schemas reutilizáveis
│                       Regra: NÃO importa de modules/ nem integrations/.
│
├── integrations/    ← Adapters para serviços externos (OpenRouter, GitHub, Tavily).
│                       Cada um tem: Port (abstract class) + Adapter (service).
│                       Regra: NÃO importa de modules/.
│
└── modules/         ← Domínios de negócio. Cada módulo é uma feature completa.
    ├── auth/           JWT + Guards
    ├── graphql/        Apollo wiring + DataLoaders
    ├── skills/         ← Módulo referência (detalhado abaixo)
    ├── organizations/
    ├── experiences/
    ├── ...
    └── dashboard/      Agregação read-only (consome services de outros módulos)
```

### Regra de Dependência (Dependency Rule)

```
modules → core → common         (OK: de fora pra dentro)
modules → integrations → common (OK: de fora pra dentro)
common → ??? (PROIBIDO)          (common não importa NADA)
integrations → modules (PROIBIDO) (adapters não conhecem domínio)
```

---

## Estrutura de um Módulo (Micro)

Usando `courses/` como exemplo:

```
modules/courses/
├── courses.module.ts
├── courses.resolver.ts
├── courses.service.ts
├── courses.repository.ts
├── mappers/
│   └── course.mapper.ts    ← Model ↔ domain record; DTO → persistence
├── schemas/
│   └── course.schema.ts
├── entities/
│   └── course.entity.ts
├── dto/
│   ├── create-course.input.ts
│   ├── update-course.input.ts
│   ├── filter-course.input.ts
│   └── sort-course.input.ts
└── enums/
    └── status.enum.ts
```

### Responsabilidades

| Camada | Arquivo | O que faz | O que NÃO faz |
|--------|---------|-----------|---------------|
| Apresentação | `resolver.ts` | Recebe input, valida tipos, chama service, retorna | Lógica de negócio |
| Aplicação | `service.ts` | Orquestra regras, emite eventos, chama repository | Saber se é GraphQL ou REST |
| Persistência | `schema.ts` + `repository.ts` + `mappers/` | CRUD via `CrudRepository` + mapper; cascade ops on raw `model` | Regras de negócio |
| Validação de entrada | `dto/*.input.ts` | Valida shape + constraints (class-validator) | Regras de domínio complexas |

---

## Onde Fica Cada Tipo de Lógica

### Validação de entrada → DTOs (class-validator)
```typescript
@InputType()
export class CreateSkillInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()           // ← Validação de formato
  slug: string;
}
```
O `ValidationPipe` global rejeita antes de chegar no service.

### Regras de negócio → Service
```typescript
@Injectable()
export class SkillsService {
  constructor(
    private readonly repository: SkillsRepository,  // ← DI do repositório tipado
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createOne(input: CreateSkillInput): Promise<SkillModel> {
    const skill = await this.repository.createOne(input); // E11000 → 409 via MongoExceptionFilter
    await this.eventEmitter.emitAsync(              // ← Efeito colateral
      DomainEvents.skill.created,
      new SkillCreatedEvent(skill._id.toString(), skill.slug)
    );
    return skill;
  }
}
```

### Reações a eventos → Listeners (em outros módulos)
```typescript
@Injectable()
export class OnSkillDeletedListener {
  constructor(private readonly projectsService: ProjectsService) {}

  @OnEvent(DomainEvents.skill.deleted)
  handle({ skillId }: SkillDeletedEvent) {
    return this.projectsService.detachSkill(skillId);  // ← $pull do array
  }
}
```

### Acesso a dados genérico → `core/persistence/`
```typescript
// CrudRepository + CrudMapperInterface — find/create/update/delete; batch → BatchCount
// StatsRepository — count, countByField, findRecentlyUpdated
// scoped(TenantScope) — ownerId filter composition (no separate wrapper class)

@Injectable()
export class CoursesRepository {
  readonly crud: CrudRepository<CourseModel, CourseEntityRecord, ...>;
  readonly stats: StatsRepository<CourseModel>;

  constructor(@InjectModel(CourseModel.name) model: Model<CourseModel>) {
    this.crud = new CrudRepository(model, new CourseMapper());
    this.stats = new StatsRepository(model);
  }
}
```

---

## Patterns Aplicados (e por quê)

| Pattern | Onde | Por que vale a pena |
|---------|------|---------------------|
| **Mapper (CrudMapperInterface)** | `mappers/<entity>.mapper.ts` | Model ↔ domain record; DTOs → persistence; `withObjectIdRefs` em filters |
| **Repository (DI)** | `CoursesRepository` — `crud` + `stats` + mapper | Tipado, injetável, mockável; tenant via `scoped()` |
| **Domain Events** | `EventEmitter2` + listeners | Desacopla cascatas (skill deletada → projetos atualizam) sem import circular |
| **Error Handling** | `PersistenceExceptionFilter` (`APP_FILTER`) | Converte erros de Mongo/Mongoose em 4xx/503 globalmente; `assertDuplicate` / `assertReferencesExist` em services só para mensagens específicas |
| **Port/Adapter** | `integrations/` (abstract class + impl) | Troca OpenRouter por outro LLM sem tocar nos modules |
| **Modular Monolith** | Cada module é autocontido | Migrar para microservice = extrair o módulo inteiro |
| **DataLoader** | Per-request batching em `graphql/` | N+1 resolvido sem cache global |
| **Guard + Decorator** | `@Public()`, `@Roles()` | Cross-cutting auth sem poluir lógica de negócio |

---

## O Que NÃO Fazemos (e por quê)

| Over-engineering | Por que não vale aqui |
|------------------|----------------------|
| Use Cases separados do Service | O Service do NestJS JÁ É o use case. Separar só se houver múltiplos consumers |
| Value Objects manuais | class-validator + GraphQL types já validam na fronteira |
| CQRS | Um banco só, uma interface só — a separação query/command no service basta |
| Entidade Rica separada | Para CRUD simples, o schema + service cobrem. Se o domínio cresce, aí sim |

---

## Fluxo de uma Request (whiteboard)

```
                    ┌──────────────────┐
                    │    Client (SPA)  │
                    └────────┬─────────┘
                             │ POST /graphql
                    ┌────────▼─────────┐
                    │   Apollo Server  │
                    │  + GqlAuthGuard  │  ← JWT validation, @Public() bypass
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │     Resolver     │  ← Apresentação: args → service → return
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │     Service      │  ← Lógica: valida regras, emite eventos
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼──────┐ ┌────▼────┐ ┌──────▼───────┐
    │  Repository    │ │ Events  │ │  DataLoader  │
    │  crud + mapper │ │ (EE2)   │ │  (batching)  │
    └─────────┬──────┘ └────┬────┘ └──────────────┘
              │              │
    ┌─────────▼──────┐ ┌────▼────────────────┐
    │    MongoDB     │ │  Listeners          │
    │                │ │  (other modules)    │
    └────────────────┘ └─────────────────────┘
```

---

## Fluxo de Delete com Cascade (whiteboard)

```
removeOneSkill(id)
      │
      ▼
┌─────────────────────────────────────┐
│ SkillsService.removeOne(id)         │
│                                     │
│  1. findOneById(id)     ← valida    │
│  2. emitAsync(skill.deleted, {id})  │
│  3. deleteOne(id)       ← remove    │
└──────────────────┬──────────────────┘
                   │ event: skill.deleted
      ┌────────────┼────────────┬──────────────┐
      ▼            ▼            ▼              ▼
  Projects     Courses     Educations    Experiences
  $pull skill  $pull skill $pull skill   $pull from
  from array   from array  from array   roles.skillIds
```

**Por que eventos e não chamada direta?**
- Skills não importa Projects/Courses (sem acoplamento circular)
- Adicionar um novo consumer = criar um listener, zero mudança no emitter
- Falha em um consumer não impede os outros

---

## Como Escalar a Arquitetura (se o domínio crescer)

A pergunta na entrevista: "E se precisar ficar mais complexo?"

| Sinal de complexidade | Ação |
|----------------------|------|
| Mesma lógica consumida por GraphQL + REST + Worker | Extrair Use Cases do Service |
| Invariantes que precisam valer fora da fronteira de entrada | Criar Value Objects |
| Modelo de leitura ≠ modelo de escrita | Considerar CQRS leve |
| Schema do DB diverge do GraphQL response | `CrudMapperInterface` + `*EntityRecord` (implemented) |
| Trocar MongoDB por PostgreSQL | O Repository em `core/` já isola — criar nova implementação |
| Módulo cresce demais | Criar sub-módulos ou extrair para microservice |

**A chave:** começar simples, adicionar camadas quando a dor aparecer.

---

## Resumo em Uma Frase

> "No NestJS, Clean Architecture é respeitar a direção das dependências usando
> o DI nativo do framework — não é criar 30 arquivos extras para um CRUD."
