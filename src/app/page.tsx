// ─── ORKESTRANDO — Landing Page ───

"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/providers/RoleProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Users,
  Shield,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Music,
  Database,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, signOut, profile } = useAuth();
  const { isCoordenador, isProfessor, isAluno, role } = useRole();

  const features = [
    {
      icon: Users,
      title: "Gestão de Usuários",
      description:
        "Administre coordenadores, professores e alunos com controle de acesso granular via RBAC.",
      roles: ["Coordenador"],
    },
    {
      icon: BookOpen,
      title: "Turmas & Materiais",
      description:
        "Crie turmas, compartilhe materiais didáticos e organize o conteúdo pedagógico.",
      roles: ["Professor", "Coordenador"],
    },
    {
      icon: GraduationCap,
      title: "Atividades & Avaliações",
      description:
        "Crie, submeta e avalie atividades com sistema completo de notas e feedback.",
      roles: ["Professor", "Aluno"],
    },
    {
      icon: BarChart3,
      title: "Relatórios & Analytics",
      description:
        "Acompanhe o desempenho dos alunos, turmas e da organização com dashboards visuais.",
      roles: ["Coordenador", "Professor"],
    },
    {
      icon: MessageSquare,
      title: "Comunicação Integrada",
      description:
        "Mensagens entre professores e alunos com suporte a anexos e notificações.",
      roles: ["Professor", "Aluno"],
    },
    {
      icon: Shield,
      title: "Segurança & RLS",
      description:
        "Row Level Security no Supabase garante que cada role só acessa dados permitidos.",
      roles: ["Coordenador", "Professor", "Aluno"],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Music className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Orkestrando</span>
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {role}
                </Badge>
                <span className="hidden md:inline text-sm text-muted-foreground">
                  {profile?.full_name || profile?.user_id}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sair
                </Button>
              </div>
            ) : (
              <Button size="sm" disabled>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="container relative mx-auto px-4 py-20 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                FASE 1 — Fundação da Plataforma
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Orquestrando a{" "}
                <span className="text-primary">educação</span> do futuro
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Plataforma educacional completa com gestão de turmas, atividades,
                materiais e comunicação. Controle de acesso inteligente para
                coordenadores, professores e alunos.
              </p>

              {isAuthenticated && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {isCoordenador && (
                    <Card className="w-full max-w-xs">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Coordenador</CardTitle>
                        <CardDescription>Acesso total</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Gestão</Badge>
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                          <Badge variant="secondary" className="text-xs">Relatórios</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {isProfessor && (
                    <Card className="w-full max-w-xs">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Professor</CardTitle>
                        <CardDescription>Gestão pedagógica</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Turmas</Badge>
                          <Badge variant="secondary" className="text-xs">Atividades</Badge>
                          <Badge variant="secondary" className="text-xs">Avaliações</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {isAluno && (
                    <Card className="w-full max-w-xs">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Aluno</CardTitle>
                        <CardDescription>Participação ativa</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Materiais</Badge>
                          <Badge variant="secondary" className="text-xs">Entregas</Badge>
                          <Badge variant="secondary" className="text-xs">Mensagens</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Features Grid ─── */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Funcionalidades</h2>
            <p className="mt-3 text-muted-foreground">
              Cada funcionalidade projetada para o fluxo real da educação
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {feature.roles.map((r) => (
                      <Badge key={r} variant="outline" className="text-xs">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all group-hover:w-full" />
              </Card>
            ))}
          </div>
        </section>

        {/* ─── RBAC Overview ─── */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Controle de Acesso (RBAC)
              </h2>
              <p className="mt-3 text-muted-foreground">
                Três roles com permissões granulares e Row Level Security
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Coordenador</CardTitle>
                    <Badge>Nível 3</Badge>
                  </div>
                  <CardDescription>Administrador da plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Acesso total ao sistema
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Gerenciar organizações
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Criar e atribuir roles
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Gerenciar todos os usuários
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Acessar relatórios globais
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary/70" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Professor</CardTitle>
                    <Badge variant="secondary">Nível 2</Badge>
                  </div>
                  <CardDescription>Gestor pedagógico</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Criar e gerenciar turmas
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Publicar materiais
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Criar atividades e avaliações
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Avaliar entregas dos alunos
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Gerar relatórios de turma
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary/40" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Aluno</CardTitle>
                    <Badge variant="outline">Nível 1</Badge>
                  </div>
                  <CardDescription>Participante das turmas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Acessar materiais das turmas
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Submeter atividades
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Ver notas e feedbacks
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Enviar mensagens
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-primary" />Acompanhar progresso
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ─── Tech Stack ─── */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Stack Tecnológica</h2>
            <p className="mt-3 text-muted-foreground">
              Fundação sólida com tecnologias modernas
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Next.js 16", desc: "App Router + React 19" },
              { name: "Supabase", desc: "PostgreSQL + Auth + Storage" },
              { name: "Tailwind CSS 4", desc: "shadcn/ui components" },
              { name: "TypeScript", desc: "Strict type safety" },
            ].map((tech) => (
              <Card key={tech.name} className="text-center transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{tech.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tech.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Setup Notice ─── */}
        {!isAuthenticated && !isLoading && (
          <section className="container mx-auto px-4 pb-16">
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Database className="h-6 w-6" />
                </div>
                <CardTitle>Configure o Supabase</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  Para ativar autenticação e acesso ao banco de dados, configure as
                  variáveis de ambiente no arquivo <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code>.
                  Veja o arquivo <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.example</code> para referência.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-mono">
                  NEXT_PUBLIC_SUPABASE_URL=https://...
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Music className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold">Orkestrando</span>
            </div>
            <p className="text-sm text-muted-foreground">
              FASE 1 — Fundação da Plataforma • RBAC • Supabase • Next.js 16
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
