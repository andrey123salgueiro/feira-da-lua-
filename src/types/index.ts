export type FormaPagamento = 'pendente' | 'dinheiro' | 'pix' | 'pago_outro_dia' | 'isento';

export interface Feirante {
  id: string;
  nome: string; // Nome da barraca (ex: "Bisteca", "Batata Frita", "Pastel")
  responsavel: string; // Pessoa de contato
  telefone: string; // Telefone com DDD (ex: "43999998888")
  segmento: string; // Ex: Gastronomia, Lanches, Bebidas, Sobremesas, Infantil
  boxNumero: string; // Ex: "Box 01", "Box 02"
  localizacao: 'Ala Gourmet' | 'Ala Central' | 'Ala Bebidas & Doces' | 'Área Kids & Artesanato';
  ativo: boolean;
  observacoes?: string;
}

export interface RegistroFeirante {
  feiranteId: string;
  presente: boolean;
  pagamento: FormaPagamento;
  valorTaxa: number;
  dataPagamento?: string;
  reciboNumero?: string;
  observacoes?: string;
}

export interface ReceitaExtra {
  id: string;
  descricao: string;
  valor: number;
  pagamento: 'dinheiro' | 'pix';
  data: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: 'Limpeza' | 'Locutor & Som' | 'Coordenação' | 'Divulgação' | 'Mesas & Cadeiras' | 'Infraestrutura' | 'Segurança' | 'Atrações & Outros' | 'Outros';
  valor: number;
  pagamento: 'dinheiro' | 'pix';
  data: string;
}

export interface PagamentoPosFeira {
  id: string;
  feiranteId: string;
  dataPagamento: string;
  valor: number;
  pagamento: 'dinheiro' | 'pix';
  observacao?: string;
}

export interface Feira {
  id: string;
  data: string; // YYYY-MM-DD
  titulo: string;
  taxaPadrao: number;
  status: 'agendada' | 'em_andamento' | 'encerrada';
  registros: Record<string, RegistroFeirante>;
  receitasExtras: ReceitaExtra[];
  despesas: Despesa[];
  pagamentosPosFeira: PagamentoPosFeira[];
  observacoes?: string;
}

export interface ConfiguracaoFeira {
  instituicaoNome: string;
  localFeira: string;
  cidade: string;
  chavePix: string;
  titularPix: string;
  bancoPix: string;
  taxaPadraoGlobal: number;
  mensagemWhatsAppModelo: string;
  temaCor?: 'esmeralda' | 'safira' | 'cobre';
  modoEscuro?: boolean;
}

export type TabTipo = 'feiras' | 'mapa' | 'feirantes' | 'relatorios' | 'configuracoes';
