import React from 'react';
import { DollarSign, Wallet, QrCode, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';
import { Feira } from '../types';
import { formatarMoeda } from '../utils/formatters';

interface MetricsOverviewProps {
  feira: Feira;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ feira }) => {
  // Cálculo de receitas por taxas
  let totalTaxasDinheiro = 0;
  let totalTaxasPix = 0;
  let totalPendentes = 0;
  let contagemPendentes = 0;
  let contagemPresentes = 0;
  let contagemTotal = 0;

  Object.values(feira.registros).forEach((reg) => {
    contagemTotal++;
    if (reg.presente) {
      contagemPresentes++;
      const val = reg.valorTaxa || feira.taxaPadrao;
      if (reg.pagamento === 'dinheiro') {
        totalTaxasDinheiro += val;
      } else if (reg.pagamento === 'pix') {
        totalTaxasPix += val;
      } else if (reg.pagamento === 'pendente') {
        totalPendentes += val;
        contagemPendentes++;
      }
    }
  });

  // Receitas extras
  let extrasDinheiro = 0;
  let extrasPix = 0;
  (feira.receitasExtras || []).forEach((r) => {
    if (r.pagamento === 'dinheiro') extrasDinheiro += r.valor;
    else extrasPix += r.valor;
  });

  // Quitações pós-feira
  let posDinheiro = 0;
  let posPix = 0;
  (feira.pagamentosPosFeira || []).forEach((p) => {
    if (p.pagamento === 'dinheiro') posDinheiro += p.valor;
    else posPix += p.valor;
  });

  // Despesas
  let despesasDinheiro = 0;
  let despesasPix = 0;
  (feira.despesas || []).forEach((d) => {
    if (d.pagamento === 'dinheiro') despesasDinheiro += d.valor;
    else despesasPix += d.valor;
  });

  const totalArrecadadoBruto =
    totalTaxasDinheiro + totalTaxasPix + extrasDinheiro + extrasPix + posDinheiro + posPix;
  const totalDespesas = despesasDinheiro + despesasPix;
  const saldoLiquidoGeral = totalArrecadadoBruto - totalDespesas;

  const saldoLiquidoDinheiro = totalTaxasDinheiro + extrasDinheiro + posDinheiro - despesasDinheiro;
  const saldoLiquidoPix = totalTaxasPix + extrasPix + posPix - despesasPix;

  return (
    <div className="space-y-4">
      {/* 5-Column Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Bruto */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Arrecadação Bruta</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
              {formatarMoeda(totalArrecadadoBruto)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {contagemPresentes} de {contagemTotal} barracas presentes
          </p>
        </div>

        {/* Card 2: Dinheiro em Espécie */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Caixa em Dinheiro</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {formatarMoeda(saldoLiquidoDinheiro)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Entradas: {formatarMoeda(totalTaxasDinheiro + extrasDinheiro + posDinheiro)}
          </p>
        </div>

        {/* Card 3: Pix Bancário */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Caixa em PIX</span>
            <QrCode className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-sky-400">
              {formatarMoeda(saldoLiquidoPix)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Entradas: {formatarMoeda(totalTaxasPix + extrasPix + posPix)}
          </p>
        </div>

        {/* Card 4: Despesas */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Despesas Totais</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-400">
              {formatarMoeda(totalDespesas)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {(feira.despesas || []).length} despesas lançadas
          </p>
        </div>

        {/* Card 5: Saldo Líquido do Evento */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-[11px] font-medium uppercase tracking-wider">Saldo Líquido</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span
              className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                saldoLiquidoGeral >= 0 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {formatarMoeda(saldoLiquidoGeral)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Lucro institucional retido
          </p>
        </div>
      </div>

      {/* Inadimplência Notice Banner (if any pending) */}
      {contagemPendentes > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Atenção:</strong> Há <strong>{contagemPendentes} barraca(s)</strong> presente(s) com pagamento pendente, totalizando <strong className="font-mono">{formatarMoeda(totalPendentes)}</strong> em aberto.
            </span>
          </div>
          <span className="text-xs text-amber-400 font-medium">Use a cobrança rápida via WhatsApp abaixo</span>
        </div>
      )}
    </div>
  );
};
