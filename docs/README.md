# 📋 Guia de Estados do Motorista

## Visão Geral

O sistema **FleetControl** gerencia motoristas através de **três camadas de estado** independentes. Entender esses estados é essencial para usar o sistema corretamente.

---

## 🏗️ As Três Camadas de Estado


---

## 📖 Explicação Detalhada de Cada Estado

### 1. Existência no Sistema (`is_active`)

| Valor | Significado | Quando Usar |
|-------|-------------|-------------|
| `true` | Motorista ativo no sistema | Padrão para todos os motoristas válidos |
| `false` | Motorista "apagado" | Erro de cadastro, duplicidade, ou exclusão definitiva |

> ⚠️ **Importante**: Motoristas com `is_active = false` **não aparecem em nenhum relatório**, estatística ou lista. É como se não existissem.

---

### 2. Status Contratual (`status`)

Define a **relação jurídica** do motorista com a empresa.

#### 🟢 `active` (Ativo)
- **Significado**: Contrato de trabalho em vigor.
- **Pode trabalhar?** Sim.
- **Tem availability?** Sim, pode estar `available`, `on_trip` ou `offline`.
- **Exemplo**: João Silva, contrato normal, trabalha todos os dias.

#### 🟡 `on_leave` (De Licença)
- **Significado**: Afastado temporariamente da empresa.
- **Pode trabalhar?** Não.
- **Availability**: Sempre `offline` (forçado pelo sistema).
- **Quando usar**: Férias, licença médica, licença maternidade/paternidade, afastamento temporário.
- **Exemplo**: Maria Santos está de férias por 30 dias.

#### ⚫ `terminated` (Desligado/Encerrado)
- **Significado**: Contrato de trabalho terminado.
- **Pode trabalhar?** Não.
- **Availability**: Sempre `offline` (forçado pelo sistema).
- **Quando usar**: Demissão, rescisão contratual, aposentadoria, fim de contrato por prazo determinado.
- **Exemplo**: Pedro Oliveira foi desligado em janeiro, mas o registro é preservado para histórico.

> 💡 **Por que preservar `terminated`?** Para manter histórico de viagens, custos e estatísticas passadas. Não se apaga o registro, apenas se marca como desligado.

---

### 3. Disponibilidade Operacional (`availability`)

Define **o que o motorista está fazendo agora**, em tempo real.  
**Apenas válido para motoristas `active`**.

#### 🟢 `available` (Disponível)
- **Significado**: Pronto para iniciar uma nova viagem.
- **Está trabalhando?** Não, mas pode começar imediatamente.
- **Exemplo**: Motorista chegou ao depósito, aguardando próxima entrega.

#### 🔵 `on_trip` (Em Viagem)
- **Significado**: Atualmente executando uma viagem.
- **Está trabalhando?** Sim, em rota.
- **Como é determinado?** Automaticamente pelo sistema quando uma viagem é iniciada.
- **Exemplo**: Motorista saiu às 08:00 para entrega em Luanda, ainda não retornou.

#### ⚪ `offline` (Indisponível)
- **Significado**: Ativo contratualmente, mas não pode trabalhar no momento.
- **Está trabalhando?** Não.
- **Exemplos de uso**: Doença não formalizada como licença, manutenção do veículo atribuído, pausa regulamentar, ou qualquer outro impedimento temporário.

---

## 🔗 Regras de Combinação

### Combinações VÁLIDAS

| `status` | `availability` | Significado | Situação Real |
|----------|----------------|-------------|---------------|
| `active` | `available` | Ativo e pronto | Pode receber viagem agora |
| `active` | `on_trip` | Ativo e trabalhando | Executando viagem agora |
| `active` | `offline` | Ativo mas indisponível | Não pode receber viagem agora |
| `on_leave` | `offline` | De licença | Afastado, não trabalha |
| `terminated` | `offline` | Desligado | Não trabalha mais na empresa |

### Combinações INVÁLIDAS (bloqueadas pelo sistema)

| Combinação | Por que é inválida |
|------------|------------------|
| `on_leave` + `available` | Quem está de licença não pode estar disponível |
| `on_leave` + `on_trip` | Quem está de licença não pode estar em viagem |
| `terminated` + `available` | Desligado não pode estar disponível |
| `terminated` + `on_trip` | Desligado não pode estar em viagem |
| `on_leave`/`terminated` + qualquer coisa além de `offline` | Regra de negócio: afastados/desligados = sempre offline |

