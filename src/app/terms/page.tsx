import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso – Orkestrando',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-4">
          <GraduationCap className="h-6 w-6 text-violet-600" />
          <span className="font-semibold text-gray-900">Orkestrando</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Termos de Uso</h1>
        <p className="mb-8 text-sm text-gray-500">
          Última atualização: junho de 2025
        </p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta ou acessar a plataforma Orkestrando, você concorda com estes Termos
              de Uso. Caso não concorde com alguma condição, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Uso permitido</h2>
            <p>A plataforma deve ser utilizada exclusivamente para:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Gestão e acompanhamento de atividades acadêmicas;</li>
              <li>Comunicação entre coordenadores, professores e alunos;</li>
              <li>Acesso a materiais didáticos disponibilizados pela instituição.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Responsabilidades do usuário</h2>
            <p>Você é responsável por:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Manter a confidencialidade de suas credenciais de acesso;</li>
              <li>Não compartilhar sua conta com terceiros;</li>
              <li>Não utilizar a plataforma para fins ilícitos ou prejudiciais a outros usuários;</li>
              <li>Manter seus dados cadastrais atualizados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Propriedade intelectual</h2>
            <p>
              Todo o conteúdo da plataforma — incluindo textos, interfaces, logotipos e código —
              pertence à Orkestrando ou a seus licenciadores. É vedada a reprodução, distribuição ou
              modificação sem autorização expressa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Suspensão e encerramento</h2>
            <p>
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, sem
              aviso prévio, a nosso exclusivo critério.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Alterações nos termos</h2>
            <p>
              Estes termos podem ser atualizados periodicamente. Notificaremos os usuários sobre
              mudanças relevantes por e-mail ou aviso na plataforma. O uso continuado após a
              notificação implica aceite das novas condições.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Contato</h2>
            <p>
              Dúvidas sobre estes termos? Entre em contato pelo e-mail{' '}
              <a
                href="mailto:contato@orkestrando.com.br"
                className="text-violet-600 hover:underline"
              >
                contato@orkestrando.com.br
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t pt-8">
          <Link
            href="/register"
            className="text-sm font-medium text-violet-600 hover:underline"
          >
            ← Voltar para o cadastro
          </Link>
        </div>
      </main>
    </div>
  )
}
