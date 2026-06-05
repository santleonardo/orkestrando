'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  CalendarDays,
  Shield,
  MessageSquare,
  Brain,
  PenTool,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  Menu,
  X,
  Music,
  Users,
  BookOpen,
  BarChart3,
  Zap,
  Globe,
  Lock,
  Sparkles,
  Quote,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// ── Animation helpers ──
function FadeInUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Data ──
const FEATURES = [
  {
    icon: GraduationCap,
    title: 'Gestão Acadêmica Completa',
    description: 'Gerencie turmas, disciplinas, cursos e matrículas em um único lugar. Controle total da vida acadêmica.',
  },
  {
    icon: CalendarDays,
    title: 'Agenda Inteligente',
    description: 'Crie grades de horários automatizadas com detecção de conflitos em tempo real e sugestões de IA.',
  },
  {
    icon: Shield,
    title: 'Motor de Conflitos Automático',
    description: 'Algoritmos avançados detectam sobreposições de professores, salas e alunos antes mesmo de salvar.',
  },
  {
    icon: MessageSquare,
    title: 'Comunicação Integrada',
    description: 'Mensagens diretas, avisos de turma e notificações multicanal para manter todos conectados.',
  },
  {
    icon: Brain,
    title: 'Relatórios com IA',
    description: 'Análises preditivas de evasão, tendências de frequência e insights acionáveis gerados por inteligência artificial.',
  },
  {
    icon: PenTool,
    title: 'Assinatura Digital',
    description: 'Chamadas eletrônicas com assinatura digital segura, geolocalização e conformidade legal.',
  },
]

const STEPS = [
  { number: '01', title: 'Cadastre sua instituição', description: 'Crie sua conta gratuitamente em menos de 2 minutos. Sem necessidade de cartão de crédito.' },
  { number: '02', title: 'Configure turmas e horários', description: 'Adicione professores, salas, disciplinas e crie grades de horários com o assistente inteligente.' },
  { number: '03', title: 'Gerencie tudo em um só lugar', description: 'Acompanhe frequência, notas, materiais e comunicação — tudo centralizado na plataforma.' },
]

const PRICING_PLANS = [
  {
    name: 'Básico',
    price: 'R$ 99',
    period: '/mês',
    description: 'Ideal para pequenas escolas de música e estúdios independentes.',
    maxStudents: 'até 100 alunos',
    features: [
      'Gestão de turmas e matrículas',
      'Agenda acadêmica básica',
      'Chamada eletrônica',
      'Comunicação por mensagens',
      'Relatórios essenciais',
      'Suporte por e-mail',
    ],
    cta: 'Começar Gratuitamente',
    popular: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 299',
    period: '/mês',
    description: 'Para conservatórios e escolas em crescimento que precisam de mais recursos.',
    maxStudents: 'até 1.000 alunos',
    features: [
      'Tudo do plano Básico',
      'Motor de conflitos automático',
      'Relatórios com IA',
      'Assinatura digital',
      'Gestão de materiais didáticos',
      'API de integração',
      'Suporte prioritário',
    ],
    cta: 'Assinar Agora',
    popular: true,
  },
  {
    name: 'Institucional',
    price: 'R$ 799',
    period: '/mês',
    description: 'Para universidades e grandes redes de ensino com necessidades avançadas.',
    maxStudents: 'ilimitado',
    features: [
      'Tudo do plano Profissional',
      'Alunos ilimitados',
      'Multi-instituições',
      'SLA garantido (99.9%)',
      'Gerente de conta dedicado',
      'Treinamento personalizado',
      'Integração via SAML/SSO',
    ],
    cta: 'Falar com Vendas',
    popular: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Prof. Maria Fernanda Costa',
    role: 'Coordenadora — Conservatório Villa-Lobos',
    initials: 'MF',
    quote: 'O ORKESTRANDO transformou completamente a forma como gerenciamos nossas turmas. O motor de conflitos nos poupa horas de trabalho toda semana.',
  },
  {
    name: 'Dr. João Pedro Oliveira',
    role: 'Diretor — Escola de Música Santa Cecília',
    initials: 'JO',
    quote: 'A inteligência artificial nos ajuda a identificar alunos em risco de evasão antes que seja tarde demais. A taxa de retenção subiu 23% em um semestre.',
  },
  {
    name: 'Ana Paula Souza',
    role: 'Professora — Academia de Artes Harmony',
    initials: 'AS',
    quote: 'Os relatórios automáticos e a assinatura digital facilitam muito o dia a dia. Os alunos adoraram o portal — a frequência melhorou significativamente.',
  },
]

const MODULE_SHOWCASE = [
  { title: 'Dashboard Inteligente', desc: 'Visão completa com KPIs em tempo real', gradient: 'from-emerald-500 to-teal-600', icon: BarChart3 },
  { title: 'Grade de Horários', desc: 'Editor visual com drag & drop', gradient: 'from-teal-500 to-cyan-600', icon: CalendarDays },
  { title: 'Portal do Aluno', desc: 'App completo para alunos acompanharem sua vida acadêmica', gradient: 'from-cyan-500 to-emerald-600', icon: GraduationCap },
  { title: 'Relatórios Avançados', desc: 'Dashboards com IA e exportação em PDF/Excel', gradient: 'from-emerald-600 to-green-500', icon: Brain },
  { title: 'Chamada Digital', desc: 'Assinatura eletrônica com geolocalização', gradient: 'from-teal-600 to-emerald-500', icon: Shield },
  { title: 'Materiais Didáticos', desc: 'Upload, versões e distribuição automatizada', gradient: 'from-green-500 to-teal-600', icon: BookOpen },
]

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Como Funciona', href: '#how-it-works' },
  { label: 'Módulos', href: '#modules' },
  { label: 'Preços', href: '#pricing' },
  { label: 'Depoimentos', href: '#testimonials' },
]