---

## 📊 Como Isso Aparece nos Relatórios

### Relatório de Motoristas

O relatório de motoristas mostra duas perspectivas:

#### 1. Visão Contratual (todos os motoristas `is_active = true`)
Total de Motoristas: 15
├── Ativos:      10 (🟢 contratos em vigor)
├── De Licença:   2 (🟡 afastados temporariamente)
└── Desligados:   3 (⚫ contratos encerrados)


#### 2. Visão Operacional (apenas os 10 `active`)
Disponibilidade dos Ativos:
├── Disponíveis:  6 (🟢 prontos para viagem)
├── Em Viagem:    3 (🔵 atualmente em rota)
└── Indisponíveis: 1 (⚪ ativos mas offline)


### Cenário 1: Contratação de Novo Motorista
1.Cadastro no sistema
└── is_active = true, status = active, availability = available
2.Primeira viagem atribuída
└── availability muda para: on_trip
3.Viagem concluída
└── availability retorna para: available


### Cenário 2: Motorista Vai de Férias
1.Motorista ativo e disponível
└── status = active, availability = available
2.Registro de licença/férias
└── status muda para: on_leave
└── availability forçada para: offline (automático)
3.Retorno das férias
└── status retorna para: active
└── availability pode ser: available ou offline (manual)


### Cenário 3: Desligamento de Motorista
1.Motorista ativo (em qualquer availability)
2.Processo de desligamento
└── status muda para: terminated
└── availability forçada para: offline (automático)
3.Preservação de histórico
└── Motorista continua em relatórios históricos
└── Mas não aparece em listas operacionais
---

## ❓ Perguntas Frequentes (FAQ)

### Q: Por que não apago motoristas desligados em vez de marcar `terminated`?

**R:** Para preservar o histórico. Se apagar, perde-se:
- Histórico de viagens realizadas
- Custos associados (salários, combustível, multas)
- Estatísticas de produtividade
- Registros legais/fiscais

O correto é marcar como `terminated`. Ele some das listas operacionais, mas permanece no histórico.

---

### Q: Qual a diferença entre `on_leave` e `offline`?

**R:** 
- `on_leave` = **Status contratual**. O motorista está afastado formalmente (férias, licença). É uma situação prevista em lei/contracto.
- `offline` = **Availability operacional**. O motorista está ativo, mas não pode trabalhar hoje/agora (doença informal, veículo quebrado, etc.).

---

### Q: Posso ter um motorista `terminated` com viagens recentes?

**R:** Sim. O motorista pode ter trabalhado até ontem, sido desligado hoje (`terminated`), e suas viagens de ontem ainda aparecem nos relatórios do período. Isso é correto e esperado.

---

### Q: O que acontece se eu marcar `is_active = false`?

**R:** O motorista desaparece completamente:
- Não aparece na lista de motoristas
- Não aparece em relatórios (nem históricos!)
- Não pode ser selecionado para viagens
- Estatísticas dele são excluídas de totais

Use apenas para erros de cadastro. Para desligamentos normais, use `status = terminated`.

---

### Q: Como o sistema sabe que um motorista está `on_trip`?

**R:** Automaticamente. Quando uma viagem é iniciada e atribuída a um motorista, o sistema muda sua `availability` para `on_trip`. Quando a viagem é finalizada, retorna para `available` (ou `offline`, se configurado).

---

## 🎯 Resumo para o Dia a Dia

| Você quer... | Use o campo... | Valor... |
|--------------|----------------|----------|
| Ver quem pode trabalhar hoje | `availability` | `available` |
| Ver quem está trabalhando agora | `availability` | `on_trip` |
| Ver quem está de férias | `status` | `on_leave` |
| Ver quem foi desligado | `status` | `terminated` |
| "Apagar" erro de cadastro | `is_active` | `false` |
| Ver histórico completo | `is_active` | `true` (todos) |

---

## 📞 Suporte

Em caso de dúvidas sobre estados de motoristas, entre em contato com o administrador do sistema ou consulte a documentação técnica completa em `docs/TECHNICAL.md`.