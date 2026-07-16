// ========================================
// FILE: src/locales/pt/help.ts
// ========================================
export const ptHelp = {
  search: { placeholder: 'Pesquisar ajuda...' },
  noResults: 'Nenhum resultado para',
  connectedOnly: 'Apenas modo conectado',
  footer: 'FleetControl · AKM Systems',

  sections: [
    {
      id: 'intro',
      title: 'Introdução ao FleetControl',
      content: [
        { type: 'text', text: 'O FleetControl é um sistema de gestão de frotas que permite monitorizar veículos, motoristas, viagens, abastecimentos, manutenções, despesas e multas.' },
        { type: 'text', text: 'Existem dois modos de operação:' },
        { type: 'list', items: [
          'Modo Autónomo (Standalone) — funciona completamente offline. Todos os dados são guardados localmente no computador.',
          'Modo Conectado — liga-se ao servidor FleetControl e ao módulo de rastreamento GPS em tempo real via Traccar.',
        ]},
        { type: 'tip', text: 'O modo de operação é determinado pelo tipo de licença activada. Podes ver o teu modo actual em Definições › Licença.' },
      ],
    },
    {
      id: 'dashboard',
      title: 'Painel Inicial',
      content: [
        { type: 'text', text: 'O Painel Inicial apresenta um resumo do estado actual da frota com métricas chave e acesso rápido às secções principais.' },
        { type: 'list', items: [
          'Resumo de veículos activos, em manutenção e fora de serviço',
          'Viagens recentes e estatísticas de combustível',
          'Alertas de manutenções pendentes',
          'Atalhos para as secções mais utilizadas',
        ]},
        { type: 'tip', text: 'Clica nos cartões de resumo para navegar directamente para a secção correspondente.' },
      ],
    },
    {
      id: 'vehicles',
      title: 'Veículos',
      content: [
        { type: 'text', text: 'Gere toda a frota de veículos: regista, edita e consulta o histórico de cada viatura.' },
        { type: 'list', items: [
          'Registo completo: matrícula, marca, modelo, ano, cor, categoria',
          'Número de chassis e estado actual (activo, em manutenção, inactivo)',
          'Histórico de viagens, abastecimentos e manutenções por veículo',
          'Associação ao dispositivo de rastreamento GPS (modo conectado)',
        ]},
        { type: 'steps', steps: [
          'Clica em "+ Novo Veículo" no canto superior direito',
          'Preenche os dados obrigatórios: matrícula, marca, modelo',
          'Selecciona a categoria e o estado inicial',
          'Guarda o registo',
        ]},
        { type: 'tip', text: 'Podes filtrar e ordenar a lista por estado, categoria ou matrícula. Clica no cabeçalho de qualquer coluna para ordenar.' },
      ],
    },
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
          'Observações adicionais',
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
    {
      id: 'fuel',
      title: 'Abastecimentos',
      content: [
        { type: 'text', text: 'Regista todos os abastecimentos de combustível da frota para controlar o consumo e os custos.' },
        { type: 'list', items: [
          'Veículo, data e local do abastecimento',
          'Litros abastecidos, preço por litro e custo total',
          'Leitura do odómetro no momento do abastecimento',
          'Tipo de combustível (gasóleo, gasolina, GLP, etc.)',
          'Cálculo automático do consumo médio (km/L)',
        ]},
        { type: 'tip', text: 'Regista sempre o odómetro em cada abastecimento para que o sistema calcule o consumo médio com precisão.' },
      ],
    },
    {
      id: 'maintenance',
      title: 'Manutenções',
      content: [
        { type: 'text', text: 'Gere as manutenções preventivas e correctivas de todos os veículos da frota.' },
        { type: 'list', items: [
          'Tipo: preventiva, correctiva',
          'Descrição dos trabalhos realizados, diagnóstico e solução',
          'Fornecedor/oficina, data de entrada e data de saída',
          'Quilómetros do veículo no momento da entrada em manutenção e próxima manutenção prevista (km)',
          'Custos de peças, mão-de-obra e total',
          'Prioridade: baixa, normal, alta, urgente',
          'Número de ordem de trabalho (opcional)',
        ]},
        { type: 'warning', text: 'Quando um veículo entra em manutenção, o seu estado muda automaticamente. Marca a manutenção como concluída quando os trabalhos terminarem para restituir o veículo ao serviço.' },
        { type: 'tip', text: 'Define a quilometragem da próxima manutenção ao criar ou concluir um registo. O sistema avisa-te automaticamente no topo da página quando o veículo se aproximar desse valor. Configura o limiar de aviso em Definições › Operações.' },
      ],
    },
    {
      id: 'expenses',
      title: 'Despesas',
      content: [
        { type: 'text', text: 'Regista todas as despesas operacionais da frota, por veículo ou de forma geral.' },
        { type: 'list', items: [
          'Categoria de despesa (portagem, lavagem, seguro, inspecção, etc.)',
          'Veículo associado — opcional para despesas gerais da frota',
          'Data, descrição e valor',
          'Relatórios de despesas por período, veículo ou categoria',
        ]},
        { type: 'tip', text: 'Cria categorias personalizadas para melhor organizar as despesas específicas da tua operação.' },
      ],
    },
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
        ]},
        { type: 'tip', text: 'Define quem é responsável pelo pagamento (empresa ou motorista) ao registar ou editar a multa. Esse campo aparece no detalhe do registo para facilitar a imputação de custos.' },
      ],
    },
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
        { type: 'text', text: 'Personaliza o cabeçalho dos PDFs (logótipo, nome e contactos da empresa) em Definições › Relatórios PDF.' },
        { type: 'tip', text: 'Em modo histórico podes gerar relatórios de bases de dados antigas sem afectar os dados actuais. Consulta a secção "Bases de Dados" para saber como activar este modo.' },
      ],
    },
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
          'Activa as notificações de entrada/saída em Definições do mapa',
        ]},
        { type: 'tip', text: 'Usa o botão "Ver todos os dispositivos" na barra de ferramentas para centrar o mapa em toda a frota de uma vez.' },
      ],
    },
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
        { type: 'tip', text: 'Podes activar/desactivar as notificações nativas em Definições › Alertas GPS. Cada tipo de evento pode ser configurado individualmente.' },
      ],
    },
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
    {
      id: 'settings',
      title: 'Definições — Visão Geral',
      content: [
        { type: 'text', text: 'Acede às Definições através do botão de engrenagem no canto inferior esquerdo (modo autónomo) ou no canto superior direito do painel (modo conectado).' },
        { type: 'table',
          headers: ['Separador', 'O que configuras'],
          rows: [
            ['Aspecto Visual', 'Tema (claro/escuro), tamanho de texto, espaçamento do layout'],
            ['Idioma', 'Língua da interface (Português / Inglês)'],
            ['Empresa', 'Nome, logótipo e informações da empresa para relatórios'],
            ['Relatórios PDF', 'Cabeçalho, rodapé e formato dos PDFs exportados'],
            ['Alertas GPS', 'Que eventos GPS geram alertas e intervalos mínimos entre notificações'],
            ['Cópias de Segurança', 'Localização e frequência das cópias automáticas da base de dados'],
            ['Bases de Dados', 'Listar e activar bases de dados históricas para consulta'],
            ['Servidor', 'Configurações de ligação ao servidor FleetControl (modo conectado)'],
            ['Licença', 'Informação sobre a licença activa, modo de operação e expiração'],
          ],
        },
      ],
    },
    {
      id: 'license',
      title: 'Licença e Activação',
      content: [
        { type: 'text', text: 'O FleetControl é activado através de uma chave de licença fornecida pela AKM Systems. Existem dois tipos de licença:' },
        { type: 'table',
          headers: ['Tipo', 'Características'],
          rows: [
            ['Autónomo', 'Modo offline, dados locais, sem necessidade de servidor'],
            ['Conectado', 'Servidor, rastreamento GPS em tempo real, multi-utilizador'],
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
  ],
} as const;
