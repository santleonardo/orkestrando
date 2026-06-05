# ORKESTRANDO

Plataforma Acadêmica Inteligente para gestão completa de instituições de ensino.

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16 | Framework principal (App Router) |
| React | 19 | Biblioteca UI |
| TypeScript | 5 | Tipagem |
| Tailwind CSS | 4 | Estilização |
| shadcn/ui | latest | Componentes UI |
| Supabase | latest | Banco de dados, Auth, Storage, Realtime |
| PostgreSQL | latest | Banco de dados relacional |
| Prisma | 6 | ORM (desenvolvimento local) |
| Recharts | 2 | Gráficos e visualizações |
| Framer Motion | 12 | Animações |
| Zod | 4 | Validação |
| date-fns | 4 | Manipulação de datas |

## Estrutura do Projeto

```
orkestrando/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── src/
│   ├── app/
│   │   ├── (auth)/             # Páginas de autenticação
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/       # Dashboard do coordenador
│   │   │   ├── page.tsx        # Home do dashboard
│   │   │   ├── teachers/      # Gestão de professores
│   │   │   ├── students/      # Gestão de alunos
│   │   │   ├── classes/       # Gestão de turmas
│   │   │   ├── rooms/         # Gestão de salas
│   │   │   ├── courses/       # Gestão de cursos
│   │   │   ├── subjects/      # Gestão de disciplinas
│   │   │   ├── availability/  # Disponibilidade de professores
│   │   │   ├── schedule/      # Agenda
│   │   │   ├── materials/     # Materiais didáticos
│   │   │   ├── messages/      # Sistema de mensagens
│   │   │   ├── attendance/    # Frequência
│   │   │   ├── reports/       # Relatórios
│   │   │   ├── semesters/     # Semestres letivos
│   │   │   ├── holidays/      # Feriados
│   │   │   ├── settings/      # Configurações
│   │   │   └── layout.tsx
│   │   ├── student/           # Portal do aluno
│   │   │   ├── schedule/      # Agenda pessoal
│   │   │   ├── materials/     # Materiais
│   │   │   ├── attendance/    # Frequência
│   │   │   ├── grades/       # Notas
│   │   │   ├── history/       # Histórico acadêmico
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/               # API Routes (Route Handlers)
│   │   │   ├── teachers/
│   │   │   ├── students/
│   │   │   ├── classes/
│   │   │   ├── rooms/
│   │   │   ├── courses/
│   │   │   ├── subjects/
│   │   │   ├── availability/
│   │   │   ├── schedule/
│   │   │   ├── materials/
│   │   │   ├── messages/
│   │   │   ├── attendance/
│   │   │   ├── reports/
│   │   │   ├── semesters/
│   │   │   ├── holidays/
│   │   │   ├── enrollments/
│   │   │   ├── notifications/
│   │   │   ├── audit/
│   │   │   ├── ai/
│   │   │   └── route.ts       # Dashboard stats
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Sidebar, Header
│   │   └── shared/            # DataTable, StatsCard, etc.
│   ├── lib/
│   │   ├── supabase/          # Cliente Supabase (browser + server)
│   │   ├── types/             # Tipagens TypeScript
│   │   ├── hooks/             # Custom hooks (auth, realtime, permissions)
│   │   ├── utils/             # Validação, datas, formatação
│   │   └── constants.ts       # Constantes do sistema
│   ├── server/
│   │   ├── services/          # Serviços de negócio
│   │   │   ├── conflict-engine.ts    # Motor de conflitos
│   │   │   ├── lesson-generator.ts   # Gerador automático de aulas
│   │   │   ├── notification-service.ts
│   │   │   ├── audit-service.ts
│   │   │   └── ai-service.ts        # Inteligência artificial
│   │   └── validations/
│   │       └── schedule.ts
│   └── middleware.ts          # Proteção de rotas
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Schema completo com RLS
│   ├── functions/
│   │   └── notify/               # Edge function de notificações
│   └── config.toml
├── prisma/
│   └── schema.prisma          # Schema para desenvolvimento local
└── .env.local.example
```

## Módulos Implementados

1. **Autenticação** — Login, registro, recuperação de senha via Supabase Auth + JWT
2. **RBAC** — Três perfis: Coordenador, Professor, Aluno com permissões granulares
3. **Gestão Acadêmica** — CRUD completo para professores, alunos, turmas, salas, cursos, disciplinas
4. **Disponibilidade** — Grade semanal visual com aprovação pelo coordenador
5. **Motor de Conflitos** — Validação automática de horários (professor, sala, aluno, feriados, férias)
6. **Geração Automática de Aulas** — Cria todas as sessões do semestre ao criar uma turma
7. **Agenda** — Visualização diária, semanal e mensal
8. **Portal do Aluno** — Grade, agenda, materiais, frequência, notas, histórico
9. **Materiais** — Upload/download com versionamento e organização
10. **Mensagens** — Chat estilo Slack com conversas, threads, anexos, status de leitura
11. **Frequência** — Registro com assinatura digital e trilha de auditoria
12. **Relatórios** — Gráficos e relatórios por perfil (coordenador, professor, aluno)
13. **Auditoria** — Log completo de todas as ações do sistema
14. **IA** — Assistente acadêmico, sugestões, detecção de conflitos, previsão de evasão
15. **Notificações** — Email, push e notificações internas via Edge Functions

## Configuração

### Pré-requisitos

- Node.js 18+ ou Bun
- Conta no Supabase

### Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd orkestrando

# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais Supabase

# Rodar migrations no Supabase
# Use o SQL em supabase/migrations/001_initial_schema.sql

# Gerar cliente Prisma (desenvolvimento local)
bun run db:generate

# Iniciar servidor de desenvolvimento
bun run dev
```

### Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase |
| `NEXTAUTH_SECRET` | Segredo para sessões |
| `NEXTAUTH_URL` | URL base da aplicação |

## Deploy

### Vercel (Recomendado)

1. Conectar repositório ao Vercel
2. Configurar variáveis de ambiente
3. Deploy automático via GitHub Actions

### GitHub Actions

O pipeline CI/CD inclui:
- Lint + Type Check
- Build de produção
- Deploy Preview (Pull Requests)
- Deploy Produção (merge na main)

## Permissis por Perfil

| Recurso | Coordenador | Professor | Aluno |
|---|:---:|:---:|:---:|
| Gerenciar professores | CRUD | R | - |
| Gerenciar alunos | CRUD | R | R (próprio) |
| Gerenciar turmas | CRUD | R (próprias) | R (inscritas) |
| Gerenciar salas | CRUD | R | - |
| Registrar frequência | CRUD | CRUD (próprias) | R (própria) |
| Materiais | CRUD | CRUD (próprias) | R + Upload |
| Mensagens | Total | Próprias | Próprias |
| Relatórios | Total | Parcial | Próprio |
| Configurações | Total | - | Próprio |

## Licença

Software proprietário. Todos os direitos reservados.
