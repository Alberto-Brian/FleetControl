# Manual do Utilizador — FleetControl

**Versão:** 1.x  
**Empresa:** AKM Systems  
**Plataforma:** Windows (Electron Desktop)

---

## Índice

1. [Introdução](#1-introdução)
2. [Modos de Operação e Licenças](#2-modos-de-operação-e-licenças)
3. [Painel Inicial](#3-painel-inicial)
4. [Veículos](#4-veículos)
5. [Motoristas](#5-motoristas)
6. [Viagens](#6-viagens)
7. [Abastecimentos](#7-abastecimentos)
8. [Manutenções](#8-manutenções)
9. [Despesas](#9-despesas)
10. [Multas](#10-multas)
11. [Relatórios](#11-relatórios)
12. [Rastreamento GPS (modo conectado)](#12-rastreamento-gps-modo-conectado)
13. [Definições](#13-definições)
14. [Bases de Dados e Modo Histórico](#14-bases-de-dados-e-modo-histórico)
15. [Notificações](#15-notificações)
16. [Ajuda e Suporte](#16-ajuda-e-suporte)

---

## 1. Introdução

O **FleetControl** é um sistema de gestão de frotas para empresas que operam veículos. Permite registar e monitorizar:

- **Veículos** — matrícula, modelo, estado, histórico completo
- **Motoristas** — dados pessoais, carta de condução, disponibilidade
- **Viagens** — origem, destino, km, motorista e veículo atribuídos
- **Abastecimentos** — consumo de combustível e custos
- **Manutenções** — preventivas e correctivas com histórico
- **Despesas** — operacionais por veículo ou categoria
- **Multas** — registo e acompanhamento de coimas
- **Relatórios** — exportáveis em PDF com cabeçalho personalizado
- **Rastreamento GPS** — posição em tempo real via Traccar (modo conectado)

### Navegação

- **Modo autónomo:** barra lateral esquerda com ícones e etiquetas, colapsável
- **Modo conectado:** nav rail com mapa de fundo + painel flutuante de conteúdo
- **Definições:** botão de engrenagem (canto inferior esquerdo em standalone, canto superior direito em conectado)
- **Ajuda:** última entrada do menu de navegação — abre esta documentação interactiva

---

## 2. Modos de Operação e Licenças

### Tipos de Licença

| Tipo | Modo | Características |
|---|---|---|
| **Autónomo** | Offline | Sem servidor, todos os dados guardados localmente |
| **Conectado** | Online | Servidor FleetControl + rastreamento GPS em tempo real |

### Activar uma Licença

1. Vai a **Definições › Licença**
2. Introduz a chave de licença fornecida pela AKM Systems
3. Clica em **"Activar"**
4. O sistema reinicia no modo correspondente

> **Importante:** Guarda a tua chave de licença num local seguro. A chave conectada (LK-) está vinculada à organização no servidor — podes usá-la para activar o FleetControl noutro computador.

### Verificar o Modo Activo

Em **Definições › Licença** podes ver:
- Tipo de licença e modo de operação
- Nome do cliente e organização
- Data de expiração
- Funcionalidades incluídas

---

## 3. Painel Inicial

O Painel Inicial apresenta um resumo do estado actual da frota:

- **Cartões de resumo:** total de veículos, activos, em manutenção, fora de serviço
- **Actividade recente:** últimas viagens e abastecimentos registados
- **Alertas:** manutenções pendentes ou próximas
- **Atalhos:** navegação rápida para as secções mais utilizadas

> **Dica:** Clica em qualquer cartão de resumo para navegar directamente para a secção correspondente.

---

## 4. Veículos

### Dados Registados

- Matrícula (identificador único)
- Marca, modelo, ano de fabrico
- Cor, número de chassis (VIN)
- Categoria (ligeiro, pesado, motociclo, etc.)
- Estado actual
- Dispositivo GPS associado (modo conectado)

### Estados do Veículo

| Estado | Descrição |
|---|---|
| Activo | Em serviço normal |
| Em Manutenção | Na oficina — indisponível para viagens |
| Inactivo | Fora de serviço (alienado, sinistrado, etc.) |

### Adicionar um Veículo

1. Clica em **"+ Novo Veículo"**
2. Preenche: matrícula, marca, modelo (obrigatórios)
3. Selecciona categoria e estado inicial
4. Associa o dispositivo GPS se disponível (modo conectado)
5. Guarda

### Filtros e Ordenação

- Barra de pesquisa por matrícula ou modelo
- Filtro por estado ou categoria
- Ordenação por qualquer coluna (clica no cabeçalho)
- Modos de vista: lista ou grelha (a preferência é guardada)

### Histórico do Veículo

No detalhe de cada veículo podes consultar:
- Todas as viagens realizadas
- Histórico de abastecimentos e consumo médio
- Manutenções realizadas e pendentes
- Despesas associadas

---

## 5. Motoristas

### Dados Registados

- **Dados pessoais:** nome completo, BI/passaporte, contacto telefónico, data de nascimento
- **Carta de condução:** número, categorias habilitadas, data de emissão, data de validade
- **Estado de disponibilidade**

### Estados do Motorista

| Estado | Descrição |
|---|---|
| Disponível | Pronto para ser atribuído a uma viagem |
| Em Viagem | A conduzir — em curso numa viagem activa |
| De Licença | Temporariamente indisponível (férias, baixa médica, etc.) |
| Inactivo | Não faz parte da frota activa (saiu, reformado, etc.) |

> Ao criar uma viagem, o sistema mostra apenas os motoristas com estado **"Disponível"**.

### Alerta de Carta de Condução

O sistema avisa quando a carta de condução de um motorista está próxima da validade. Configura o intervalo de aviso em Definições.

---

## 6. Viagens

### Dados Registados

- Veículo e motorista atribuídos
- Origem e destino
- Propósito da viagem (carga, serviço, pessoal, etc.)
- Data e hora de partida e chegada
- Odómetro inicial e final (quilómetros percorridos calculados automaticamente)
- Observações

### Registar uma Viagem

1. Clica em **"+ Nova Viagem"**
2. Selecciona o veículo
3. Selecciona o motorista (apenas "Disponíveis" aparecem)
4. Define origem, destino e propósito
5. Regista data/hora de partida e odómetro inicial
6. Ao terminar, actualiza com data/hora de chegada e odómetro final

> **Modo conectado:** As viagens podem ser correlacionadas com os percursos gravados automaticamente pelo Traccar, comparando os quilómetros declarados com os percorridos por GPS.

---

## 7. Abastecimentos

### Dados Registados

- Veículo
- Data, hora e local do abastecimento
- Litros abastecidos
- Preço por litro e custo total (calculado)
- Leitura do odómetro
- Tipo de combustível (gasóleo, gasolina, GLP, etc.)
- Fornecedor/posto

### Consumo Médio

O sistema calcula automaticamente o consumo médio (km/L) com base nos abastecimentos e leituras de odómetro consecutivos. Para resultados precisos, **regista sempre o odómetro em cada abastecimento**.

---

## 8. Manutenções

### Tipos de Manutenção

| Tipo | Exemplos |
|---|---|
| Preventiva | Revisão periódica, mudança de óleo, filtros |
| Correctiva | Reparação de avaria, substituição de peças |

### Dados Registados

| Campo | Descrição |
|---|---|
| Veículo | Viatura à qual a manutenção se refere |
| Categoria / Tipo | Preventiva ou correctiva (herdado da categoria) |
| Oficina | Fornecedor ou oficina que executa os trabalhos (opcional) |
| Data de entrada | Data em que o veículo entrou em manutenção |
| Data de saída | Data em que ficou concluída (preenchida ao concluir) |
| Quilometragem de entrada | Odómetro no momento de entrada |
| **Próxima manutenção (km)** | Odómetro previsto para a próxima revisão — o sistema avisa quando o veículo se aproximar |
| Diagnóstico | Problema inicial identificado |
| Solução | Trabalhos realizados e peças substituídas |
| Custo de peças / mão-de-obra | Custos detalhados (total calculado automaticamente) |
| Prioridade | Baixa, Normal, Alta ou Urgente |
| Nº Ordem de Trabalho | Referência interna da oficina (opcional) |
| Observações | Notas livres adicionais |

### Registar uma Manutenção

1. Clica em **"+ Nova Manutenção"**
2. Selecciona o veículo e a categoria
3. Preenche a quilometragem actual do veículo (preenchida automaticamente se o veículo tiver km registados)
4. Opcionalmente, define a **quilometragem da próxima revisão** no campo "Próxima Manutenção (km)"
5. Preenche a descrição, custo estimado e oficina
6. Escolhe o estado inicial:
   - **"Agendar Manutenção"** — fica com estado *Agendada*
   - **"Iniciar Manutenção"** — fica com estado *Em Andamento* e o veículo passa a *Em Manutenção*

### Concluir uma Manutenção

1. Na lista de manutenções, clica em **"Concluir"** na manutenção em andamento
2. Preenche o diagnóstico (se ainda não estava preenchido) e a solução aplicada
3. Confirma os custos finais de peças e mão-de-obra
4. Opcionalmente, define a **quilometragem da próxima revisão** preventiva
5. Clica em **"Concluir Manutenção"**

O veículo regressa automaticamente ao estado *Disponível*.

### Alertas Preventivos por Quilometragem

Quando uma manutenção tem a quilometragem da próxima revisão definida, o sistema monitoriza o odómetro do veículo. Se o veículo estiver dentro do limiar de alerta, aparece um **aviso âmbar** no topo da página de Manutenções com:

- Matrícula e modelo do veículo
- Quilómetros restantes até à próxima revisão
- Quilometragem prevista para a revisão

Se o veículo já tiver **ultrapassado** a quilometragem prevista, o aviso aparece a vermelho com a indicação **"Manutenção em atraso"**.

O aviso pode ser dispensado para a sessão actual clicando no **×** no canto direito do banner. Reaparece na próxima abertura da aplicação.

#### Configurar o Limiar de Alerta

O limiar define a antecedência (em km) com que o aviso é mostrado. Por defeito são **10 000 km**.

1. Vai a **Definições › Operações**
2. Ajusta o campo **"Limiar de alerta de quilometragem"**
3. Activa ou desactiva os alertas de manutenção preventiva com o interruptor correspondente

### Estados de uma Manutenção

| Estado | Descrição |
|---|---|
| Agendada | Manutenção planeada — veículo ainda disponível |
| Em Andamento | Veículo na oficina — estado do veículo muda para *Em Manutenção* |
| Concluída | Trabalhos terminados — veículo devolvido ao serviço |
| Cancelada | Manutenção anulada |

> **Atenção:** Quando o veículo entra em manutenção (estado *Em Andamento*), fica indisponível para novas viagens. Marca a manutenção como **concluída** quando os trabalhos terminarem para restituir o veículo ao serviço.

---

## 9. Despesas

Regista todas as despesas operacionais da frota que não se enquadrem nos módulos de abastecimento ou manutenção.

### Exemplos de Categorias

- Portagens
- Lavagens
- Seguros e impostos
- Parques de estacionamento
- Pneus e acessórios
- Outras despesas gerais

### Despesas por Veículo vs. Gerais

- **Por veículo:** associa a despesa a um veículo específico
- **Gerais da frota:** deixa o campo de veículo em branco para despesas que afectam toda a frota

> Cria categorias personalizadas em **Definições** para organizar as despesas da tua operação específica.

---

## 10. Multas

### Dados Registados

- Veículo e motorista associados à infracção
- Data, hora e local da infracção
- Tipo de infracção
- Autoridade autuante
- Valor da coima
- Prazo de pagamento
- Estado: **Pendente**, **Pago**, **Contestado**
- Responsável pelo pagamento (empresa ou motorista)

---

## 11. Relatórios

O módulo de Relatórios permite gerar e exportar documentos PDF com dados de todos os módulos do sistema.

### Tipos de Relatório Disponíveis

| Relatório | Filtros disponíveis |
|---|---|
| Viagens | Período, veículo, motorista |
| Abastecimentos e Consumo | Período, veículo, tipo de combustível |
| Manutenções | Período, veículo, tipo |
| Despesas | Período, veículo, categoria |
| Multas | Período, estado de pagamento |
| Resumo da Frota | Período geral |

### Exportar para PDF

1. Selecciona o tipo de relatório
2. Define os filtros (período, veículo, etc.)
3. Clica em **"Gerar Relatório"**
4. Clica em **"Exportar PDF"**

### Personalizar o Cabeçalho PDF

Em **Definições › Relatórios PDF** podes configurar:
- Nome e logótipo da empresa
- Endereço e contactos
- Informação adicional no rodapé

### Relatórios em Modo Histórico

Podes gerar relatórios de bases de dados antigas sem afectar os dados actuais. Ver secção [14. Bases de Dados e Modo Histórico](#14-bases-de-dados-e-modo-histórico).

---

## 12. Rastreamento GPS (modo conectado)

> Esta funcionalidade está disponível **apenas no modo conectado** com licença LK-.

### Visão Geral

O módulo de rastreamento monitoriza a posição dos veículos em tempo real, recebendo actualizações dos dispositivos GPS instalados nas viaturas.

### Interface do Mapa

- **Mapa de fundo:** cobertura total do ecrã com posição de todos os dispositivos
- **Painel flutuante:** conteúdo das outras secções sobrepõe o mapa
- **Barra de ferramentas:** zoom, camadas, centrar todos, seguir veículo
- **Painel lateral:** lista de dispositivos com estado, velocidade e última actualização

#### Camadas de Mapa Disponíveis

| Camada | Descrição |
|---|---|
| Mapa de ruas | OpenStreetMap — padrão |
| Satélite | Imagens de satélite |
| Híbrido | Satélite + nomes de ruas |
| Terreno | Relevo e altimetria |
| Carto (limpo) | Minimalista, ideal para frotas urbanas |

### Informação de cada Dispositivo

- Posição actual no mapa (marcador com matrícula ou marca)
- Velocidade actual (km/h)
- Rumo (direcção de deslocamento)
- Estado da ignição (ligada/desligada)
- Estado online/offline
- Última actualização de posição

### Histórico de Percurso

Para consultar o percurso de um veículo:
1. Clica no dispositivo na lista lateral
2. Clica em **"Ver percurso"**
3. Define o intervalo de datas
4. Clica em **"Mostrar"**

O percurso é desenhado no mapa com a rota completa do veículo no período seleccionado.

### Zonas de Geofencing

As zonas de geofencing permitem definir áreas geográficas e receber alertas quando um veículo entra ou sai dessas áreas.

#### Criar uma Zona

1. Abre o separador **"Zonas"** na barra lateral
2. Clica em **"Círculo"** ou **"Polígono"**
3. Desenha a zona directamente no mapa (clica para definir pontos)
4. Dá um nome à zona
5. Define um limite de velocidade (opcional — para alertas de velocidade dentro da zona)
6. Clica em **"Guardar"**

A zona é sincronizada automaticamente com o servidor Traccar.

#### Editar ou Eliminar Zonas

- Clica numa zona na lista para ver opções de edição
- Clica em **"Editar"** para alterar nome ou limite de velocidade
- Clica no ícone de lixo para eliminar

### Alertas GPS

Os alertas são gerados pelos seguintes eventos:

| Evento | Descrição |
|---|---|
| Entrada em zona | Veículo entrou numa zona de geofencing |
| Saída de zona | Veículo saiu de uma zona de geofencing |
| Velocidade excessiva | Velocidade acima do limite configurado |
| Ignição ligada | Motor ligado |
| Ignição desligada | Motor desligado |
| Em movimento | Veículo começou a mover-se |
| Veículo parado | Veículo ficou parado |

Cada tipo de alerta pode ser activado ou desactivado individualmente em **Definições › Alertas GPS**. Podes também configurar um intervalo mínimo entre alertas do mesmo tipo para evitar notificações repetidas.

---

## 13. Definições

Acede em: botão de engrenagem ⚙ no canto inferior esquerdo (autónomo) ou superior direito do painel (conectado).

### Aspecto Visual

- **Tema:** claro, escuro ou seguir o sistema
- **Tamanho de texto:** compacto, normal, grande
- **Espaçamento do layout:** compacto ou confortável
- **Padding do layout:** com ou sem margens no painel de conteúdo

### Idioma

- Português (padrão)
- English

A alteração do idioma aplica-se imediatamente a toda a interface.

### Empresa

Configura as informações da empresa que aparecem nos relatórios PDF:
- Nome da empresa
- Logótipo (upload de imagem)
- NIF
- Endereço completo
- Telefone e email

### Relatórios PDF

- Cabeçalho personalizado dos PDFs exportados
- Opção de incluir/excluir logótipo
- Formato de data nos relatórios
- Rodapé com informação adicional

### Alertas GPS (modo conectado)

- Activar/desactivar notificações nativas do SO
- Seleccionar quais eventos geram alertas:
  - Entrada/saída de zonas de geofencing
  - Excesso de velocidade
  - Ignição ligada/desligada
  - Veículo em movimento/parado
- Intervalo mínimo entre alertas por tipo (30s, 1min, 5min, 15min, 30min)

### Cópias de Segurança

- **Localização:** pasta onde são guardadas as cópias automáticas
- **Frequência:** diária, semanal ou desactivada
- **Retenção:** número de cópias a manter (as mais antigas são eliminadas automaticamente)
- **Fazer cópia agora:** cria uma cópia manual imediatamente

### Bases de Dados

Lista todas as bases de dados existentes no sistema (actual e cópias de segurança), com:
- Nome do ficheiro e data de criação
- Tamanho em MB
- Total de registos
- Estado (base actual ou histórica)

Permite activar uma base antiga para consulta em modo somente leitura. Ver [secção 14](#14-bases-de-dados-e-modo-histórico).

### Servidor (modo conectado)

Configurações de ligação ao servidor FleetControl:
- URL do servidor API
- Timeout de ligação
- Opções de reconexão automática

### Licença

- Tipo e modo de operação activo
- Nome do cliente e organização
- Data de expiração da licença
- Funcionalidades incluídas
- Campo para activar nova licença

---

## 14. Bases de Dados e Modo Histórico

O FleetControl guarda os dados localmente numa base de dados SQLite. O sistema cria automaticamente cópias de segurança (backups) periodicamente.

### Para Que Serve o Modo Histórico

O modo histórico permite **activar temporariamente uma base de dados antiga** para:
- Consultar dados de períodos anteriores
- Gerar relatórios históricos
- Verificar registos de uma cópia de segurança

### Como Activar o Modo Histórico

1. Vai a **Definições › Bases de Dados**
2. Clica numa base de dados da lista para expandir os detalhes
3. Verifica o número de registos e data de criação
4. Clica em **"Activar"**
5. O sistema entra em modo histórico

### Identificação do Modo Histórico

Quando o modo histórico está activo:
- Uma **barra laranja** aparece no topo de todas as páginas
- A barra mostra o nome da base de dados histórica activa
- Todas as listagens mostram os dados daquela base

### Restrições em Modo Histórico

- **Somente leitura** — não é possível adicionar, editar ou apagar dados
- Qualquer tentativa de modificação é bloqueada automaticamente ao nível da base de dados
- O bloqueio é garantido por `readonly: true` a nível de SQLite — não é apenas validação de UI

### Desactivar o Modo Histórico

- Clica no botão **"Desactivar"** na barra laranja no topo do ecrã
- O sistema volta imediatamente à base de dados actual

> **Nota:** Fechar e reabrir o FleetControl desactiva automaticamente o modo histórico.

---

## 15. Notificações

### Tipos de Notificação

O FleetControl usa dois tipos de notificação para alertas GPS:

| Tipo | Quando aparece |
|---|---|
| **Interna (toast)** | Dentro da aplicação, canto do ecrã — quando a app está em foco |
| **Nativa do SO** | Notificação do Windows — quando a app está minimizada ou em segundo plano |

### Comportamento Automático

O sistema detecta automaticamente o estado da aplicação:

- **App em foco** → notificação interna (toast) dentro da janela
- **App minimizada ou em segundo plano** → notificação nativa do sistema operativo

Não é necessária nenhuma configuração adicional para este comportamento base.

### Configurar Notificações Nativas

Em **Definições › Alertas GPS**:
- Activa/desactiva as notificações nativas do SO
- Configura quais eventos geram notificações
- Define intervalos mínimos entre notificações do mesmo tipo (cooldown)

### Painel de Alertas

No módulo de Rastreamento, o separador **"Alertas"** na barra lateral lista todos os alertas recentes:
- Tipo de evento e dispositivo
- Data e hora
- Zona associada (para alertas de geofencing)
- Estado: lido / por ler
- Botão **"Marcar todos"** para limpar alertas pendentes

---

## 16. Ajuda e Suporte

### Ajuda In-App

A secção **"Ajuda"** no menu de navegação (ícone de ponto de interrogação) abre a documentação interactiva com:
- Pesquisa por palavra-chave
- Índice de secções no painel esquerdo
- Conteúdo detalhado de cada módulo
- Dicas e avisos contextuais

### Contacto AKM Systems

Para suporte técnico, activação de licenças ou outras questões:

- **Email:** albertobrian16@gmail.com
- **Sistema:** FleetControl Desktop v1.x

### Problemas Frequentes

**A aplicação não liga ao servidor (modo conectado)**
- Verifica a ligação à internet
- Confirma o URL do servidor em Definições › Servidor
- Verifica se o servidor FleetControl está a correr

**O rastreamento GPS não mostra dispositivos**
- Confirma que o servidor Traccar está online (ícone "Traccar offline" na barra superior)
- Verifica as credenciais Traccar em Definições › Servidor
- Aguarda que os dispositivos GPS transmitam posição

**Não consigo adicionar dados em modo histórico**
- Está activo o modo histórico (barra laranja no topo)
- Clica "Desactivar" na barra laranja para voltar à base de dados actual

**A licença expirou**
- Contacta a AKM Systems para renovação
- Vai a Definições › Licença para verificar a data de expiração

---

*Manual FleetControl — AKM Systems*  
*Última actualização: Julho 2026*
