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
│   ├── persistence/    CrudRepository, StatsRepository, TenantScopedCrudRepository
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

Usando `skills/` como exemplo:

```
modules/skills/
├── skills.module.ts        ← Composição: imports, providers, exports
├── skills.resolver.ts      ← Camada de APRESENTAÇÃO (GraphQL I/O)
├── skills.service.ts       ← Camada de APLICAÇÃO (regras de negócio)
├── skills.repository.ts    ← Persistência tipada (extends CrudRepository)
├── skills-loader.service.ts ← DataLoader para nested fields
├── skills.service.spec.ts  ← Testes unitários do service
│
├── schemas/
│   └── skill.schema.ts     ← Mongoose model
│
├── entities/
│   └── skill.entity.ts     ← GraphQL ObjectType (apresentação de saída)
│
├── dto/
│   ├── create-skill.input.ts  ← GraphQL InputType + class-validator
│   ├── update-skill.input.ts
│   ├── filter-skill.input.ts
│   └── sort-skill.input.ts
│
└── enums/
    └── category.enum.ts    ← Enum registrado no GraphQL
```

### Responsabilidades

| Camada | Arquivo | O que faz | O que NÃO faz |
|--------|---------|-----------|---------------|
| Apresentação | `resolver.ts` | Recebe input, valida tipos, chama service, retorna | Lógica de negócio |
| Aplicação | `service.ts` | Orquestra regras, emite eventos, chama repository | Saber se é GraphQL ou REST |
| Persistência | `schema.ts` + `*Repository` (`CrudRepository` / `tenant`) | CRUD MongoDB, validação de schema | Regras de negócio |
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
// CrudRepository<T> — find/create/update/delete; batch → BatchCount
// StatsRepository<T> — count, countByField, findRecentlyUpdated
// TenantScopedCrudRepository<T> — wrapper com ownerId scope (composição)

@Injectable()
export class SkillsRepository extends CrudRepository<SkillModel> {
  readonly stats = new StatsRepository(this.model);
  constructor(@InjectModel(SkillModel.name) model: Model<SkillModel>) {
    super(model);
  }
}
```

---

## Patterns Aplicados (e por quê)

| Pattern | Onde | Por que vale a pena |
|---------|------|---------------------|
| **Repository (DI)** | `SkillsRepository extends CrudRepository<T>` | Tipado, injetável, mockável; stats/tenant compostos explicitamente |
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
| Mappers Domain↔Persistence | O Mongoose model já é o retorno — as camadas usam o mesmo shape |
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
    │  (Mongoose)    │ │ (EE2)   │ │  (batching)  │
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
| Schema do DB diverge do GraphQL response | Introduzir Mapper |
| Trocar MongoDB por PostgreSQL | O Repository em `core/` já isola — criar nova implementação |
| Módulo cresce demais | Criar sub-módulos ou extrair para microservice |

**A chave:** começar simples, adicionar camadas quando a dor aparecer.

---

## Resumo em Uma Frase

> "No NestJS, Clean Architecture é respeitar a direção das dependências usando
> o DI nativo do framework — não é criar 30 arquivos extras para um CRUD."
