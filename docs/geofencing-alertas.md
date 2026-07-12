# Geofencing & Alertas GPS — Manual do Utilizador

> Versão 1.0 · FleetControl Desktop · Julho 2026

---

## O que é o Geofencing?

O geofencing permite definir zonas geográficas virtuais no mapa — círculos ou polígonos — e receber alertas automáticos sempre que um veículo da sua frota entre, saia ou ultrapasse o limite de velocidade configurado nessa zona.

---

## Novas Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Zonas geográficas** | Crie círculos e polígonos directamente no mapa |
| **Alertas em tempo real** | Notificação imediata de entrada, saída ou velocidade excessiva |
| **Painel de alertas** | Histórico completo com confirmação individual ou em massa |
| **Notificações nativas** | Alertas do Windows mesmo com a janela minimizada |
| **Ferramenta de desenho** | Desenho livre no mapa sem plugins externos |
| **Retenção automática** | Limpeza automática de dados antigos (configurável) |

---

## Zonas Geográficas

### Abrir o painel de zonas

1. Abra o separador **Rastreamento**
2. Clique no botão **Zonas** (ícone de pentágono) na barra de ferramentas do mapa
3. O painel abre-se à esquerda do mapa

### Criar uma zona circular

1. No painel, clique em **Nova Zona → Círculo**
2. No mapa, **clique e arraste** para definir o círculo:
   - Ponto de início = centro da zona
   - Distância do arrasto = raio da zona
3. Solte o rato para confirmar o desenho
4. Preencha o formulário:
   - **Nome** (obrigatório)
   - **Limite de velocidade** em km/h (opcional — activa alertas de velocidade)
   - **Dispositivos** a monitorizar nesta zona
5. Clique em **Guardar**

> **Nota:** Se arrastar menos de 10 metros, o desenho é cancelado automaticamente.

### Criar uma zona poligonal

1. No painel, clique em **Nova Zona → Polígono**
2. No mapa, **clique** para adicionar cada vértice do polígono
3. **Duplo-clique** para terminar o desenho (mínimo de 3 pontos)
4. Preencha o formulário e clique em **Guardar**

> **Dica:** O polígono fecha-se automaticamente ao ligar o último ponto ao primeiro.

### Editar uma zona

1. No painel de zonas, localize a zona na lista
2. Clique em **Editar** (ícone de lápis)
3. Altere o nome, limite de velocidade ou dispositivos
4. Clique em **Guardar**

> A forma geométrica (área WKT) não é editável após criação. Para mudar a forma, elimine e recrie a zona.

### Eliminar uma zona

1. No painel de zonas, clique em **Eliminar** (ícone de lixo)
2. Confirme na caixa de diálogo

> ⚠️ **Atenção:** Esta acção é irreversível e remove a zona do servidor Traccar imediatamente.

---

## Alertas

### Abrir o painel de alertas

Clique no botão **Alertas** (ícone de sino) na barra de ferramentas. Se houver alertas por confirmar, verá um **badge vermelho** com a contagem.

### Tipos de alerta

| Tipo | Descrição | Cor |
|---|---|---|
| **Entrada** | Veículo entrou numa zona | 🟢 Verde |
| **Saída** | Veículo saiu de uma zona | 🟡 Âmbar |
| **Velocidade** | Veículo excedeu o limite configurado | 🔴 Vermelho |

### Confirmar alertas

Confirmar indica que o alerta foi visto e tratado. Os alertas confirmados aparecem em tom mais suave na lista.

**Individualmente:** Clique no botão de visto (✓) ao lado do alerta.

**Todos de uma vez:** Clique em **Confirmar Todos** no topo do painel. Apenas os alertas ainda não confirmados são afectados.

### Cooldown entre alertas

Para evitar notificações repetitivas, o sistema aplica um intervalo mínimo entre alertas do mesmo tipo para o mesmo dispositivo na mesma zona.

O intervalo é configurável em **Definições → Alertas GPS**.

---

## Notificações do Sistema Operativo

O FleetControl pode mostrar notificações nativas do Windows mesmo quando a janela está minimizada.

### Activar notificações

Na primeira vez que abre o FleetControl, surge uma caixa de diálogo a pedir permissão. Clique em **Permitir**.

Se recusou ou as notificações não aparecem:
- Abra as **Definições do Windows → Sistema → Notificações**
- Certifique-se que **FleetControl** está com notificações activadas

### Formato da notificação

```
FleetControl — Entrou na zona
Device #42 · Armazém Central · 65 km/h
```

A notificação contém: tipo de evento, identificador do dispositivo, nome da zona e velocidade (quando aplicável).

---

## Configurações de Alertas GPS

Aceda em **Definições** (ícone de roda dentada) **→ Alertas GPS**.

| Opção | Descrição | Padrão |
|---|---|---|
| Notificação ao entrar | Notificação nativa quando um veículo entra numa zona | Activado |
| Notificação ao sair | Notificação nativa quando um veículo sai de uma zona | Activado |
| Notificação de velocidade | Notificação nativa quando um veículo excede o limite | Activado |
| Intervalo mínimo (velocidade) | Segundos entre alertas de velocidade para o mesmo dispositivo/zona | 60 s |
| Retenção de alertas | Dias até os alertas serem eliminados automaticamente | 90 dias |
| Retenção de posições | Dias até o histórico de posições GPS ser eliminado | 30 dias |

> As definições são por organização. As alterações aplicam-se imediatamente a todos os utilizadores da mesma organização.

---

## Perguntas Frequentes

**A zona aparece no mapa mas não estou a receber alertas — porquê?**
Verifique se os dispositivos estão associados à zona (campo "Dispositivos" no formulário). Um dispositivo não associado não gera alertas para essa zona.

**O badge do sino não desaparece — o que fazer?**
Abra o painel de alertas e clique em **Confirmar Todos**. O badge só desaparece quando todos os alertas estiverem confirmados.

**Não vejo o botão Zonas/Alertas na toolbar — porquê?**
Os botões ficam visíveis apenas quando está conectado à API. Verifique o indicador de conexão (ponto verde/vermelho) na toolbar.

**Criei uma zona mas ela não aparece no mapa — o que aconteceu?**
Pode ser necessário sincronizar: abra o painel de zonas e aguarde o carregamento. Se continuar sem aparecer, verifique a ligação à API.

**Os alertas de velocidade estão a chegar com muita frequência — como reduzir?**
Aumente o **Intervalo mínimo entre alertas de velocidade** em **Definições → Alertas GPS**. O padrão é 60 segundos.
