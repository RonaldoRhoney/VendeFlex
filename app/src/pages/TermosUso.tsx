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

export default function TermosUso() {
  return (
    <div className="flex flex-col min-h-dvh">
      <HeaderInstitucional />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <h1 className="font-display text-3xl font-semibold mb-2">Termos de Uso</h1>
        <p className="text-black/40 dark:text-white/40 text-xs mb-10">Última atualização: agosto de 2026</p>

        <Secao titulo="1. O que é o VendeFlex">
          <p>
            O VendeFlex é um sistema de gestão comercial e de estoque multissegmento, desenvolvido pela RhoneyInc, que
            adapta a experiência de cadastro e os indicadores ao tipo de negócio do usuário (varejo, alimentação,
            serviços, entre outros). Nesta fase, o produto está em desenvolvimento: o painel funciona com dados de
            demonstração salvos apenas no navegador, sem autenticação ou cobrança reais.
          </p>
        </Secao>

        <Secao titulo="2. Cadastro do negócio e da equipe">
          <p>
            Quando o cadastro real entrar no ar, quem cria a conta se torna o "dono" do negócio e pode convidar outras
            pessoas com um papel específico: financeiro, estoquista ou vendedor. Cada papel tem acesso a telas e ações
            diferentes dentro do painel — por exemplo, apenas dono e financeiro podem cancelar uma venda, e apenas
            dono e estoquista podem fazer ajuste manual de estoque. O dono é responsável por manter os dados de
            cadastro corretos e por gerenciar quem tem acesso à sua conta.
          </p>
        </Secao>

        <Secao titulo="3. Planos e pagamento">
          <p>
            O VendeFlex terá planos com limites e recursos diferentes (incluindo uma opção gratuita). Nesta fase de
            desenvolvimento não há cobrança — nenhum plano pago está ativo. Quando os planos pagos forem lançados,
            valores, formas de pagamento e política de cancelamento serão detalhados nesta página antes da cobrança
            começar a valer.
          </p>
        </Secao>

        <Secao titulo="4. Uso permitido">
          <p>
            O VendeFlex deve ser usado para gestão comercial legítima do próprio negócio cadastrado. É proibido usar o
            sistema para armazenar dados de terceiros sem consentimento deles, para atividade ilegal, ou para tentar
            acessar dados de outro negócio cadastrado na plataforma.
          </p>
        </Secao>

        <Secao titulo="5. Responsabilidades do dono do negócio">
          <p>
            O dono é responsável pela veracidade dos dados cadastrados (produtos, preços, estoque, fiscais) e pelas
            ações realizadas pela sua equipe dentro da conta. A RhoneyInc não se responsabiliza por decisões comerciais
            tomadas com base nos indicadores exibidos no painel, nem por prejuízo decorrente de dado cadastrado
            incorretamente pelo próprio negócio.
          </p>
        </Secao>

        <Secao titulo="6. Limitação de responsabilidade">
          <p>
            O VendeFlex é fornecido "como está". Fazemos o possível para manter o sistema no ar e os dados corretos,
            mas não garantimos disponibilidade ininterrupta. Na medida permitida por lei, a RhoneyInc não se
            responsabiliza por perdas indiretas decorrentes do uso ou da indisponibilidade do sistema.
          </p>
        </Secao>

        <Secao titulo="7. Propriedade intelectual">
          <p>
            O código, design e marca do VendeFlex pertencem à RhoneyInc. Os dados cadastrados pelo negócio (produtos,
            vendas, estoque, clientes) pertencem ao próprio negócio, não à RhoneyInc.
          </p>
        </Secao>

        <Secao titulo="8. Encerramento de conta">
          <p>
            O dono pode encerrar a conta a qualquer momento pelo canal de contato abaixo. A RhoneyInc pode suspender
            contas que violem estes termos, avisando previamente sempre que possível.
          </p>
        </Secao>

        <Secao titulo="9. Alterações destes termos">
          <p>Podemos atualizar estes termos conforme o VendeFlex evolui, especialmente ao lançar autenticação e planos pagos. Mudanças relevantes serão avisadas dentro do painel.</p>
        </Secao>

        <Secao titulo="10. Lei aplicável e contato">
          <p>
            Estes termos são regidos pela lei brasileira. Dúvidas:{' '}
            <a href="mailto:rhoneyinc@gmail.com" className="text-brand hover:underline">rhoneyinc@gmail.com</a>.
          </p>
        </Secao>
      </main>
      <Footer />
    </div>
  )
}
