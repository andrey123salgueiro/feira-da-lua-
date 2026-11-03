import React, { useState } from 'react';
import {
  Printer,
  Download,
  AlertTriangle,
  Send,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Receipt,
  Wallet,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
import { ConfiguracaoFeira, Feira, Feirante } from '../types';
import {
  formatarDataBR,
  formatarMoeda,
  formatarTelefone,
  gerarLinkWhatsApp,
} from '../utils/formatters';

interface ReportsTabProps {
  feiras: Feira[];
  feirantes: Feirante[];
  config: ConfiguracaoFeira;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  feiras,
  feirantes,
  config,
}) => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Filter fairs by date range if specified
  const feirasFiltradas = feiras.filter((f) => {
    if (dataInicio && f.data < dataInicio) return false;
    if (dataFim && f.data > dataFim) return false;
    return true;
  });

  // Calculate consolidated metrics
  let totalGeralArrecadado = 0;
  let totalGeralDinheiro = 0;
  let totalGeralPix = 0;
  let totalGeralDespesas = 0;
  let totalGeralInadimplente = 0;

  interface InadimplenteItem {
    feiraId: string;
    feiraData: string;
    feirante: Feirante;
    valor: number;
  }

  const listaInadimplentes: InadimplenteItem[] = [];

  feirasFiltradas.forEach((f) => {
    let feiraDinheiro = 0;
    let feiraPix = 0;

    // Registros
    Object.values(f.registros || {}).forEach((reg) => {
      const feiranteObj = feirantes.find((item) => item.id === reg.feiranteId);
      const val = reg.valorTaxa || f.taxaPadrao;

      if (reg.presente) {
        if (reg.pagamento === 'dinheiro') {
          feiraDinheiro += val;
        } else if (reg.pagamento === 'pix') {
          feiraPix += val;
        } else if (reg.pagamento === 'pendente') {
          totalGeralInadimplente += val;
          if (feiranteObj) {
            listaInadimplentes.push({
              feiraId: f.id,
              feiraData: f.data,
              feirante: feiranteObj,
              valor: val,
            });
          }
        }
      }
    });

    // Extras
    (f.receitasExtras || []).forEach((r) => {
      if (r.pagamento === 'dinheiro') feiraDinheiro += r.valor;
      else feiraPix += r.valor;
    });

    // Pós-feira
    (f.pagamentosPosFeira || []).forEach((p) => {
      if (p.pagamento === 'dinheiro') feiraDinheiro += p.valor;
      else feiraPix += p.valor;
    });

    // Despesas
    let despDinheiro = 0;
    let despPix = 0;
    (f.despesas || []).forEach((d) => {
      if (d.pagamento === 'dinheiro') despDinheiro += d.valor;
      else despPix += d.valor;
    });

    const totalDesp = despDinheiro + despPix;
    totalGeralDespesas += totalDesp;

    totalGeralDinheiro += feiraDinheiro - despDinheiro;
    totalGeralPix += feiraPix - despPix;
    totalGeralArrecadado += feiraDinheiro + feiraPix;
  });

  const saldoLiquidoConsolidado = totalGeralArrecadado - totalGeralDespesas;

  const exportarCSV = () => {
    let csv = 'Data da Feira;Titulo;Taxa Padrao;Arrecadacao Bruta;Despesas Totais;Saldo Liquido\n';

    feiras.forEach((f) => {
      let bruto = 0;
      let desp = 0;
      Object.values(f.registros || {}).forEach((reg) => {
        if (reg.presente && (reg.pagamento === 'dinheiro' || reg.pagamento === 'pix')) {
          bruto += reg.valorTaxa || f.taxaPadrao;
        }
      });
      (f.receitasExtras || []).forEach((r) => (bruto += r.valor));
      (f.pagamentosPosFeira || []).forEach((p) => (bruto += p.valor));
      (f.despesas || []).forEach((d) => (desp += d.valor));

      csv += `"${f.data}";"${f.titulo}";"${f.taxaPadrao}";"${bruto.toFixed(2)}";"${desp.toFixed(2)}";"${(bruto - desp).toFixed(2)}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-feira-da-lua-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 no-print">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Relatórios e Prestação de Contas Consolidada
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Balanço financeiro geral da Feira da Lua, saldos de caixa, repasses e cobranças pendentes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-amber-400/20"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Balancete Oficial
          </button>
          <button
            onClick={exportarCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Printable Official Header (Only in print) */}
      <div className="print-only text-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase">{config.instituicaoNome}</h1>
        <p className="text-sm font-semibold mt-1">DEMONSTRATIVO FINANCEIRO E PRESTAÇÃO DE CONTAS</p>
        <p className="text-xs text-gray-600">
          {config.localFeira} · {config.cidade} · Emitido em: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* 4 Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-medium">Edições de Feira</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {feirasFiltradas.length}
          </p>
          <span className="text-[11px] text-slate-400">Eventos consolidados</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] uppercase font-medium">Líquido Dinheiro</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatarMoeda(totalGeralDinheiro)}
          </p>
          <span className="text-[11px] text-slate-400">Em espécie no caixa</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-[11px] uppercase font-medium">Líquido PIX</span>
            <QrCode className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {formatarMoeda(totalGeralPix)}
          </p>
          <span className="text-[11px] text-slate-400">Em conta bancária</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/20">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-[11px] uppercase font-medium">Resultado Geral Líquido</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatarMoeda(saldoLiquidoConsolidado)}
          </p>
          <span className="text-[11px] text-slate-400">Receitas - Despesas</span>
        </div>
      </div>

      {/* Debtor / Pending List Section */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Pendências e Inadimplências em Aberto
          </h3>
          <span className="text-xs font-mono font-bold text-rose-400">
            Total em aberto: {formatarMoeda(totalGeralInadimplente)} ({listaInadimplentes.length} barracas)
          </span>
        </div>

        {listaInadimplentes.length === 0 ? (
          <p className="text-xs text-emerald-400 py-4 text-center">
            ✓ Nenhuma pendência em aberto! Todas as barracas estão com as taxas quitadas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <th className="py-2.5 px-3">Data do Evento</th>
                  <th className="py-2.5 px-3">Barraca & Box</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3">Telefone</th>
                  <th className="py-2.5 px-3 text-right">Taxa Devida</th>
                  <th className="py-2.5 px-3 text-center no-print">Cobrança Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {listaInadimplentes.map((item, idx) => {
                  const link = gerarLinkWhatsApp(
                    item.feirante.telefone,
                    item.feirante.nome,
                    item.feiraData,
                    item.valor,
                    config.chavePix,
                    config.titularPix,
                    config.mensagemWhatsAppModelo
                  );

                  return (
                    <tr key={`${item.feiraId}-${item.feirante.id}-${idx}`} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                        {formatarDataBR(item.feiraData)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        Barraca {item.feirante.nome} ({item.feirante.boxNumero})
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {item.feirante.responsavel}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {item.feirante.telefone ? formatarTelefone(item.feirante.telefone) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                        {formatarMoeda(item.valor)}
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Cobrar WhatsApp
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500">Sem telefone</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statement by Fair Edition */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
          Histórico e Extrato Detalhado por Edição
        </h3>

        <div className="space-y-4">
          {feirasFiltradas.map((feira) => {
            let bruto = 0;
            let dinheiro = 0;
            let pix = 0;
            let despDinheiro = 0;
            let despPix = 0;

            Object.values(feira.registros || {}).forEach((reg) => {
              const val = reg.valorTaxa || feira.taxaPadrao;
              if (reg.presente) {
                if (reg.pagamento === 'dinheiro') {
                  dinheiro += val;
                  bruto += val;
                } else if (reg.pagamento === 'pix') {
                  pix += val;
                  bruto += val;
                }
              }
            });

            (feira.receitasExtras || []).forEach((r) => {
              bruto += r.valor;
              if (r.pagamento === 'dinheiro') dinheiro += r.valor;
              else pix += r.valor;
            });

            (feira.pagamentosPosFeira || []).forEach((p) => {
              bruto += p.valor;
              if (p.pagamento === 'dinheiro') dinheiro += p.valor;
              else pix += p.valor;
            });

            (feira.despesas || []).forEach((d) => {
              if (d.pagamento === 'dinheiro') despDinheiro += d.valor;
              else despPix += d.valor;
            });

            const totalDesp = despDinheiro + despPix;
            const liquido = bruto - totalDesp;

            return (
              <div
                key={feira.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <h4 className="font-bold text-white text-sm">
                      Feira do dia {formatarDataBR(feira.data)} · {feira.titulo}
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span>Taxa Padrão: <strong className="font-mono">{formatarMoeda(feira.taxaPadrao)}</strong></span>
                    <span>·</span>
                    <span>Entradas Dinheiro: <strong className="font-mono text-emerald-400">{formatarMoeda(dinheiro)}</strong></span>
                    <span>·</span>
                    <span>Entradas PIX: <strong className="font-mono text-sky-400">{formatarMoeda(pix)}</strong></span>
                    <span>·</span>
                    <span>Despesas: <strong className="font-mono text-rose-400">{formatarMoeda(totalDesp)}</strong></span>
                  </div>

                  {/* Summary of despesas list */}
                  {(feira.despesas || []).length > 0 && (
                    <div className="text-[11px] text-slate-400">
                      <strong>Despesas pagas:</strong>{' '}
                      {feira.despesas.map((d) => `${d.descricao} (${formatarMoeda(d.valor)})`).join(', ')}
                    </div>
                  )}
                </div>

                <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-medium">Saldo Líquido</span>
                  <span className={`text-lg font-bold font-mono tabular-nums ${liquido >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {formatarMoeda(liquido)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Signature block for printed report */}
      <div className="print-only pt-12 grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <div className="border-t border-black pt-2">
            <p className="font-bold">Tesouraria Geral</p>
            <p>{config.instituicaoNome}</p>
          </div>
        </div>
        <div>
          <div className="border-t border-black pt-2">
            <p className="font-bold">Coordenação / Presidência</p>
            <p>Feira da Lua de Arapongas</p>
          </div>
        </div>
      </div>
    </div>
  );
};
