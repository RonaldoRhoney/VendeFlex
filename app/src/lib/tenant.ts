// Tenant atual guardado como singleton em módulo, não Context/Provider —
// Painel.tsx só renderiza os módulos filhos (AdminShell + telas) depois que
// sessão + tenant já foram resolvidos, então todo hook/função de mutação
// dos *Store.ts pode ler isto com segurança, sem precisar de tenant_id como
// argumento em toda chamada (mesmo espírito de lib/localStore.ts, que
// também nunca usou Context).
interface TenantAtual {
  tenantId: string
  papel: string
  userId: string
}

let tenantAtual: TenantAtual | null = null

export function definirTenantAtual(tenantId: string, papel: string, userId: string) {
  tenantAtual = { tenantId, papel, userId }
}

export function obterTenantAtual(): TenantAtual | null {
  return tenantAtual
}

export function limparTenantAtual() {
  tenantAtual = null
}
