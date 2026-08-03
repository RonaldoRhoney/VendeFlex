# VendeFlex — notas de setup e pendências

## Fase atual

Scaffold inicial do frontend (só interface, dados mockados, zero backend/Supabase real). Ver `.claude`/histórico de sessão pro plano completo aprovado.

## Pendências para quando o backend/autenticação forem desenhados

- **Trigger admin padrão RhoneyInc** (skill `admin-padrao`): quando o schema de autenticação for criado, garantir que `rhoneyinc@gmail.com` seja promovido a admin automaticamente via trigger (`handle_new_user()`), não manualmente. Referência: RhoneyInc hub (`schema.sql`).
- **Google Play policies**: quando o leitor de código de barras via câmera (RF-PDV-01) for implementado, exigir consentimento em destaque antes do primeiro uso. Política de Privacidade/Termos de Uso completos (hoje só stubs) devem ser publicados antes de qualquer coleta real de dados.
- **Login real**: `Login.tsx` hoje é só visual; substituir por Supabase Auth compartilhado (SSO RhoneyInc) quando o backend existir.
- **Segmentos MVP sem paleta confirmada**: 4 dos 8 segmentos MVP (Autopeças, Cosméticos, Mercadinho, Açougue) têm paleta extrapolada por analogia em `app/src/lib/segmentThemes.ts` (`extrapolated: true`) — confirmar com design antes de considerar final.
- **Regra dos 75% do Onboarding** (Cap. 6.2 do PRD): ainda não implementada — o `Onboarding.tsx` atual só escolhe segmento/tema, não tem a barra de progresso por campo obrigatório nem os demais passos (filial, usuários, estoque inicial, caixa, tour guiado).
- **Desconto do PDV sem limite por papel**: `PDV.tsx` (RF-PDV-03) aplica desconto por venda sem checar permissão de quem está logado — decisão adiada explicitamente por não existir ainda sistema de papéis/permissão; revisar quando `Configuracoes.tsx` (usuários/papéis) virar backend real.
- **Todos os cadastros/movimentos usam `localStorage`, não banco**: `lib/localStore.ts` (fábrica genérica) e os stores que a usam (`produtosStore.ts`, `categoriasStore.ts`, `fornecedoresStore.ts`, `comprasStore.ts`, `estoqueStore.ts`, `vendasStore.ts`) + dados do negócio em `Configuracoes.tsx` são a única "persistência" hoje — candidatos diretos a virar tabela real (`produtos`, `categorias`, `fornecedores`, `compras`, `movimentos_estoque`, `vendas`, `businesses`/`tenants`) quando o schema for desenhado.

## Agentes de suporte ao projeto

Ficam em `VendeFlex/.claude/agents/` (próprios do repositório, não compartilhados com outros produtos da família), cada um com um papel único — usar proativamente conforme a descrição de cada `.md`:
- `vendeflex-docs` — mantém este arquivo e `docs/02_Arquitetura.md` atualizados a cada módulo novo/alterado.
- `vendeflex-security` — auditoria de segurança (hoje focado em não pressupor confiança que ainda não existe; escopo cresce quando o backend for criado).
- `vendeflex-interacao` — consistência de UX/Design System (Cap. 12 do PRD) entre módulos.
- `vendeflex-regras-negocio` — aderência aos Requisitos Funcionais (RF-XXX) do PRD por módulo.
