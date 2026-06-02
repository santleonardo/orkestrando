import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidade – Orkestrando',
}

export default function PrivacyPage() {
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
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Política de Privacidade
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Última atualização: junho de 2025
        </p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Informações que coletamos</h2>
            <p>
              Coletamos dados fornecidos diretamente por você no cadastro (nome, e-mail, telefone e
              número de matrícula), além de informações de uso geradas automaticamente (endereço IP,
              tipo de navegador, páginas visitadas e data/hora de acesso).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Como usamos suas informações</h2>
            <p>Utilizamos os dados coletados para:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Criar e gerenciar sua conta na plataforma;</li>
              <li>Enviar notificações relacionadas às suas aulas e atividades;</li>
              <li>Gerar relatórios de frequência e desempenho acadêmico;</li>
              <li>Melhorar continuamente os recursos e a segurança do sistema.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Compartilhamento de dados</h2>
            <p>
              Seus dados não são vendidos nem compartilhados com terceiros para fins comerciais.
              Podemos compartilhá-los apenas com prestadores de serviço essenciais à operação da
              plataforma (ex.: serviços de hospedagem e envio de e-mail), sempre sob contrato de
              confidencialidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger suas informações
              contra acesso não autorizado, perda ou divulgação indevida — incluindo criptografia de
              senhas, controle de acesso baseado em perfil (RBAC) e registros de auditoria.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Seus direitos (LGPD)</h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode a
              qualquer momento solicitar: acesso, correção, portabilidade ou exclusão dos seus dados
              pessoais. Entre em contato pelo e-mail indicado abaixo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Contato</h2>
            <p>
              Dúvidas sobre esta política? Envie um e-mail para{' '}
              <a
                href="mailto:privacidade@orkestrando.com.br"
                className="text-violet-600 hover:underline"
              >
                privacidade@orkestrando.com.br
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
