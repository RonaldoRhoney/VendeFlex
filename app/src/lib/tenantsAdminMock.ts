// Dados fake — só pra este painel (Central Administrativa RhoneyInc,
// Cap. 19 do PRD). Diferente do resto do app (que simula UM negócio só, o
// tenant do lojista logado), aqui simulamos VÁRIOS tenants na plataforma,
// já que o objetivo desta tela é a visão cross-tenant da equipe RhoneyInc.
export interface TenantAdmin {
  id: string
  nomeNegocio: string
  segmento: string
  plano: 'free' | 'basico' | 'premium' | 'enterprise'
  status: 'ativo' | 'inativo'
  criadoEm: string
}

export const TENANTS_ADMIN_MOCK: TenantAdmin[] = [
  { id: 't-1', nomeNegocio: 'Loja da Marcela', segmento: 'Cosméticos', plano: 'free', status: 'ativo', criadoEm: '2026-06-02' },
  { id: 't-2', nomeNegocio: 'Mercadinho do Roberto', segmento: 'Mercadinho', plano: 'basico', status: 'ativo', criadoEm: '2026-05-18' },
  { id: 't-3', nomeNegocio: 'Duas Lojas Camila', segmento: 'Loja de roupas', plano: 'premium', status: 'ativo', criadoEm: '2026-04-30' },
  { id: 't-4', nomeNegocio: 'Papelaria Central', segmento: 'Papelaria', plano: 'basico', status: 'ativo', criadoEm: '2026-07-01' },
  { id: 't-5', nomeNegocio: 'Farmácia Bem-Estar', segmento: 'Farmácia', plano: 'enterprise', status: 'ativo', criadoEm: '2026-03-14' },
  { id: 't-6', nomeNegocio: 'Auto Peças Veloz', segmento: 'Autopeças', plano: 'free', status: 'inativo', criadoEm: '2026-02-20' },
  { id: 't-7', nomeNegocio: 'Pet Shop Amigo Fiel', segmento: 'Pet Shop', plano: 'basico', status: 'ativo', criadoEm: '2026-07-20' },
  { id: 't-8', nomeNegocio: 'Açougue Boi Bom', segmento: 'Açougue', plano: 'free', status: 'ativo', criadoEm: '2026-07-28' },
]
