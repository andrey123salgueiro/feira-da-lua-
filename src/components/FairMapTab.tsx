import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle,
  AlertCircle,
  QrCode,
  Banknote,
  Send,
  FileText,
  User,
  Phone,
  Tag,
  Filter,
} from 'lucide-react';
import { ConfiguracaoFeira, Feira, Feirante, FormaPagamento } from '../types';
import { formatarMoeda, formatarTelefone, gerarLinkWhatsApp } from '../utils/formatters';

interface FairMapTabProps {
  feirantes: Feirante[];
  feira: Feira;
  config: ConfiguracaoFeira;
  onAtualizarPagamento: (feiranteId: string, novoPagamento: FormaPagamento) => void;
  onAtualizarPresenca: (feiranteId: string, presente: boolean) => void;
  onEmitirRecibo: (feirante: Feirante) => void;
  modoAdmin: boolean;
}

export const FairMapTab: React.FC<FairMapTabProps> = ({
  feirantes,
  feira,
  config,
  onAtualizarPagamento,
  onAtualizarPresenca,
  onEmitirRecibo,
  modoAdmin,
}) => {
  const [feiranteSelecionadoId, setFeiranteSelecionadoId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pagos' | 'pendentes' | 'ausentes'>('todos');

  const feiranteSelecionado = feirantes.find((f) => f.id === feiranteSelecionadoId) || null;
  const registroSelecionado = feiranteSelecionado
    ? feira.registros[feiranteSelecionado.id] || {
        feiranteId: feiranteSelecionado.id,
        presente: false,
        pagamento: 'pendente',
        valorTaxa: feira.taxaPadrao,
      }
    : null;

  // Setores do mapa
  const setores: {
    titulo: string;
    localizacao: Feirante['localizacao'];
    corBorda: string;
    descricao: string;
  }[] = [
    {
      titulo: 'Ala Gourmet Principal (Chapas, Massas & Carnes)',
      localizacao: 'Ala Gourmet',
      corBorda: 'border-amber-500/30',
      descricao: 'Bisteca, Macarrão, Grego, Perohê, Pernil, Espetinhos, Alpha Burguer, Torresmo e Culinária Típica',
    },
    {
      titulo: 'Ala Central de Lanches & Porções Rápidas',
      localizacao: 'Ala Central',
      corBorda: 'border-sky-500/30',
      descricao: 'Batata Frita, Pastéis, Batata Recheada, Hot Dog, Pizza Cone e Peixe Frito',
    },
    {
      titulo: 'Ala de Doces, Sucos & Bebidas Artesanais',
      localizacao: 'Ala Bebidas & Doces',
      corBorda: 'border-emerald-500/30',
      descricao: 'Sucos Naturais, Caldo de Cana, Churros Gourmet, Crepes e Doces',
    },
    {
      titulo: 'Área Kids, Brinquedos & Lazer Familiar',
      localizacao: 'Área Kids & Artesanato',
      corBorda: 'border-purple-500/30',
      descricao: 'Val Brinquedos, Pula-Pula e Atrações Infantis',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top filter banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Mapa Interativo dos Boxes · Estação das Feiras (Arapongas)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique em qualquer barraca para gerenciar presença, pagamento de aluguel ou emitir recibo instantâneo.
          </p>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filtroStatus === 'todos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({feirantes.length})
          </button>
          <button
            onClick={() => setFiltroStatus('pagos')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filtroStatus === 'pagos' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pagas
          </button>
          <button
            onClick={() => setFiltroStatus('pendentes')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filtroStatus === 'pendentes' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFiltroStatus('ausentes')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filtroStatus === 'ausentes' ? 'bg-slate-800 text-slate-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ausentes
          </button>
        </div>
      </div>

      {/* Main Grid: Visual sectors representing the square */}
      <div className="space-y-6">
        {setores.map((setor) => {
          const barracasSetor = feirantes.filter((f) => f.localizacao === setor.localizacao);
          if (barracasSetor.length === 0) return null;

          return (
            <div key={setor.localizacao} className={`p-4 sm:p-5 rounded-2xl bg-slate-950/70 border ${setor.corBorda}`}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4 pb-2 border-b border-slate-800/80">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  {setor.titulo}
                </h3>
                <span className="text-[11px] text-slate-400">{setor.descricao}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {barracasSetor.map((barraca) => {
                  const reg = feira.registros[barraca.id] || {
                    feiranteId: barraca.id,
                    presente: false,
                    pagamento: 'pendente',
                    valorTaxa: feira.taxaPadrao,
                  };

                  // Filter condition
                  const estaPago = reg.presente && (reg.pagamento === 'pix' || reg.pagamento === 'dinheiro' || reg.pagamento === 'pago_outro_dia');
                  const estaPendente = reg.presente && reg.pagamento === 'pendente';
                  const estaAusente = !reg.presente;

                  if (filtroStatus === 'pagos' && !estaPago) return null;
                  if (filtroStatus === 'pendentes' && !estaPendente) return null;
                  if (filtroStatus === 'ausentes' && !estaAusente) return null;

                  const isSelecionado = feiranteSelecionadoId === barraca.id;

                  let badgeBg = 'bg-slate-800/60 border-slate-700 text-slate-400';
                  let statusTexto = 'Ausente';
                  let statusIcon = null;

                  if (!reg.presente) {
                    badgeBg = 'bg-slate-900 border-slate-800 text-slate-400';
                    statusTexto = 'Ausente';
                  } else if (reg.pagamento === 'pix') {
                    badgeBg = 'bg-sky-950/70 border-sky-600/50 text-sky-300';
                    statusTexto = 'Pago PIX';
                    statusIcon = <QrCode className="w-3.5 h-3.5 text-sky-400" />;
                  } else if (reg.pagamento === 'dinheiro') {
                    badgeBg = 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300';
                    statusTexto = 'Pago Dinheiro';
                    statusIcon = <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
                  } else if (reg.pagamento === 'pago_outro_dia') {
                    badgeBg = 'bg-purple-950/70 border-purple-600/50 text-purple-300';
                    statusTexto = 'Pós-Feira';
                    statusIcon = <CheckCircle className="w-3.5 h-3.5 text-purple-400" />;
                  } else if (reg.pagamento === 'pendente') {
                    badgeBg = 'bg-amber-950/80 border-amber-500/60 text-amber-300 animate-pulse';
                    statusTexto = 'Aluguel Pendente';
                    statusIcon = <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
                  } else if (reg.pagamento === 'isento') {
                    badgeBg = 'bg-slate-800 border-slate-600 text-slate-300';
                    statusTexto = 'Isento';
                  }

                  return (
                    <div
                      key={barraca.id}
                      onClick={() => setFeiranteSelecionadoId(barraca.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between min-h-[105px] ${
                        isSelecionado
                          ? 'ring-2 ring-amber-400 bg-slate-900 border-amber-400/80 shadow-lg shadow-amber-400/10'
                          : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-amber-400/90 font-semibold uppercase">
                            {barraca.boxNumero}
                          </span>
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            Barraca {barraca.nome}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {barraca.responsavel}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-300 tabular-nums">
                          {formatarMoeda(reg.valorTaxa || feira.taxaPadrao)}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${badgeBg}`}>
                          {statusIcon}
                          {statusTexto}
                        </span>

                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                          {barraca.segmento.split('&')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected stall inspector drawer / modal */}
      {feiranteSelecionado && registroSelecionado && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-amber-500/30 p-4 sm:p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Stall metadata */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded">
                  {feiranteSelecionado.boxNumero}
                </span>
                <h3 className="text-lg font-bold text-white">
                  Barraca {feiranteSelecionado.nome}
                </h3>
                <span className="text-xs text-slate-400">· {feiranteSelecionado.segmento}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {feiranteSelecionado.responsavel}
                </span>
                {feiranteSelecionado.telefone && (
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    {formatarTelefone(feiranteSelecionado.telefone)}
                  </span>
                )}
                <span className="font-mono text-amber-400 font-semibold">
                  Taxa: {formatarMoeda(registroSelecionado.valorTaxa || feira.taxaPadrao)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Presença switch */}
              <button
                onClick={() =>
                  onAtualizarPresenca(feiranteSelecionado.id, !registroSelecionado.presente)
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  registroSelecionado.presente
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {registroSelecionado.presente ? 'Presente na Feira' : 'Marcado como Ausente'}
              </button>

              {/* Payment selector */}
              {registroSelecionado.presente && (
                <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onAtualizarPagamento(feiranteSelecionado.id, 'dinheiro')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      registroSelecionado.pagamento === 'dinheiro'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dinheiro
                  </button>
                  <button
                    onClick={() => onAtualizarPagamento(feiranteSelecionado.id, 'pix')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      registroSelecionado.pagamento === 'pix'
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    PIX
                  </button>
                  <button
                    onClick={() => onAtualizarPagamento(feiranteSelecionado.id, 'pendente')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      registroSelecionado.pagamento === 'pendente'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pendente
                  </button>
                  <button
                    onClick={() => onAtualizarPagamento(feiranteSelecionado.id, 'pago_outro_dia')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      registroSelecionado.pagamento === 'pago_outro_dia'
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pós-Feira
                  </button>
                </div>
              )}

              {/* Action buttons */}
              {feiranteSelecionado.telefone && (
                <a
                  href={
                    gerarLinkWhatsApp(
                      feiranteSelecionado.telefone,
                      feiranteSelecionado.nome,
                      feira.data,
                      registroSelecionado.valorTaxa || feira.taxaPadrao,
                      config.chavePix,
                      config.titularPix,
                      config.mensagemWhatsAppModelo
                    ) || '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Cobrar WhatsApp
                </a>
              )}

              <button
                onClick={() => onEmitirRecibo(feiranteSelecionado)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Recibo
              </button>

              <button
                onClick={() => setFeiranteSelecionadoId(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
