# Padrão de Respostas Tipadas para IPC e Helpers (Plano Futuro)

- Objetivo: substituir erros lançados por respostas tipadas entre processo principal (Electron) e renderer, para simplificar tratamento, tradução e telemetria.

## Motivação

- Evitar dependência do formato de mensagens do Electron.
- Centralizar e padronizar tradução via `errorKey` por módulo.
- Melhorar rastreabilidade (logs/telemetria) sem acoplar UI ao stack de erro.

## Tipos Compartilhados

- Namespace por módulo: `vehicles.errors.*`, `clients.errors.*`, etc.
- Resultado tipado:

```ts
export interface ResultOk<T> { ok: true; data: T }
export interface ResultErr { ok: false; errorKey: string; details?: unknown }
export type Result<T> = ResultOk<T> | ResultErr
```

## Listener (main)

- Não lançar `Error`; retornar `Result`.
- Exemplo (categorias de veículos):

```ts
ipcMain.handle(CREATE_VEHICLE_CATEGORY, async (_, data) => {
  const exists = await findVehcleCategoryByName(data.name)
  if (exists) return { ok: false, errorKey: 'vehicles:errors.vehicleCategoryAlreadyExists' }
  const cat = await createVehicleCategory(data)
  return { ok: true, data: cat }
})
```

## Preload (context)

- Apenas repassar `invoke` e manter o tipo:

```ts
contextBridge.exposeInMainWorld('_vehicle_categories', {
  create: (data) => ipcRenderer.invoke(CREATE_VEHICLE_CATEGORY, data),
})
```

## Helper (renderer)

- Retornar `Result` sem lançar erro. Se necessário, mapear exceções inesperadas para `ResultErr`:

```ts
export async function createVehicleCategory(data): Promise<Result<IVehicleCategory>> {
  try {
    const res = await window._vehicle_categories.create(data)
    return res as Result<IVehicleCategory>
  } catch (e) {
    // Fallback defensivo para exceções não padronizadas
    return { ok: false, errorKey: 'vehicles:errors.createVehicleCategory', details: e }
  }
}
```

## Componente (UI)

- Traduz chave diretamente:

```ts
const res = await createVehicleCategory(formData)
if (!res.ok) {
  toast({ title: 'Erro', description: t(res.errorKey), variant: 'destructive' })
  return
}
toast({ title: 'Sucesso!', description: t('vehicles.newCategory.success') })
```

## Telemetria e Logs

- Registrar `errorKey` e `details` no main/renderer, conforme necessidade.
- Não exibir mensagens internas do Electron ao usuário.

## Migração Gradual

- Passo 1: Adotar `Result` apenas nos novos listeners e helpers.
- Passo 2: Ajustar componentes para checar `res.ok` ao invés de `try/catch`.
- Passo 3: Migrar listeners existentes de `throw Error('...')` para `ResultErr`.
- Passo 4: Remover normalizações ad-hoc (ex.: extração de `errorKey`).

## Convenções

- `errorKey` sempre no namespace do módulo: `vehicles:errors.<Regra|Ação>`.
- `details` só para logs/suporte, nunca para UI.
- `ResultOk.data` deve conter somente dados necessários para UI.

## Checklist de Adoção

- [ ] Listener retorna `Result<T>` padronizado.
- [ ] Preload repassa o `Result` sem alteração.
- [ ] Helper retorna `Result<T>`; sem `throw`.
- [ ] UI usa `t(errorKey)` e não depende de `Error.message`.
- [ ] Chaves presentes em `*translations.ts` do módulo.
