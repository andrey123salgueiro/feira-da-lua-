import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Check,
  Plus,
  Trash2,
  FileText,
  Send,
  Receipt,
  PiggyBank,
  Clock,
  Printer,
  ChevronDown,
} from 'lucide-react';
import {
  ConfiguracaoFeira,
  Despesa,
  Feira,
  Feirante,
  FormaPagamento,
  ReceitaExtra,
} from '../types';
import {
  formatarDataBR,
  formatarMoeda,
  formatarTelefone,
  gerarLinkWhatsApp,
} from '../utils/formatters';
import { MetricsOverview } from './MetricsOverview';

interface FairManagerTabProps {
  feiras: Feira[];
  feiraAtivaId: string;
  onSelecionarFeira: (id: string) => void;
  feirantes: Feirante[];
  config: ConfiguracaoFeira;
  onAtualizarPagamento: (feiranteId: string, novoPagamento: FormaPagamento) => void;
  onAtualizarPresenca: (feiranteId: string, presente: boolean) => void;
  onAtualizarTaxaIndividual: (feiranteId: string, novaTaxa: number) => void;
  onAdicionarDespesa: (despesa: Omit<Despesa, 'id'>) => void;
  onRemoverDespesa: (despesaId: string) => void;
  onAdicionarReceitaExtra: (receita: Omit<ReceitaExtra, 'id'>) => void;
  onRemoverReceitaExtra: (receitaId: string) => void;
  onAdicionarPagamentoPosFeira: (feiranteId: string, valor: number, pagamento: 'dinheiro' | 'pix', dataPg: string) => void;
  onRemoverPagamentoPosFeira: (posId: string) => void;
  onMarcarTodosPresentes: () => void;
  onEmitirRecibo: (feirante: Feirante) => void;
  onExcluirFeiraAtual: () => void;
  modoAdmin: boolean;
}

