import type { ReactNode } from 'react'
import Footer from '../components/Footer'
import HeaderInstitucional from '../components/HeaderInstitucional'

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-lg font-semibold mb-2">{titulo}</h2>
      <div className="text-black/60 dark:text-white/60 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function PoliticaPrivacidade() {
  return (
    <div className="flex flex-col min-h-dvh">
      <HeaderInstitucional />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <h1 className="font-display text-3xl font-semibold mb-2">Política de Privacidade</h1>
        <p className="text-black/40 dark:text-white/40 text-xs mb-10">Última atualização: agosto de 2026</p>

        <Secao titulo="1. Fase atual do produto">
          <p>
            O VendeFlex é um produto RhoneyInc em desenvolvimento. Nesta fase, o painel administrativo funciona com
            dados de demonstração salvos apenas no navegador do próprio usuário (<code>localStorage</code>), sem envio
            a nenhum servidor — nada digitado no cadastro de produtos, vendas, estoque ou financeiro sai do seu
            aparelho hoje. Esta política descreve como os dados <strong>serão</strong> tratados a partir do momento em
            que o backend (autenticação, banco de dados e planos pagos) entrar em produção, para que o compromisso já
            esteja público e auditável antes do lançamento.
          </p>
        </Secao>

        <Secao titulo="2. Quem somos">
          <p>
            O VendeFlex é desenvolvido pela RhoneyInc, estúdio de engenharia de software sediado em Belém do Pará,
            Brasil. Esta política se aplica a quem cria uma conta de negócio no VendeFlex (o "dono") e às pessoas que
            esse negócio convida para usar o sistema com um papel específico — financeiro, estoquista ou vendedor.
          </p>
        </Secao>

        <Secao titulo="3. Dados que coletamos">
          <p><strong>Dados da conta e do negócio:</strong> nome, e-mail e senha (ou login social) de cada usuário; nome do negócio, CNPJ/CPF, segmento de atuação e plano contratado.</p>
          <p><strong>Dados operacionais do negócio:</strong> produtos, categorias, fornecedores, compras, vendas, movimentações de estoque e caixa cadastrados pelo dono e sua equipe. Esses dados pertencem ao negócio que os criou e nunca ficam visíveis para outro tenant do VendeFlex — cada conta enxerga só os próprios dados.</p>
          <p><strong>Dados de acesso:</strong> registros de uso do sistema (quem fez o quê e quando) para fins de auditoria interna do próprio negócio. Não armazenamos endereço IP nesses registros.</p>
          <p>O VendeFlex não coleta, hoje, dados de clientes finais do lojista (o produto é uma ferramenta de gestão interna, não uma vitrine pública).</p>
        </Secao>

        <Secao titulo="4. Para que usamos os dados">
          <p>
            Para operar o sistema (login, permissões por papel, cálculo de estoque e indicadores), para dar suporte
            técnico quando solicitado, e para manter um registro de auditoria que permite ao próprio dono do negócio
            rastrear alterações feitas por sua equipe. Não usamos os dados operacionais do negócio para nenhuma
            finalidade fora do próprio VendeFlex.
          </p>
        </Secao>

        <Secao titulo="5. Com quem compartilhamos">
          <p>
            Os dados serão hospedados na Supabase (banco de dados e autenticação) e na Vercel (hospedagem da
            aplicação), ambos processadores contratados pela RhoneyInc sob acordo de proteção de dados. O VendeFlex
            não usa nenhuma inteligência artificial de terceiros para processar dados do negócio hoje. Se isso mudar
            no futuro (ex.: sugestões automáticas de cadastro), esta política será atualizada antes do recurso entrar
            no ar, com aviso destacado e opção de consentimento, conforme a política de IA da RhoneyInc. Nunca
            vendemos ou alugamos dados de nenhum negócio a terceiros.
          </p>
        </Secao>

        <Secao titulo="6. Seus direitos (LGPD)">
          <p>
            Você pode solicitar a qualquer momento a exportação, correção ou exclusão dos seus dados e dos dados do
            seu negócio, e o encerramento completo da conta. Pedidos são feitos pelo canal de contato abaixo e
            respondidos em até 15 dias.
          </p>
        </Secao>

        <Secao titulo="7. Retenção">
          <p>
            Dados de conta e do negócio são mantidos enquanto a conta estiver ativa. Ao encerrar a conta, os dados
            operacionais são apagados em até 30 dias, exceto registros que a lei exija manter por mais tempo (ex.:
            documentos fiscais).
          </p>
        </Secao>

        <Secao titulo="8. Segurança e auditoria">
          <p>
            O acesso aos dados de cada negócio é restrito por papel (dono, financeiro, estoquista, vendedor) e
            isolado por conta — nenhum negócio acessa dado de outro. Alterações em dados sensíveis (produtos, estoque,
            vendas, compras) geram um registro de auditoria imutável, visível ao dono da conta, que nunca armazena
            endereço IP.
          </p>
        </Secao>

        <Secao titulo="9. Crianças e adolescentes">
          <p>O VendeFlex é uma ferramenta de gestão comercial voltada a donos de negócio maiores de 18 anos. Não coletamos intencionalmente dados de menores de idade.</p>
        </Secao>

        <Secao titulo="10. Alterações desta política">
          <p>Podemos atualizar esta política conforme o VendeFlex evolui. Mudanças relevantes serão avisadas dentro do próprio painel.</p>
        </Secao>

        <Secao titulo="11. Contato">
          <p>
            Dúvidas sobre privacidade ou pedidos relacionados aos seus dados:{' '}
            <a href="mailto:rhoneyinc@gmail.com" className="text-brand hover:underline">rhoneyinc@gmail.com</a>.
          </p>
        </Secao>
      </main>
      <Footer />
    </div>
  )
}
