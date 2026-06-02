'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Music, Users, Calendar, BookOpen, MessageSquare, BarChart3, Shield, Cpu, GraduationCap, Clock, Building2, FileText, Bell, Layers } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [mounted] = useState(true)

  const features = [
    { icon: Calendar, title: 'Agendamento Inteligente', description: 'Definição de disponibilidades, detecção automática de conflitos e geração otimizada de grade horária para professores e turmas.' },
    { icon: Users, title: 'Gestão Multi-perfil', description: 'Coordenadores, professores e alunos com dashboards específicos, permissões RBAC e fluxos personalizados.' },
    { icon: BookOpen, title: 'Materiais e Atividades', description: 'Upload e organização de materiais por disciplina, turma e aula. Suporte a PDF, DOCX, XLSX, PPTX, MP3, MP4, imagens e ZIP.' },
    { icon: MessageSquare, title: 'Mensagens em Tempo Real', description: 'Sistema estilo WhatsApp/Slack com conversas, threads, anexos, leitura, não lidas, busca e entrega em tempo real.' },
    { icon: Clock, title: 'Presença Digital', description: 'Registro de presença com assinatura digital completa: data, hora, usuário, IP, navegador, dispositivo e hash para auditoria.' },
    { icon: BarChart3, title: 'Relatórios e Dashboards', description: 'Dashboards com KPIs relevantes para cada perfil. Relatórios de frequência, horas, evasão, utilização de salas e professores.' },
    { icon: Cpu, title: 'IA Integrada', description: 'Sugestão de horários por IA, prevenção de conflitos, previsão de evasão e geração inteligente de relatórios.' },
    { icon: Shield, title: 'Segurança e Auditoria', description: 'Autenticação JWT, RBAC, Row Level Security, middleware de proteção de rotas e logs completos de auditoria.' },
  ]

  const modules = [
    { icon: GraduationCap, label: 'Professores', count: '7 telas' },
    { icon: Building2, label: 'Coordenadores', count: '10 telas' },
    { icon: BookOpen, label: 'Alunos', count: '7 telas' },
    { icon: Layers, label: 'APIs REST', count: '50 endpoints' },
    { icon: FileText, label: 'Banco de Dados', count: '30 tabelas' },
    { icon: Bell, label: 'Notificações', count: 'Realtime' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Music className="w-5 h-5 text-violet-200" />
              <span className="text-violet-100 text-sm font-medium">Sistema Acadêmico Inteligente</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 tracking-tight">
              ORKESTRANDO
            </h1>
            <p className="text-xl sm:text-2xl text-violet-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              Orquestre sua instituição acadêmica com inteligência. Gestão completa de
              turmas, horários, presença, materiais, mensagens e relatórios — tudo em
              um único sistema moderno e escalável.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-violet-700 hover:bg-violet-50 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
                onClick={() => router.push('/login')}
              >
                Acessar Sistema
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Conhecer Recursos
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '24+', label: 'Telas Implementadas' },
            { value: '50', label: 'APIs REST' },
            { value: '30', label: 'Tabelas no BD' },
            { value: '3', label: 'Perfis de Usuário' },
          ].map((stat) => (
            <Card key={stat.label} className="text-center shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-violet-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-violet-100 text-violet-700">Recursos</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tudo que sua instituição precisa</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Módulos completos projetados para simplificar e otimizar a gestão acadêmica
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-violet-100">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-3 group-hover:bg-violet-600 transition-colors">
                  <feature.icon className="w-6 h-6 text-violet-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Módulos Implementados</h2>
            <p className="text-lg text-violet-100 max-w-2xl mx-auto">
              Sistema completo e pronto para produção
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {modules.map((module) => (
              <Card key={module.label} className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
                <CardContent className="pt-6 pb-4">
                  <module.icon className="w-8 h-8 text-violet-200 mx-auto mb-3" />
                  <div className="text-white font-medium text-sm">{module.label}</div>
                  <div className="text-violet-200 text-xs mt-1">{module.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-violet-100 text-violet-700">Stack Tecnológica</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tecnologias Modernas</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Next.js 16', desc: 'App Router' },
            { name: 'React 19', desc: 'Server Components' },
            { name: 'TypeScript', desc: 'Type Safe' },
            { name: 'Tailwind CSS 4', desc: 'Utility First' },
            { name: 'shadcn/ui', desc: 'Component Library' },
            { name: 'PostgreSQL', desc: 'Database' },
            { name: 'Supabase', desc: 'Auth + Storage + Realtime' },
            { name: 'Socket.io', desc: 'Realtime Messages' },
            { name: 'Prisma ORM', desc: 'Type-safe DB' },
            { name: 'JWT', desc: 'Authentication' },
            { name: 'GitHub Actions', desc: 'CI/CD Pipeline' },
            { name: 'Vercel', desc: 'Deployment' },
          ].map((tech) => (
            <Card key={tech.name} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="font-semibold text-gray-900">{tech.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{tech.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-2xl">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Pronto para começar?</h2>
            <p className="text-violet-100 mb-8 max-w-lg mx-auto">
              Faça login e explore todas as funcionalidades do ORKESTRANDO.
            </p>
            <Button
              size="lg"
              className="bg-white text-violet-700 hover:bg-violet-50 text-lg px-8 py-6"
              onClick={() => router.push('/login')}
            >
              Entrar no Sistema
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="w-5 h-5 text-violet-400" />
            <span className="text-white font-bold">ORKESTRANDO</span>
          </div>
          <p className="text-sm">Sistema Acadêmico Inteligente &mdash; Next.js 16 + React 19 + TypeScript + PostgreSQL + Supabase</p>
        </div>
      </footer>
    </div>
  )
}