export const FairManagerTab: React.FC<FairManagerTabProps> = ({
  feiras,
  feiraAtivaId,
  onSelecionarFeira,
  feirantes,
  config,
  onAtualizarPagamento,
  onAtualizarPresenca,
  onAtualizarTaxaIndividual,
  onAdicionarDespesa,
  onRemoverDespesa,
  onAdicionarReceitaExtra,
  onRemoverReceitaExtra,
  onAdicionarPagamentoPosFeira,
  onRemoverPagamentoPosFeira,
  onMarcarTodosPresentes,
  onEmitirRecibo,
  onExcluirFeiraAtual,
  modoAdmin,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'presentes' | 'pendentes' | 'dinheiro' | 'pix' | 'ausentes'
  >('todos');

  // Form states for extra revenue
  const [descExtra, setDescExtra] = useState('');
  const [valorExtra, setValorExtra] = useState('');
  const [formaExtra, setFormaExtra] = useState<'dinheiro' | 'pix'>('dinheiro');

  // Form states for expenses
  const [descDespesa, setDescDespesa] = useState('');
  const [catDespesa, setCatDespesa] = useState<Despesa['categoria']>('Limpeza');
  const [valorDespesa, setValorDespesa] = useState('');
  const [formaDespesa, setFormaDespesa] = useState<'dinheiro' | 'pix'>('dinheiro');

  // Form states for post-fair payment
  const [posFeiranteId, setPosFeiranteId] = useState('');
  const [posValor, setPosValor] = useState('');
  const [posData, setPosData] = useState(new Date().toISOString().split('T')[0]);
  const [posForma, setPosForma] = useState<'dinheiro' | 'pix'>('pix');

  const feiraAtiva = feiras.find((f) => f.id === feiraAtivaId) || feiras[0];
  if (!feiraAtiva) {
    return (
      <div className="p-8 text-center text-slate-400">
        Nenhuma feira cadastrada. Crie uma nova feira para iniciar o controle.
      </div>
    );
  }

  // Handle forms
  const submitReceitaExtra = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valorExtra);
    if (!descExtra.trim() || isNaN(val) || val <= 0) return;
    onAdicionarReceitaExtra({
      descricao: descExtra.trim(),
      valor: val,
      pagamento: formaExtra,
      data: feiraAtiva.data,
    });
    setDescExtra('');
    setValorExtra('');
  };

  const submitDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valorDespesa);
    if (!descDespesa.trim() || isNaN(val) || val <= 0) return;
    onAdicionarDespesa({
      descricao: descDespesa.trim(),
      categoria: catDespesa,
      valor: val,
      pagamento: formaDespesa,
      data: feiraAtiva.data,
    });
    setDescDespesa('');
    setValorDespesa('');
  };

  const submitPosFeira = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(posValor);
    if (!posFeiranteId || isNaN(val) || val <= 0) return;
    onAdicionarPagamentoPosFeira(posFeiranteId, val, posForma, posData);
    setPosFeiranteId('');
    setPosValor('');
  };

  // Filter stalls
  const feirantesFiltrados = feirantes.filter((f) => {
    const termo = busca.toLowerCase();
    const coincideTexto =
      f.nome.toLowerCase().includes(termo) ||
      f.responsavel.toLowerCase().includes(termo) ||
      f.boxNumero.toLowerCase().includes(termo) ||
      f.segmento.toLowerCase().includes(termo);

    if (!coincideTexto) return false;

    const reg = feiraAtiva.registros[f.id] || {
      feiranteId: f.id,
      presente: false,
      pagamento: 'pendente',
      valorTaxa: feiraAtiva.taxaPadrao,
    };

    if (filtroStatus === 'presentes') return reg.presente;
    if (filtroStatus === 'ausentes') return !reg.presente;
    if (filtroStatus === 'pendentes') return reg.presente && reg.pagamento === 'pendente';
    if (filtroStatus === 'dinheiro') return reg.presente && reg.pagamento === 'dinheiro';
    if (filtroStatus === 'pix') return reg.presente && reg.pagamento === 'pix';

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Event Selector and Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              {feiraAtiva.titulo}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Data: <strong className="text-slate-200 font-mono">{formatarDataBR(feiraAtiva.data)}</strong></span>
            <span>·</span>
            <span>Taxa Padrão: <strong className="text-teal-400 font-mono">{formatarMoeda(feiraAtiva.taxaPadrao)}</strong></span>
            <span>·</span>
            <span>Local: <span className="text-slate-300">{config.localFeira}</span></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Fair Selector Dropdown */}
          <div className="relative">
            <select
              value={feiraAtiva.id}
              onChange={(e) => onSelecionarFeira(e.target.value)}
              aria-label="Selecionar edição da Feira da Lua"
              className="appearance-none bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2 pr-8 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
            >
              {feiras.map((f) => (
                <option key={f.id} value={f.id}>
                  {formatarDataBR(f.data)} - {f.titulo}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir Relatório</span>
          </button>

          {modoAdmin && (
            <button
              onClick={onExcluirFeiraAtual}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium rounded-xl border border-rose-900/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excluir Feira</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Overview */}
      <MetricsOverview feira={feiraAtiva} />

      {/* Main Section: Attendance & Rent Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Barracas & Pagamentos</span>
              <span className="text-xs text-slate-400 font-normal">
                ({feirantesFiltrados.length} de {feirantes.length})
              </span>
            </h3>

            {/* Quick Bulk Action */}
            {modoAdmin && (
              <button
                onClick={onMarcarTodosPresentes}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition-colors"
              >
                <Check className="w-3 h-3" />
                Marcar Todos Presentes
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar barraca, box, dono..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 w-44 sm:w-56"
              />
            </div>

            {/* Segmented filter */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setFiltroStatus('todos')}
                className={`px-2 py-1 rounded transition-colors ${
                  filtroStatus === 'todos' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroStatus('pendentes')}
                className={`px-2 py-1 rounded transition-colors ${
                  filtroStatus === 'pendentes' ? 'bg-rose-950 text-rose-300 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFiltroStatus('pix')}
                className={`px-2 py-1 rounded transition-colors ${
                  filtroStatus === 'pix' ? 'bg-sky-950 text-sky-300 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                PIX
              </button>
              <button
                onClick={() => setFiltroStatus('dinheiro')}
                className={`px-2 py-1 rounded transition-colors ${
                  filtroStatus === 'dinheiro' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dinheiro
              </button>
              <button
                onClick={() => setFiltroStatus('ausentes')}
                className={`px-2 py-1 rounded transition-colors ${
                  filtroStatus === 'ausentes' ? 'bg-slate-800 text-slate-300 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ausentes
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Barraca & Ponto</th>
                <th className="py-3 px-4">Responsável & Contato</th>
                <th className="py-3 px-4 text-center">Presença</th>
                <th className="py-3 px-4 text-center">Forma de Pagamento</th>
                <th className="py-3 px-4 text-right">Taxa (R$)</th>
                <th className="py-3 px-4 text-center no-print">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {feirantesFiltrados.map((feirante) => {
                const reg = feiraAtiva.registros[feirante.id] || {
                  feiranteId: feirante.id,
                  presente: false,
                  pagamento: 'pendente',
                  valorTaxa: feiraAtiva.taxaPadrao,
                };

                const taxaAtual = reg.valorTaxa || feiraAtiva.taxaPadrao;
                const linkWhatsApp = feirante.telefone
                  ? gerarLinkWhatsApp(
                      feirante.telefone,
                      feirante.nome,
                      feiraAtiva.data,
                      taxaAtual,
                      config.chavePix,
                      config.titularPix,
                      config.mensagemWhatsAppModelo
                    )
                  : null;

                return (
                  <tr
                    key={feirante.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      !reg.presente ? 'opacity-65' : ''
                    }`}
                  >
                    {/* Barraca */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] font-bold text-teal-400 shrink-0">
                          {feirante.boxNumero.replace(/\D/g, '') || 'BX'}
                        </span>
                        <div>
                          <span className="font-bold text-white text-sm block">
                            Barraca {feirante.nome}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {feirante.segmento} · {feirante.boxNumero}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contato */}
                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-medium">
                        {feirante.responsavel}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {feirante.telefone ? formatarTelefone(feirante.telefone) : 'Sem telefone'}
                      </div>
                    </td>

                    {/* Presença Switch */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onAtualizarPresenca(feirante.id, !reg.presente)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          reg.presente
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {reg.presente ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Presente
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            Ausente
                          </>
                        )}
                      </button>
                    </td>

                    {/* Forma de Pagamento */}
                    <td className="py-3 px-4 text-center">
                      {reg.presente ? (
                        <div className="inline-flex items-center gap-0.5 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                          <button
                            title="Pago em Dinheiro"
                            onClick={() => onAtualizarPagamento(feirante.id, 'dinheiro')}
                            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                              reg.pagamento === 'dinheiro'
                                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Dinheiro
                          </button>
                          <button
                            title="Pago via PIX"
                            onClick={() => onAtualizarPagamento(feirante.id, 'pix')}
                            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                              reg.pagamento === 'pix'
                                ? 'bg-sky-600 text-white font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            PIX
                          </button>
                          <button
                            title="Aluguel Pendente"
                            onClick={() => onAtualizarPagamento(feirante.id, 'pendente')}
                            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                              reg.pagamento === 'pendente'
                                ? 'bg-rose-600 text-white font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Pendente
                          </button>
                          <button
                            title="Quitação Pós-Feira"
                            onClick={() => onAtualizarPagamento(feirante.id, 'pago_outro_dia')}
                            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                              reg.pagamento === 'pago_outro_dia'
                                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Pós-Feira
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Não presente</span>
                      )}
                    </td>

                    {/* Taxa (R$) */}
                    <td className="py-3 px-4 text-right">
                      {modoAdmin ? (
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={taxaAtual}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) onAtualizarTaxaIndividual(feirante.id, v);
                          }}
                          className="w-20 bg-slate-950 border border-slate-800 text-right px-2 py-1 rounded text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-400"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-200">
                          {formatarMoeda(taxaAtual)}
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        {reg.presente && reg.pagamento === 'pendente' && linkWhatsApp && (
                          <a
                            href={linkWhatsApp}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium rounded-lg transition-colors"
                            title="Cobrar via WhatsApp com mensagem pronta"
                          >
                            <Send className="w-3 h-3" />
                            Cobrar
                          </a>
                        )}

                        <button
                          onClick={() => onEmitirRecibo(feirante)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg border border-slate-700 transition-colors"
                          title="Emitir Recibo Oficial de Aluguel"
                        >
                          <FileText className="w-3 h-3 text-teal-400" />
                          Recibo
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Secondary Financial Management Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bloco 1: Quitações Pós-Feira */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Quitações Pós-Feira
            </h3>
            <span className="text-[11px] text-purple-300 font-mono">
              {(feiraAtiva.pagamentosPosFeira || []).length} quitados
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Lançamento de feirantes que estavam devendo e quitaram a taxa dias depois.
          </p>

          {modoAdmin && (
            <form onSubmit={submitPosFeira} className="space-y-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <select
                value={posFeiranteId}
                onChange={(e) => setPosFeiranteId(e.target.value)}
                required
                aria-label="Selecionar barraca para quitação pós-feira"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              >
                <option value="">Selecione a Barraca...</option>
                {feirantes.map((f) => (
                  <option key={f.id} value={f.id}>
                    Barraca {f.nome} ({f.boxNumero})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="date"
                  value={posData}
                  onChange={(e) => setPosData(e.target.value)}
                  required
                  aria-label="Data do pagamento pós-feira"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="R$ 55,00"
                  value={posValor}
                  onChange={(e) => setPosValor(e.target.value)}
                  required
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
                />
                <select
                  value={posForma}
                  onChange={(e) => setPosForma(e.target.value as 'dinheiro' | 'pix')}
                  aria-label="Forma de pagamento da quitação pós-feira"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                >
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Quitação
              </button>
            </form>
          )}

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {(feiraAtiva.pagamentosPosFeira || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center italic">Nenhuma quitação pós-feira.</p>
            ) : (
              feiraAtiva.pagamentosPosFeira.map((p) => {
                const f = feirantes.find((item) => item.id === p.feiranteId);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">
                        Barraca {f?.nome || 'Feirante'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {formatarDataBR(p.dataPagamento)} · {p.pagamento.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-400">
                        {formatarMoeda(p.valor)}
                      </span>
                      {modoAdmin && (
                        <button
                          onClick={() => onRemoverPagamentoPosFeira(p.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bloco 2: Receitas Extras */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              Receitas Extras & Saldos
            </h3>
            <span className="text-[11px] text-emerald-300 font-mono">
              {(feiraAtiva.receitasExtras || []).length} itens
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Fundo de reserva, energia extra, saldo de feira anterior ou patrocínios.
          </p>

          {modoAdmin && (
            <form onSubmit={submitReceitaExtra} className="space-y-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <input
                type="text"
                placeholder="Descrição (ex: Energia extra, Apoio)"
                value={descExtra}
                onChange={(e) => setDescExtra(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Valor (R$)"
                  value={valorExtra}
                  onChange={(e) => setValorExtra(e.target.value)}
                  required
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
                />
                <select
                  value={formaExtra}
                  onChange={(e) => setFormaExtra(e.target.value as 'dinheiro' | 'pix')}
                  aria-label="Forma de pagamento da receita extra"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Receita
              </button>
            </form>
          )}

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {(feiraAtiva.receitasExtras || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center italic">Nenhuma receita extra registrada.</p>
            ) : (
              feiraAtiva.receitasExtras.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{r.descricao}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {r.pagamento.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">
                      {formatarMoeda(r.valor)}
                    </span>
                    {modoAdmin && (
                      <button
                        onClick={() => onRemoverReceitaExtra(r.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bloco 3: Despesas Detalhadas */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              Despesas do Evento
            </h3>
            <span className="text-[11px] text-rose-300 font-mono">
              {(feiraAtiva.despesas || []).length} despesas
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Limpeza, som, locutor, coordenação, aluguel de mesas e estrutura.
          </p>

          {modoAdmin && (
            <form onSubmit={submitDespesa} className="space-y-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <input
                type="text"
                placeholder="Descrição (ex: Limpeza pátio, Locução)"
                value={descDespesa}
                onChange={(e) => setDescDespesa(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              />

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={catDespesa}
                  onChange={(e) => setCatDespesa(e.target.value as Despesa['categoria'])}
                  aria-label="Categoria da despesa"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px]"
                >
                  <option value="Limpeza">Limpeza</option>
                  <option value="Locutor & Som">Locutor & Som</option>
                  <option value="Coordenação">Coordenação</option>
                  <option value="Divulgação">Divulgação</option>
                  <option value="Mesas & Cadeiras">Mesas</option>
                  <option value="Infraestrutura">Infra</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Atrações & Outros">Atrações</option>
                  <option value="Outros">Outros</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="R$ 90,00"
                  value={valorDespesa}
                  onChange={(e) => setValorDespesa(e.target.value)}
                  required
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
                />
                <select
                  value={formaDespesa}
                  onChange={(e) => setFormaDespesa(e.target.value as 'dinheiro' | 'pix')}
                  aria-label="Forma de pagamento da despesa"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Lançar Despesa
              </button>
            </form>
          )}

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {(feiraAtiva.despesas || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center italic">Nenhuma despesa lançada.</p>
            ) : (
              feiraAtiva.despesas.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{d.descricao}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {d.categoria} · {d.pagamento.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400">
                      {formatarMoeda(d.valor)}
                    </span>
                    {modoAdmin && (
                      <button
                        onClick={() => onRemoverDespesa(d.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
