```bash
src/
├── common/                              # 1. CÓDIGO AGNÓSTICO E UTILITÁRIOS (Cidadãos Livres)
│   ├── execution/
│   │   └── orchestrator.helper.ts       # 👈 O seu maestro de promessas (puro .ts, sem NestJS)
│   ├── helpers/
│   │   ├── loaders.helper.ts            # Dataloaders para resolver N+1 no GraphQL
│   │   └── object.helper.ts
│   └── mappers/
│       └── user.mapper.ts               # 👈 Onde você converte o Document(Mongoose) em Entity(TS)
│
├── core/                                # 2. INFRAESTRUTURA GLOBAL DO NESTJS (Hóspedes do Framework)
│   ├── configs/                         # app.config.ts, etc.
│   ├── decorators/                      # @CurrentUser(), etc.
│   ├── entities/                        # Sub-documentos globais (ex: DateRangeEntity, TranslationEntity)
│   ├── enums/                           # Enums globais reaproveitáveis (ex: SortEnum)
│   ├── inputs/                          # DTOs globais (ex: PaginationInput, DateRangeInput)
│   └── schemas/                         # Sub-schemas do Mongoose (ex: url.schema.ts)
│
├── integrations/                        # 3. CLIENTES HTTP (Comunicação externa burra)
│   ├── ai/                              # 👈 Mantido direto na pasta ai/ (o .service chama o OpenRouter)
│   │   ├── ai.module.ts
│   │   └── ai.service.ts
│   ├── github/
│   │   ├── github.module.ts
│   │   └── github.service.ts
│   └── web-search/                      # 👈 Mantido direto na pasta web-search/ (o .service chama Tavily)
│       ├── web-search.module.ts
│       └── web-search.service.ts        # (Aqui você limpa os retornos "Carregando formulario..." do HTML)
│
├── modules/                             # 4. DOMÍNIOS DE NEGÓCIO (O Coração da Aplicação)
│   ├── ai-tools/                        # (Fluxos de IA e Processamento)
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── helpers/                     # Helpers específicos deste domínio (ex: Markdown Parser)
│   │   ├── mappers/                     # Mappers específicos de IA
│   │   ├── prompts/                     # Textos puros (.ts) com as instruções da LLM
│   │   ├── ai-tools.module.ts
│   │   ├── ai-tools.resolver.ts
│   │   └── ai-tools.service.ts          # 👈 Importa o orchestrator.helper e orquestra a brincadeira toda
│   │
│   ├── auth/                            # (Autenticação)
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── auth.module.ts
│   │   ├── auth.resolver.ts
│   │   └── auth.service.ts              # 👈 Escuta o evento @OnEvent('user.created') e cria a sessão
│   │
│   ├── dashboard/                       # (Agregador de Leitura)
│   │   ├── entities/                    # Apenas entidades virtuais (DashboardStatsEntity)
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.resolver.ts
│   │   └── dashboard.service.ts         # 👈 Não tem "schemas/". Importa os outros services apenas para leitura.
│   │
│   ├── RESOURCE/                        # 💡 EXEMPLO DE MÓDULO CRUD
│   │   ├── dto/                         # create-RESOURCE.input.ts, update-RESOURCE.input.ts
│   │   ├── entities/                    # RESOURCE.entity.ts
│   │   ├── enums/                       # status.enum.ts
│   │   ├── events/                      # RESOURCE-created.event.ts (Pub/Sub)
│   │   ├── schemas/                     # RESOURCE.schema.ts (O Banco de Dados isolado)
│   │   ├── RESOURCE.module.ts           # Importa o SkillsModule (apenas para o resolver ler)
│   │   ├── RESOURCE.resolver.ts         # Onde você mapeia a @ResolveField('skills')
│   │   └── RESOURCE.service.ts          # 👈 Lógica bruta. NUNCA importa o skill.service.ts.
│   ├── RESOURCE/                        # 🔄 (Mesma estrutura de RESOURCE)
│   └── RESOURCE/                        # 🔄 (Mesma estrutura de RESOURCE)
│
├── app.module.ts                        # Centraliza os imports limpos
└── main.ts
```
