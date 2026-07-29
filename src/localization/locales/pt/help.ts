// ========================================
// FILE: src/locales/pt/help.ts
// ========================================
export const ptHelp = {
  search: { placeholder: 'Pesquisar ajuda...' },
  noResults: 'Nenhum resultado para',
  connectedOnly: 'Apenas modo conectado',
  footer: 'FleetControl · AKM Systems',

  sections: [
    // ─── INTRODUÇÃO ───────────────────────────────────────────────────────────
    {
      id: 'intro',
      title: 'Introdução ao FleetControl',
      content: [
        { type: 'text', text: 'O FleetControl é um sistema de gestão de frotas que permite monitorizar veículos, motoristas, viagens, abastecimentos, manutenções, despesas e multas. Inclui rastreamento GPS em tempo real via Traccar no modo conectado.' },
        { type: 'text', text: 'Dois modos de operação:' },
        { type: 'list', items: [
          'Modo Autónomo (Standalone) — funciona completamente offline. Todos os dados são guardados localmente no computador. Chave de licença começa por ST-.',
          'Modo Conectado — liga-se ao servidor FleetControl e ao módulo de rastreamento GPS em tempo real via Traccar. Chave de licença começa por LK-.',
        ]},
        { type: 'tip', text: 'O modo de operação é determinado pelo tipo de licença activada. Podes ver o teu modo actual em Definições › Licença.' },
      ],
    },

    // ─── PAINEL INICIAL ───────────────────────────────────────────────────────
    {
      id: 'dashboard',
      title: 'Painel Inicial',
      content: [
        { type: 'text', text: 'O Painel Inicial apresenta um resumo do estado actual da frota com métricas chave e acesso rápido às secções principais.' },
        { type: 'list', items: [
          'Resumo de veículos activos, em manutenção e fora de serviço',
          'Viagens recentes e estatísticas de combustível',
          'Alertas de manutenções pendentes e licenças de motoristas a expirar',
          'Atalhos para as secções mais utilizadas',
        ]},
        { type: 'tip', text: 'Clica nos cartões de resumo para navegar directamente para a secção correspondente.' },
      ],
    },

    // ─── PAINÉIS DE ANÁLISE ───────────────────────────────────────────────────
    {
      id: 'analytics',
      title: 'Painéis de Análise',
      content: [
        { type: 'text', text: 'Cada secção principal (Veículos, Motoristas, Viagens, Combustível, Manutenção, Despesas) tem um painel de análise com KPIs e gráficos baseados nos dados da listagem actual.' },
        { type: 'text', text: 'Posição do painel — configurável em Definições › Vistas:' },
        { type: 'list', items: [
          'Vertical (padrão) — painel fixo à direita da listagem, acompanha o scroll. Os botões de modo de visualização (compacto/lista/cartões) movem-se para a linha da paginação neste modo.',
          'Horizontal — painel aparece acima da listagem, ocupa a largura total.',
        ]},
        { type: 'text', text: 'KPIs e gráficos por módulo:' },
        { type: 'table',
          headers: ['Módulo', 'KPIs', 'Gráficos'],
          rows: [
            ['Veículos', 'Taxa utilização, disponibilidade, média quilometragem, veículos com GPS', 'Donut de estado da frota, barras top quilometragem, barras por categoria'],
            ['Motoristas', 'Taxa disponibilidade, em viagem, de férias, cartas a expirar (30 dias)', 'Donut de disponibilidade, barras por categoria de carta'],
            ['Viagens', 'Taxa de conclusão, em progresso, canceladas, distância total', 'Donut de estado das viagens'],
            ['Combustível', 'Custo total, total litros, preço médio/L, nº abastecimentos', 'Barras de custo por viatura'],
            ['Manutenção', 'Total, agendadas, em andamento, custo total', 'Donut de estado, barras de custo por viatura'],
            ['Despesas', 'Total despesas, valor total, pagas, taxa de pagamento', 'Donut de estado, barras de valor por categoria'],
          ],
        },
        { type: 'tip', text: 'Valores grandes são automaticamente abreviados (ex: 85.300 km → "85.3K km"). Passa o rato sobre o KPI para ver o valor completo num tooltip com o nome da métrica e o número exacto.' },
        { type: 'tip', text: 'Activa ou desactiva os painéis de cada módulo individualmente em Definições › Vistas.' },
      ],
    },

    // ─── VEÍCULOS ─────────────────────────────────────────────────────────────
    {
      id: 'vehicles',
      title: 'Veículos',
      content: [
        { type: 'text', text: 'Gere toda a frota de veículos: regista, edita e consulta o histórico de cada viatura.' },
        { type: 'list', items: [
          'Registo completo: matrícula, marca, modelo, ano, cor, categoria',
          'Número de chassis e estado actual (activo, em manutenção, inactivo)',
          'Quilometragem actual e histórico de actualizações',
          'Histórico de viagens, abastecimentos e manutenções por veículo',
          'Associação ao dispositivo de rastreamento GPS com IMEI (modo conectado)',
        ]},
        { type: 'steps', steps: [
          'Clica em "+ Novo Veículo" no canto superior direito',
          'Preenche os dados obrigatórios: matrícula, marca, modelo',
          'Selecciona a categoria e o estado inicial',
          'Guarda o registo',
        ]},
        { type: 'text', text: 'Acções GPS disponíveis por veículo (modo conectado):' },
        { type: 'list', items: [
          'Registar GPS: associa o IMEI ao veículo — após o registo, o sistema sugere adicionar o veículo a uma zona virtual de geofencing',
          'Remover GPS: desvincula o dispositivo; o nome do device no Traccar passa automaticamente a "GPS-XXXXXX" (últimos 6 dígitos do IMEI), indicando que está disponível para reutilização',
          'Para mudar o IMEI: remove o GPS actual e regista o novo — não existe actualização directa de IMEI',
          'Pausar rastreamento: o veículo deixa de aparecer no mapa mas mantém o GPS associado — pode ser reactivado a qualquer momento',
          'Retomar rastreamento: o veículo volta a aparecer no mapa com actualizações em tempo real',
          'Excluir veículo com GPS activo: o sistema avisa que o IMEI será desassociado antes da exclusão e pede confirmação',
        ]},
        { type: 'tip', text: 'O painel "Dispositivos GPS" (botão na barra do mapa) permite filtrar dispositivos com ou sem veículo associado, facilitando a gestão de IMEIs livres.' },
        { type: 'tip', text: 'Quando há filtros activos, aparece um botão "Limpar filtros" que repõe todos os filtros de uma só vez (visível na barra de ferramentas ou na linha da paginação, consoante o layout).' },
      ],
    },

    // ─── MOTORISTAS ───────────────────────────────────────────────────────────
    {
      id: 'drivers',
      title: 'Motoristas',
      content: [
        { type: 'text', text: 'Cada motorista tem dois estados independentes: o estado contratual e a disponibilidade operacional. É importante perceber qual podes alterar manualmente e qual é gerido automaticamente pelo sistema.' },
        { type: 'text', text: 'Estado Contratual — define a relação laboral do motorista com a empresa:' },
        { type: 'table',
          headers: ['Estado', 'Significado', 'Quem define'],
          rows: [
            ['Activo', 'Motorista em funções na empresa', 'Utilizador'],
            ['De Licença', 'Ausência temporária: férias, baixa médica, etc.', 'Automático (módulo de Licenças) ou utilizador'],
            ['Rescindido', 'Vínculo laboral encerrado — motorista inactivo definitivamente', 'Utilizador'],
          ],
        },
        { type: 'warning', text: 'Não é possível alterar o estado contratual enquanto o motorista tiver uma viagem em curso. Conclui a viagem primeiro.' },
        { type: 'text', text: 'Disponibilidade Operacional — indica se o motorista está pronto para ser atribuído a uma viagem:' },
        { type: 'table',
          headers: ['Disponibilidade', 'Significado', 'Quem define'],
          rows: [
            ['Disponível', 'Pronto para ser atribuído a uma viagem', 'Utilizador ou automático (ao fim de uma viagem ou licença)'],
            ['Em Viagem', 'A conduzir — atribuído a uma viagem activa', 'Automático (módulo de Viagens)'],
            ['Offline', 'Indisponível temporariamente por outra razão', 'Utilizador ou automático (ao iniciar uma licença)'],
          ],
        },
        { type: 'tip', text: 'Ao criar uma viagem, só os motoristas com disponibilidade "Disponível" e estado contratual "Activo" aparecem para selecção.' },
        { type: 'text', text: 'Regras de automatismo:' },
        { type: 'list', items: [
          'Quando uma viagem começa → disponibilidade passa a "Em Viagem" automaticamente',
          'Quando a viagem termina → disponibilidade regressa a "Disponível" automaticamente',
          'Quando uma licença é activada → disponibilidade passa a "Offline" automaticamente',
          'Quando a licença termina → disponibilidade regressa a "Disponível" automaticamente',
          'Não é possível alterar a disponibilidade manualmente enquanto o motorista estiver Em Viagem',
        ]},
      ],
    },

    // ─── VIAGENS ──────────────────────────────────────────────────────────────
    {
      id: 'trips',
      title: 'Viagens',
      content: [
        { type: 'text', text: 'Regista e acompanha todas as viagens da frota: origem, destino, veículo, motorista, quilómetros e custos.' },
        { type: 'list', items: [
          'Veículo e motorista atribuídos',
          'Origem, destino e propósito da viagem',
          'Data/hora de partida e chegada',
          'Quilómetros percorridos (odómetro inicial e final)',
          'Custo da viagem e observações adicionais',
        ]},
        { type: 'steps', steps: [
          'Clica em "+ Nova Viagem"',
          'Selecciona o veículo e o motorista disponível',
          'Define origem, destino e data de partida',
          'Regista o odómetro inicial',
          'Ao terminar, actualiza com data de chegada e odómetro final',
        ]},
        { type: 'tip', text: 'Em modo conectado, as viagens podem ser correlacionadas com os percursos GPS gravados automaticamente pelo Traccar.' },
      ],
    },

    // ─── ABASTECIMENTOS ───────────────────────────────────────────────────────
    {
      id: 'fuel',
      title: 'Abastecimentos',
      content: [
        { type: 'text', text: 'Regista todos os abastecimentos de combustível da frota para controlar o consumo e os custos.' },
        { type: 'list', items: [
          'Veículo, data e local do abastecimento',
          'Litros abastecidos, preço por litro e custo total',
          'Leitura do odómetro no momento do abastecimento',
          'Tipo de combustível (gasóleo, gasolina, GLP, elétrico, etc.)',
          'Cálculo automático do consumo médio (km/L)',
        ]},
        { type: 'tip', text: 'Regista sempre o odómetro em cada abastecimento para que o sistema calcule o consumo médio com precisão.' },
      ],
    },

    // ─── MANUTENÇÕES ──────────────────────────────────────────────────────────
    {
      id: 'maintenance',
      title: 'Manutenções',
      content: [
        { type: 'text', text: 'Gere as manutenções preventivas e correctivas de todos os veículos da frota.' },
        { type: 'list', items: [
          'Tipo: preventiva, correctiva',
          'Descrição dos trabalhos realizados, diagnóstico e solução',
          'Fornecedor/oficina, data de entrada e data de saída',
          'Quilómetros do veículo no momento da entrada e quilometragem da próxima manutenção prevista',
          'Custos de peças, mão-de-obra e total',
          'Prioridade: baixa, normal, alta, urgente',
          'Número de ordem de trabalho (opcional)',
        ]},
        { type: 'warning', text: 'Quando um veículo entra em manutenção, o seu estado muda automaticamente. Marca a manutenção como concluída quando os trabalhos terminarem para restituir o veículo ao serviço.' },
        { type: 'tip', text: 'Define a quilometragem da próxima manutenção ao criar ou concluir um registo. O sistema avisa-te automaticamente no topo da página quando o veículo se aproximar desse valor. Configura o limiar de aviso em Definições › Operações.' },
      ],
    },

    // ─── DESPESAS ─────────────────────────────────────────────────────────────
    {
      id: 'expenses',
      title: 'Despesas',
      content: [
        { type: 'text', text: 'Regista todas as despesas operacionais da frota, por veículo ou de forma geral.' },
        { type: 'list', items: [
          'Categoria de despesa (portagem, lavagem, seguro, inspecção, etc.)',
          'Veículo associado — opcional para despesas gerais da frota',
          'Data, descrição, valor e estado (pendente, pago, cancelado)',
          'Relatórios de despesas por período, veículo ou categoria',
        ]},
        { type: 'tip', text: 'Cria categorias personalizadas em Categorias para melhor organizar as despesas específicas da tua operação.' },
        { type: 'tip', text: 'O painel de análise de Despesas mostra o total, o valor acumulado, a taxa de pagamento e distribuição por categoria (dados da página actual). Podes activá-lo em Definições › Vistas.' },
      ],
    },

    // ─── MULTAS ───────────────────────────────────────────────────────────────
    {
      id: 'fines',
      title: 'Multas',
      content: [
        { type: 'text', text: 'Regista e acompanha as multas de trânsito associadas aos veículos da frota.' },
        { type: 'list', items: [
          'Veículo e motorista associados à infracção',
          'Data, local e tipo de infracção',
          'Valor da coima e prazo de pagamento',
          'Estado do pagamento: pendente, pago, contestado',
          'Responsável pelo pagamento: empresa ou motorista',
        ]},
        { type: 'tip', text: 'Define quem é responsável pelo pagamento (empresa ou motorista) ao registar ou editar a multa. Esse campo aparece no detalhe do registo para facilitar a imputação de custos.' },
      ],
    },

    // ─── LISTAGENS E FILTROS ──────────────────────────────────────────────────
    {
      id: 'listing-preferences',
      title: 'Listagens, Filtros e Visualização',
      content: [
        { type: 'text', text: 'Todas as secções principais partilham o mesmo sistema de listagem com filtros, modos de visualização e paginação.' },
        { type: 'text', text: 'Modos de visualização — disponíveis na barra de ferramentas de cada secção:' },
        { type: 'list', items: [
          'Compacto — linhas densas, mais registos visíveis por ecrã',
          'Lista — linhas standard com mais detalhes por item',
          'Cartões — grelha de cartões com informação visual destacada',
        ]},
        { type: 'tip', text: 'Em modo de análise vertical, os botões de modo de visualização movem-se para a linha da paginação (à esquerda dos controlos de página) para não duplicarem com a barra de ferramentas principal.' },
        { type: 'text', text: 'Filtros e pesquisa:' },
        { type: 'list', items: [
          'Barra de pesquisa por texto livre em tempo real',
          'Filtros por estado, categoria, e outros campos dependendo da secção',
          'Botão "Limpar filtros" — aparece sempre que há filtros activos, na barra de ferramentas (modo vertical) ou na linha da paginação; repõe todos os filtros de uma só vez',
          'Ordenação por coluna clicando no cabeçalho da tabela',
        ]},
        { type: 'text', text: 'Preferências de listagem (Definições › Aparência › Preferências de listagens):' },
        { type: 'table',
          headers: ['Preferência', 'Predefinição', 'O que faz'],
          rows: [
            ['Guardar filtros entre sessões', 'Desligado', 'Mantém os filtros activos ao fechar e reabrir a aplicação'],
            ['Guardar modo de visualização', 'Ligado', 'Mantém a escolha entre compacto/lista/cartões entre sessões'],
            ['Guardar quantidade por página', 'Desligado', 'Lembra quantos itens mostrar por página em cada listagem'],
            ['Guardar página actual', 'Desligado', 'Retoma a última página visitada ao reabrir uma listagem'],
          ],
        },
        { type: 'tip', text: 'Activar "Guardar filtros" é útil quando trabalhas frequentemente com os mesmos filtros (ex: apenas veículos activos ou uma categoria específica).' },
      ],
    },

    // ─── RELATÓRIOS ───────────────────────────────────────────────────────────
    {
      id: 'reports',
      title: 'Relatórios',
      content: [
        { type: 'text', text: 'Gera relatórios detalhados de todos os módulos do sistema, exportáveis em PDF.' },
        { type: 'list', items: [
          'Relatório de viagens por período, veículo ou motorista',
          'Consumo de combustível e custos por veículo',
          'Histórico de manutenções e custos associados',
          'Relatório de despesas por categoria ou período',
          'Resumo geral da frota',
        ]},
        { type: 'text', text: 'O cabeçalho dos PDFs usa as informações configuradas em Definições › Empresa (logótipo, nome, contactos). Em Definições › Relatórios PDF podes personalizar:' },
        { type: 'list', items: [
          'Marca de água (texto ou logótipo da empresa, com opacidade ajustável)',
          'Cores dos cabeçalhos e badges (cor primária e secundária)',
          'Inclusão de gráficos, rodapé e resumo executivo',
          'Tamanho e orientação do papel',
          'Formato dos valores: compacto (K/M) ou números completos',
          'Mostrar ou ocultar o símbolo de moeda (Kz)',
        ]},
        { type: 'tip', text: 'Em modo histórico podes gerar relatórios de bases de dados antigas sem afectar os dados actuais. Consulta a secção "Bases de Dados" para saber como activar este modo.' },
      ],
    },

    // ─── RASTREAMENTO GPS ─────────────────────────────────────────────────────
    {
      id: 'tracking',
      title: 'Rastreamento GPS',
      connectedOnly: true,
      content: [
        { type: 'text', text: 'O módulo de rastreamento GPS (disponível apenas no modo conectado) permite monitorizar em tempo real a posição de todos os veículos equipados com dispositivo GPS via servidor Traccar.' },
        { type: 'list', items: [
          'Mapa em tempo real com posição de todos os dispositivos',
          'Velocidade, rumo e última actualização de cada veículo',
          'Histórico de percurso por dispositivo e período',
          'Zonas de geofencing com alertas de entrada/saída',
          'Alertas de velocidade excessiva e estado de ignição',
          'Camadas de mapa: ruas, satélite, híbrido, terreno',
        ]},
        { type: 'text', text: 'Zonas de Geofencing — Delimita áreas geográficas no mapa para receber alertas quando um veículo entra ou sai dessas zonas:' },
        { type: 'steps', steps: [
          'Vai ao separador "Zonas" na barra lateral do mapa',
          'Clica em "Círculo" ou "Polígono" e desenha a zona directamente no mapa',
          'Dá um nome à zona e define o limite de velocidade (opcional)',
          'Guarda — a zona é sincronizada com o servidor Traccar',
          'Activa as notificações de entrada/saída em Definições › Alertas GPS',
        ]},
        { type: 'tip', text: 'Usa o botão "Ver todos os dispositivos" na barra de ferramentas para centrar o mapa em toda a frota de uma vez.' },
        { type: 'list', items: [
          'O mapa mostra apenas veículos com GPS activo e rastreamento activado',
          'Veículos com rastreamento pausado aparecem na lista lateral com o badge "Rastreamento pausado" mas não têm marcador no mapa',
          'O painel "Dispositivos GPS" (botão na barra de ferramentas) lista todos os dispositivos Traccar com pesquisa por nome, IMEI ou matrícula',
          'Após restauro de backup, a app verifica automaticamente os IMEIs e avisa quando algum não tem correspondência no Traccar',
        ]},
      ],
    },

    // ─── NOTIFICAÇÕES GPS ─────────────────────────────────────────────────────
    {
      id: 'notifications',
      title: 'Notificações GPS',
      connectedOnly: true,
      content: [
        { type: 'text', text: 'O FleetControl usa dois tipos de notificação para alertas GPS:' },
        { type: 'list', items: [
          'Notificações internas (toast) — aparecem dentro da aplicação quando está em foco',
          'Notificações nativas do SO — aparecem no sistema operativo quando a aplicação está minimizada ou em segundo plano',
        ]},
        { type: 'table',
          headers: ['Estado da aplicação', 'Tipo de notificação'],
          rows: [
            ['Em foco (janela activa)', 'Notificação interna (toast) no canto do ecrã'],
            ['Minimizada ou em segundo plano', 'Notificação nativa do sistema operativo'],
          ],
        },
        { type: 'tip', text: 'Activa/desactiva as notificações nativas em Definições › Alertas GPS. Cada tipo de evento pode ser configurado individualmente, incluindo um intervalo mínimo (cooldown) entre notificações do mesmo tipo.' },
        { type: 'text', text: 'Painel de Alertas — Clica em "Alertas" na barra de ferramentas do mapa para aceder ao historial. O painel inclui:' },
        { type: 'list', items: [
          'Pesquisa por nome de dispositivo, tipo de evento ou nome de zona',
          'Separadores: Todos / Não lidos / Lidos — com contagem em cada separador',
          'Barra de estatísticas: total não lidos, lidos e período coberto',
          'Clicar num alerta abre o detalhe com coordenadas, data/hora e opção de centrar no mapa',
          'Marcar alertas individualmente ou todos como lidos com um clique',
        ]},
        { type: 'text', text: 'Tipos de evento configuráveis em Definições › Alertas GPS:' },
        { type: 'list', items: [
          'Entrada em zona — veículo entra numa zona de geofencing',
          'Saída de zona — veículo sai de uma zona de geofencing',
          'Velocidade excessiva — veículo ultrapassa o limite definido',
          'Ignição ligada — motor arranca',
          'Ignição desligada — motor pára',
        ]},
      ],
    },

    // ─── BASES DE DADOS ───────────────────────────────────────────────────────
    {
      id: 'databases',
      title: 'Bases de Dados (Modo Histórico)',
      content: [
        { type: 'text', text: 'O sistema guarda automaticamente cópias de segurança da base de dados. A aba "Bases de Dados" em Definições permite activar temporariamente uma base antiga para consultar registos históricos e gerar relatórios.' },
        { type: 'text', text: 'Quando activas uma base de dados histórica:' },
        { type: 'list', items: [
          'Uma barra laranja aparece no topo de todas as páginas indicando que estás em modo histórico',
          'Todas as listagens (veículos, viagens, motoristas, etc.) mostram os dados daquela base',
          'Podes gerar relatórios dos dados históricos normalmente',
          'Não é possível adicionar, editar ou apagar dados — modo somente leitura',
        ]},
        { type: 'steps', steps: [
          'Vai a Definições › Bases de Dados',
          'Clica numa base de dados da lista para expandir os seus detalhes',
          'Clica em "Activar" para entrar em modo histórico',
          'Navega para qualquer secção ou Relatórios para consultar os dados históricos',
          'Clica "Desactivar" na barra laranja no topo do ecrã para voltar à base de dados actual',
        ]},
        { type: 'warning', text: 'Em modo histórico não é possível fazer alterações aos dados. Desactiva o modo histórico para voltar a trabalhar normalmente.' },
      ],
    },

    // ─── LICENÇA ──────────────────────────────────────────────────────────────
    {
      id: 'license',
      title: 'Licença e Activação',
      content: [
        { type: 'text', text: 'O FleetControl é activado através de uma chave de licença fornecida pela AKM Systems. Existem dois tipos de licença:' },
        { type: 'table',
          headers: ['Tipo', 'Chave começa por', 'Características'],
          rows: [
            ['Autónomo', 'ST-', 'Modo offline, dados locais, sem necessidade de servidor'],
            ['Conectado', 'LK-', 'Servidor, rastreamento GPS em tempo real, multi-utilizador'],
          ],
        },
        { type: 'steps', steps: [
          'Vai a Definições › Licença',
          'Introduz a chave de licença fornecida',
          'Clica em "Activar"',
          'O sistema fica operacional no modo correspondente ao tipo de licença',
        ]},
        { type: 'warning', text: 'Guarda a tua chave de licença em local seguro. Em caso de perda, contacta a AKM Systems para assistência.' },
        { type: 'tip', text: 'A chave conectada (LK-) está vinculada à tua organização no servidor. Podes usar a mesma chave para activar o FleetControl noutro computador.' },
      ],
    },

    // ─── DEFINIÇÕES ───────────────────────────────────────────────────────────
    {
      id: 'settings',
      title: 'Definições — Visão Geral',
      content: [
        { type: 'text', text: 'Acede às Definições através do botão de engrenagem no canto inferior esquerdo (modo autónomo) ou no canto superior direito do painel (modo conectado). Existe uma barra de pesquisa no topo do diálogo de definições para encontrar qualquer opção rapidamente.' },
        { type: 'table',
          headers: ['Separador', 'O que configuras'],
          rows: [
            ['Aparência', 'Tema (claro/escuro), família tipográfica, tamanho de texto, espaçamento do layout, compressão do sidebar, painel de fundo (modo conectado), preferências de listagens'],
            ['Vistas', 'Painéis de análise por secção (on/off) e posição (vertical/horizontal)'],
            ['Idioma', 'Língua da interface (Português / Inglês)'],
            ['Empresa', 'Nome, logótipo, NIF, telefone, email, morada e moeda da empresa'],
            ['Relatórios PDF', 'Cabeçalho, cores, marca de água, gráficos, formato e orientação dos PDFs exportados'],
            ['Alertas GPS', 'Que eventos GPS geram alertas e cooldown entre notificações do mesmo tipo'],
            ['Alertas', 'Limiares de quilometragem e dias para alertas de manutenção, licença e seguro'],
            ['Cópias de Segurança', 'Localização e frequência das cópias automáticas da base de dados'],
            ['Bases de Dados', 'Listar e activar bases de dados históricas para consulta'],
            ['Servidor', 'Configurações de ligação ao servidor FleetControl (modo conectado)'],
            ['Licença', 'Informação sobre a licença activa, modo de operação e expiração'],
            ['Sobre', 'Versão da aplicação e informações técnicas'],
          ],
        },
      ],
    },

    // ─── DEFINIÇÕES — APARÊNCIA ───────────────────────────────────────────────
    {
      id: 'settings-appearance',
      title: 'Definições — Aparência',
      content: [
        { type: 'text', text: 'O separador Aparência concentra todas as opções visuais da interface.' },
        { type: 'text', text: 'Tema:' },
        { type: 'list', items: [
          'Alterna entre Modo Claro e Modo Escuro com o botão de lua/sol',
          'O tema é aplicado imediatamente a toda a interface',
        ]},
        { type: 'text', text: 'Tipografia:' },
        { type: 'list', items: [
          'Família tipográfica — escolhe entre as fontes disponíveis (ex: Geist, Inter, etc.)',
          'Tamanho de texto — ajusta o tamanho base da interface (afecta todos os textos proporcionalmente)',
        ]},
        { type: 'text', text: 'Layout:' },
        { type: 'list', items: [
          'Espaçamento — adiciona padding interior às páginas para uma leitura mais arejada',
          'Sidebar compacta — reduz a largura do menu lateral para libertar espaço no conteúdo',
          'Auto-colapso da sidebar — colapsa automaticamente a sidebar ao navegar para uma secção',
        ]},
        { type: 'text', text: 'Painel de Fundo (modo conectado) — controla o painel de vidro translúcido da interface:' },
        { type: 'list', items: [
          'Opacidade — de 40% (transparente) a 100% (sólido)',
          'Desfoque — de 0px (sem desfoque) a 40px (desfoque máximo)',
          'O botão "Repor" adapta-se ao tema activo: mostra apenas "Modo escuro" (predefinição: 95% / 15px) ou "Modo claro" (predefinição: 48% / 13px)',
          '"Guardar como predefinição" — o botão aparece automaticamente quando mexes num dos controlos nesta sessão; ao guardar, os valores ficam como predefinição para o tema activo',
          'O botão de guardar anima-se com um checkmark verde ao confirmar o guardado, e desaparece suavemente',
          '"Repor ao mudar tema" — toggle que aplica automaticamente a predefinição do novo tema sempre que mudas entre claro e escuro',
        ]},
        { type: 'tip', text: 'Para ter valores diferentes nos dois temas: muda para o tema escuro, ajusta os controlos, clica "Guardar (escuro)"; depois muda para o tema claro, ajusta, clica "Guardar (claro)". Activa "Repor ao mudar tema" para aplicação automática.' },
        { type: 'text', text: 'Preferências de Listagens:' },
        { type: 'list', items: [
          'Guardar filtros entre sessões (desligado por padrão) — mantém os filtros activos ao fechar e reabrir',
          'Guardar modo de visualização (ligado por padrão) — lembra a escolha compacto/lista/cartões',
          'Guardar quantidade por página (desligado por padrão) — lembra quantos itens mostrar por página',
          'Guardar página actual (desligado por padrão) — retoma a última página visitada ao reabrir uma listagem',
        ]},
      ],
    },

    // ─── DEFINIÇÕES — VISTAS ──────────────────────────────────────────────────
    {
      id: 'settings-views',
      title: 'Definições — Vistas',
      content: [
        { type: 'text', text: 'O separador Vistas controla os painéis de análise de cada secção e o seu posicionamento.' },
        { type: 'text', text: 'Painéis de Análise — activa ou desactiva o painel de análise para cada módulo:' },
        { type: 'list', items: [
          'Veículos — gráfico de estado da frota, top quilometragem e distribuição por categoria',
          'Motoristas — disponibilidade, turnos activos e categorias de carta',
          'Viagens — taxa de conclusão, distância total e estado das viagens',
          'Combustível — consumo por veículo e evolução de custos',
          'Manutenção — custos e estado das intervenções',
          'Despesas — total, taxa de pagamento e distribuição por categoria',
        ]},
        { type: 'text', text: 'Layout dos Painéis:' },
        { type: 'list', items: [
          'Vertical — painel fixo à direita da listagem (recomendado para ecrãs largos). Os botões de modo de visualização movem-se para a linha da paginação neste layout.',
          'Horizontal — painel aparece acima da listagem, útil em ecrãs mais estreitos.',
        ]},
        { type: 'tip', text: 'Podes usar a pesquisa nas Definições para encontrar rapidamente "Vistas" sem precisar de navegar pelos separadores.' },
      ],
    },
  ],
} as const;
