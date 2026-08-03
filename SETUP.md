# VendeFlex — notas de setup e pendências

## Fase atual

Frontend com dados mockados (`localStorage`, zero Supabase real conectado) + schema de backend (Supabase) já desenhado em `supabase/migrations/` (0001 a 0006), mas **ainda não ligado ao app** — `lib/supabaseClient.ts` mantém `DB_READY = false`. Ver `docs/02_Arquitetura.md` (seção 8) pro mapa completo das migrations. Ver `.claude`/histórico de sessão pro plano completo aprovado.

## Pendências para quando o backend/autenticação forem desenhados

- **Trigger admin padrão RhoneyInc** (skill `admin-padrao`): ✅ já implementado em `0001_nucleo_tenants_auth.sql` (`handle_new_user()`), garantindo que `rhoneyinc@gmail.com` seja promovido a admin automaticamente. Referência: RhoneyInc hub (`schema.sql`).
- **Google Play policies**: quando o leitor de código de barras via câmera (RF-PDV-01) for implementado, exigir consentimento em destaque antes do primeiro uso. Política de Privacidade/Termos de Uso completos (hoje só stubs) devem ser publicados antes de qualquer coleta real de dados.
- **Login real**: `Login.tsx` hoje é só visual; schema de auth (`tenants`/`usuarios_tenant`/`profiles`) já existe em `0001_nucleo_tenants_auth.sql`, mas o frontend ainda não chama Supabase Auth — falta ligar `Login.tsx`/`Painel.tsx` de fato (SSO RhoneyInc) quando essa fase começar.
- **Login do Painel Administrativo RhoneyInc**: `pages/plataforma/LoginPlataforma.tsx` também é só visual (sessão fake em `localStorage`, chave `vendeflex.plataforma.sessao`) — quando o backend for ligado, vira checagem real de `is_platform_admin()` (já existe em `0001_nucleo_tenants_auth.sql`) em vez de um simples toggle local.
- **Segmentos MVP sem paleta confirmada**: 4 dos 8 segmentos MVP (Autopeças, Cosméticos, Mercadinho, Açougue) têm paleta extrapolada por analogia em `app/src/lib/segmentThemes.ts` (`extrapolated: true`) — confirmar com design antes de considerar final.
- **Regra dos 75% do Onboarding** (Cap. 6.2 do PRD): ainda não implementada — o `Onboarding.tsx` atual só escolhe segmento/tema, não tem a barra de progresso por campo obrigatório nem os demais passos (filial, usuários, estoque inicial, caixa, tour guiado).
- **Desconto do PDV sem limite por papel**: `PDV.tsx` (RF-PDV-03) aplica desconto por venda sem checar permissão de quem está logado — decisão adiada explicitamente por não existir ainda sistema de papéis/permissão no frontend (o schema já modela os 4 papéis em `usuarios_tenant`, mas o PDV ainda não consulta isso); revisar quando `Configuracoes.tsx` (usuários/papéis) virar backend real.
- **Todos os cadastros/movimentos usam `localStorage`, não banco**: `lib/localStore.ts` (fábrica genérica) e os stores que a usam (`produtosStore.ts`, `categoriasStore.ts`, `fornecedoresStore.ts`, `comprasStore.ts`, `estoqueStore.ts`, `vendasStore.ts`) + dados do negócio em `Configuracoes.tsx` são a única "persistência" hoje. O schema real já existe (`supabase/migrations/0001` a `0006` — `produtos`, `categorias`, `fornecedores`, `compras`, `estoque_movimentos`, `vendas`, `tenants`), falta só religar cada store à RPC/tabela correspondente em vez de `localStorage`.
- **Estoque com múltiplas filiais**: `0002_produtos_categorias_marcas.sql` guarda `estoque_atual`/`estoque_minimo` direto em `produtos` (sem tabela `estoque_saldo` por filial) — decisão adiada explicitamente porque o frontend não tem conceito de múltiplas filiais ainda (V2 do Cap. 4.2 do PRD).

## Agentes de suporte ao projeto

Ficam em `VendeFlex/.claude/agents/` (próprios do repositório, não compartilhados com outros produtos da família), cada um com um papel único — usar proativamente conforme a descrição de cada `.md`:
- `vendeflex-docs` — mantém este arquivo e `docs/02_Arquitetura.md` atualizados a cada módulo novo/alterado.
- `vendeflex-security` — auditoria de segurança (hoje focado em não pressupor confiança que ainda não existe; escopo cresce quando o backend for criado).
- `vendeflex-interacao` — consistência de UX/Design System (Cap. 12 do PRD) entre módulos.
- `vendeflex-regras-negocio` — aderência aos Requisitos Funcionais (RF-XXX) do PRD por módulo.
