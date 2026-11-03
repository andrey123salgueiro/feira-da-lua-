import React from 'react';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';
import { ConfiguracaoFeira, Feira, Feirante, RegistroFeirante } from '../types';
import { formatarDataBR, formatarMoeda, valorPorExtenso } from '../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  feirante: Feirante | null;
  registro: RegistroFeirante | null;
  feira: Feira | null;
  config: ConfiguracaoFeira;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  feirante,
  registro,
  feira,
  config,
}) => {
  if (!isOpen || !feirante || !registro || !feira) return null;

  const numeroRecibo = `REC-${feira.data.replace(/-/g, '')}-${feirante.boxNumero.replace(/\D/g, '') || '01'}`;
  const dataHoje = new Date().toISOString().split('T')[0];
  const valor = registro.valorTaxa || feira.taxaPadrao;
  const metodoPagto =
    registro.pagamento === 'pix'
      ? 'Transferência Instantânea PIX'
      : registro.pagamento === 'dinheiro'
      ? 'Dinheiro em Espécie'
      : registro.pagamento === 'pago_outro_dia'
      ? 'Quitação Pós-Feira'
      : 'Pendente';

  const imprimir = () => {
    window.print();
  };

  const enviarWhatsApp = () => {
    if (!feirante.telefone) return;
    const phone = feirante.telefone.replace(/\D/g, '');
    const msg = `*COMPROVANTE DE PAGAMENTO DE ALUGUEL - FEIRA DA LUA ARAPONGAS* 🌙\n\n` +
      `*Recibo Nº:* ${numeroRecibo}\n` +
      `*Barraca:* ${feirante.nome} (${feirante.boxNumero})\n` +
      `*Responsável:* ${feirante.responsavel}\n` +
      `*Data da Feira:* ${formatarDataBR(feira.data)}\n` +
      `*Valor Quitado:* ${formatarMoeda(valor)} (${valorPorExtenso(valor)})\n` +
      `*Forma de Pagamento:* ${metodoPagto}\n` +
      `*Local:* ${config.localFeira}\n` +
      `*Instituição:* ${config.instituicaoNome}\n\n` +
      `Constatamos a quitação integral da taxa de ocupação de espaço para a referida edição. Agradecemos sua participação! ✨`;
    
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Recibo Oficial de Quitação</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={imprimir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            {feirante.telefone && (
              <button
                onClick={enviarWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="mt-6 p-6 sm:p-8 rounded-xl bg-slate-950/70 border border-slate-800 space-y-6 print:bg-white print:text-black print:border-black print:p-4">
          {/* Header */}
          <div className="text-center border-b border-slate-800 pb-4 print:border-black">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold print:text-black">
              {config.instituicaoNome}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 print:text-black">
              RECIBO DE ALUGUEL DE ESPAÇO
            </h2>
            <p className="text-xs text-slate-400 mt-1 print:text-gray-700">
              {config.localFeira} · {config.cidade}
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs font-mono text-amber-300 print:text-black print:border-black">
              Nº {numeroRecibo}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-4 text-sm text-slate-300 print:text-black">
            <div className="flex justify-between items-baseline bg-slate-900/80 p-3 rounded-lg border border-slate-800 print:bg-gray-100 print:border-gray-400">
              <span className="text-xs uppercase tracking-wider text-slate-400 print:text-gray-700">Valor Recebido</span>
              <span className="text-xl font-bold text-emerald-400 font-mono print:text-black">
                {formatarMoeda(valor)}
              </span>
            </div>

            <p className="leading-relaxed">
              Recebemos da <strong className="text-white print:text-black">Barraca {feirante.nome}</strong> ({feirante.boxNumero}), representada por <strong className="text-white print:text-black">{feirante.responsavel}</strong>, a quantia supra de <strong className="text-white print:text-black">{valorPorExtenso(valor)}</strong>, referente ao aluguel e ocupação do ponto comercial na edição da <strong className="text-white print:text-black">Feira da Lua</strong> realizada em <strong className="text-white print:text-black">{formatarDataBR(feira.data)}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-800 text-xs print:border-black">
              <div>
                <span className="text-slate-400 block print:text-gray-700">Forma de Quitação:</span>
                <span className="font-semibold text-slate-200 print:text-black">{metodoPagto}</span>
              </div>
              <div>
                <span className="text-slate-400 block print:text-gray-700">Data de Emissão:</span>
                <span className="font-semibold text-slate-200 font-mono print:text-black">{formatarDataBR(dataHoje)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-400 print:text-black">
            <div>
              <div className="border-t border-slate-700 pt-2 print:border-black">
                <p className="font-semibold text-slate-200 print:text-black">Coordenação da Feira da Lua</p>
                <p className="text-[11px] text-slate-400 print:text-gray-600">Arapongas - PR</p>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-700 pt-2 print:border-black">
                <p className="font-semibold text-slate-200 print:text-black">{feirante.responsavel}</p>
                <p className="text-[11px] text-slate-400 print:text-gray-600">Barraca {feirante.nome}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 no-print">
          Este recibo serve de comprovante legal de quitação de taxa de ocupação municipal/institucional.
        </div>
      </div>
    </div>
  );
};
