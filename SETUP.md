# VendeFlex — notas de setup e pendências

## Fase atual

Scaffold inicial do frontend (só interface, dados mockados, zero backend/Supabase real). Ver `.claude`/histórico de sessão pro plano completo aprovado.

## Pendências para quando o backend/autenticação forem desenhados

- **Trigger admin padrão RhoneyInc** (skill `admin-padrao`): quando o schema de autenticação for criado, garantir que `rhoneyinc@gmail.com` seja promovido a admin automaticamente via trigger (`handle_new_user()`), não manualmente. Referência: RhoneyInc hub (`schema.sql`).
- **Google Play policies**: quando o leitor de código de barras via câmera (RF-PDV-01) for implementado, exigir consentimento em destaque antes do primeiro uso. Política de Privacidade/Termos de Uso completos (hoje só stubs) devem ser publicados antes de qualquer coleta real de dados.
- **Login real**: `Login.tsx` hoje é só visual; substituir por Supabase Auth compartilhado (SSO RhoneyInc) quando o backend existir.
- **Segmentos MVP sem paleta confirmada**: 4 dos 8 segmentos MVP (Autopeças, Cosméticos, Mercadinho, Açougue) têm paleta extrapolada por analogia em `app/src/lib/segmentThemes.ts` (`extrapolated: true`) — confirmar com design antes de considerar final.
