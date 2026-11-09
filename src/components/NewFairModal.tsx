import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Feira, Feirante } from '../types';

interface NewFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCriarFeira: (novaFeira: Omit<Feira, 'id'>) => void;
  feirantes: Feirante[];
  taxaPadraoGlobal: number;
}

export const NewFairModal: React.FC<NewFairModalProps> = ({
  isOpen,
  onClose,
  onCriarFeira,
  feirantes,
  taxaPadraoGlobal,
}) => {
  const dataHoje = new Date().toISOString().split('T')[0];
  const [data, setData] = useState(dataHoje);
  const [titulo, setTitulo] = useState('Feira da Lua - Estação das Feiras');
  const [taxaPadrao, setTaxaPadrao] = useState(taxaPadraoGlobal.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taxaNum = parseFloat(taxaPadrao) || taxaPadraoGlobal;

    // Build initial stall records for all registered stalls
    const registrosIniciais: Record<string, any> = {};
    feirantes.forEach((f) => {
      registrosIniciais[f.id] = {
        feiranteId: f.id,
        presente: f.ativo,
        pagamento: 'pendente',
        valorTaxa: taxaNum,
      };
    });

    onCriarFeira({
      data,
      titulo: titulo.trim() || 'Feira da Lua - Estação das Feiras',
      taxaPadrao: taxaNum,
      status: 'em_andamento',
      registros: registrosIniciais,
      receitasExtras: [],
      despesas: [],
      pagamentosPosFeira: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">Criar Nova Edição da Feira</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Data do Evento</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Título da Edição</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ex: Feira da Lua - Estação das Feiras"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Taxa de Aluguel Padrão (R$)</label>
            <input
              type="number"
              step="0.50"
              min="0"
              value={taxaPadrao}
              onChange={(e) => setTaxaPadrao(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Todas as {feirantes.length} barracas cadastradas serão incluídas automaticamente com esta taxa base.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
            >
              Iniciar Feira
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
