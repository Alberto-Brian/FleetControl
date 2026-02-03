
Na seed, configurar uma maneira de separar os dados que podem ir para a produção como dados iniciais. tipo uma flag nas tabelas.

2. Resolver 

## Padronização de erros traduzíveis (IPC → Frontend)

- Objetivo: capturar erros gerados no processo principal, propagá-los ao renderer e traduzi-los via i18n para exibir mensagens amigáveis ao usuário.

### Passos

- Listener (main)
  - Lançar `Error` com chave de tradução em vez de texto literal.
  - Exemplo: ver [vehicle-categories-listeners.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/db/vehicle_categories/vehicle-categories-listeners.ts#L31-L35) onde a verificação de duplicidade lança `"vehicles.errors.vehicleCategoryAlreadyExists"`.

- Contexto IPC (preload)
  - Garantir que o método exposto via `ipcRenderer.invoke` exista para o módulo.
  - Referência: [vehicle-categories-context.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/db/vehicle_categories/vehicle-categories-context.ts#L16-L21).

- Helper do renderer
  - Normalizar mensagem do Electron: extrair a última parte após `:` e relançar um `Error` contendo apenas a chave de tradução.
  - Exemplo: [vehicle-category-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/vehicle-category-helpers.ts#L16-L24) relança `new Error(key || 'vehicles.errors.createVehicleCategory')`.

- Componente UI
  - Em `catch`, usar `t(error.message || 'vehicles.errors.createVehicleCategory')` para traduzir e exibir em toast ou feedback.
  - Exemplo: [NewVehicleCategoryDialog.tsx](file:///c:/projects/FLEETCONTROL/src/components/vehicle-category/NewVehicleCategoryDialog.tsx#L49-L53).

- i18n
  - Centralizar por módulo. As chaves do módulo `vehicles` ficam em [vehicles_translations.ts](file:///c:/projects/FLEETCONTROL/src/localization/vehicles_translations.ts).
  - Exemplo de chaves:
    - en.vehicles.errors.vehicleCategoryAlreadyExists / en.vehicles.errors.createVehicleCategory
    - pt.vehicles.errors.vehicleCategoryAlreadyExists / pt.vehicles.errors.createVehicleCategory
  - O i18n injeta `vehicles: vehicleTranslations.<lang>.vehicles`: [i18n.ts](file:///c:/projects/FLEETCONTROL/src/localization/i18n.ts#L8-L10,L35-L37).

### Convenções

- Prefira o namespace por módulo: `vehicles.errors.*`, `clients.errors.*`, etc.
- Use nomes descritivos e estáveis: `<módulo>.errors.<Regra/Ação>`, por exemplo:
  - `vehicles.errors.vehicleCategoryAlreadyExists`
  - `vehicles.errors.vehicleAlreadyExists`
  - `clients.errors.clientEmailAlreadyExists`
  - `vehicles.errors.createVehicleCategory`

### Checklist para repetir em outros módulos

- [ ] No listener, validar regra e `throw new Error('<modulo>.errors.<chave>')`.
- [ ] No helper do renderer, normalizar mensagem do Electron (extrair chave pós `:`) e relançar.
- [ ] No componente, em `catch`, usar `t(error.message || '<modulo>.errors.<fallback>')`.
- [ ] Adicionar chaves no arquivo de traduções do módulo (`*translations.ts`) e injetar no i18n.
- [ ] Testar criando um registro duplicado e observar toast traduzido.

### Módulos candidatos

- Veículos: [vehicles-listeners.ts] e [vehicle-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/vehicle-helpers.ts)
- Clientes: [clients-listeners.ts] e [client-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/client-helpers.ts)
- Oficinas, Multas, Abastecimentos, Manutenções e demais módulos sob `src/helpers/ipc/db/*`.