const FOOTER_LINKS = {
  Produto: ['Funcionalidades', 'Preços', 'Integrações', 'Atualizações'],
  Empresa: ['Sobre nós', 'Blog', 'Carreiras', 'Contato'],
  Suporte: ['Central de Ajuda', 'Documentação', 'Status do Sistema', 'Comunidade'],
  Legal: ['Termos de Uso', 'Privacidade', 'Cookies', 'LGPD'],
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/95 backdrop-blur-md border-b shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm">
                <Music className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">ORKESTRANDO</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-sm">
                  Criar Conta
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-3 border-t mt-3 flex gap-3">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Entrar</Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button size="sm" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white">Criar Conta</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 bg-white/15 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Plataforma Acadêmica Inteligente
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight"
            >
              ORKESTRANDO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-teal-100 max-w-2xl mx-auto leading-relaxed"
            >
              A plataforma acadêmica inteligente que transforma a gestão da sua instituição de ensino
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 font-semibold shadow-lg shadow-black/10 h-12 px-8 text-base">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold h-12 px-8 text-base backdrop-blur-sm"
                onClick={() => scrollTo('#how-it-works')}
              >
                <Zap className="mr-2 h-4 w-4" />
                Ver Demonstração
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { value: '500+', label: 'Instituições' },
                { value: '50.000+', label: 'Alunos' },
                { value: '2.000+', label: 'Professores' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-teal-200 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L48 74.7C96 69.3 192 58.7 288 53.3C384 48 480 48 576 50.7C672 53.3 768 58.7 864 58.7C960 58.7 1056 53.3 1152 48C1248 42.7 1344 37.3 1392 34.7L1440 32V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tudo que sua instituição precisa
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Ferramentas poderosas projetadas para simplificar a gestão acadêmica e potencializar os resultados.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <FadeInUp key={feature.title} delay={i * 0.1}>
                <Card className="h-full border-border/60 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 group-hover:from-teal-100 group-hover:to-emerald-100 transition-colors">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Como Funciona</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Comece em três passos simples
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Configurar o ORKESTRANDO é rápido e intuitivo. Sem curvas de aprendizado complexas.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, i) => (
              <FadeInUp key={step.number} delay={i * 0.15}>
                <div className="relative text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white text-xl font-bold shadow-lg shadow-teal-500/25 mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-teal-200" />
                  )}
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES SHOWCASE ── */}
      <section id="modules" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Módulos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Conheça nossos módulos
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Cada módulo é cuidadosamente projetado para atender uma necessidade específica da sua instituição.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULE_SHOWCASE.map((mod, i) => (
              <FadeInUp key={mod.title} delay={i * 0.08}>
                <div className="group rounded-2xl overflow-hidden border border-border/60 hover:shadow-xl transition-all duration-300">
                  <div className={`h-44 bg-gradient-to-br ${mod.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_transparent_70%)]" />
                    <mod.icon className="h-16 w-16 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="p-5 bg-background">
                    <h3 className="font-semibold text-lg mb-1">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground">{mod.desc}</p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 sm:py-28 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Preços</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Planos para todos os tamanhos
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Comece gratuitamente e evolua conforme sua instituição cresce. Sem surpresas na fatura.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan, i) => (
              <FadeInUp key={plan.name} delay={i * 0.1}>
                <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-teal-300 shadow-lg shadow-teal-500/10 scale-[1.02]' : 'border-border/60'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md px-3">
                        POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2 pt-6">
                    <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.maxStudents}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2.5 flex-1 mt-2">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`mt-6 w-full ${plan.popular
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md shadow-teal-500/20'
                        : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Depoimentos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              O que dizem nossos clientes
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Instituições de todo o Brasil já confiam no ORKESTRANDO para gerenciar sua vida acadêmica.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeInUp key={t.name} delay={i * 0.1}>
                <Card className="h-full border-border/60">
                  <CardContent className="pt-6">
                    <Quote className="h-8 w-8 text-teal-300 mb-4" />
                    <p className="text-sm leading-relaxed text-muted-foreground mb-6">{t.quote}</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-semibold">{t.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.06)_0%,_transparent_70%)]" />
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Pronto para transformar sua gestão acadêmica?
            </h2>
            <p className="mt-4 text-lg text-teal-100 max-w-2xl mx-auto">
              Junte-se a mais de 500 instituições que já utilizam o ORKESTRANDO para oferecer a melhor experiência acadêmica.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 font-semibold shadow-lg h-12 px-8 text-base">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold h-12 px-8 text-base backdrop-blur-sm"
              >
                Falar com Especialista
              </Button>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 text-white">
                  <Music className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">ORKESTRANDO</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                A plataforma acadêmica inteligente para instituições de ensino que buscam excelência na gestão.
              </p>
              <div className="flex gap-4 mt-6">
                {[
                  { icon: Globe, label: 'Website' },
                  { icon: MessageSquare, label: 'Contato' },
                  { icon: Lock, label: 'Segurança' },
                ].map((s) => (
                  <button key={s.label} className="text-muted-foreground hover:text-teal-600 transition-colors" title={s.label}>
                    <s.icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Link groups */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-semibold mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 ORKESTRANDO. Todos os direitos reservados.</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Feito com</span>
              <span className="text-teal-600">♥</span>
              <span>no Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
