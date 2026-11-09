import React, { useState, useEffect } from 'react';
import { X, Store } from 'lucide-react';
import { Feirante } from '../types';

interface EditStallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feirante: Feirante | null;
  onSalvar: (feirante: Omit<Feirante, 'id'>, id?: string) => void;
}

export const EditStallModal: React.FC<EditStallModalProps> = ({
  isOpen,
  onClose,
  feirante,
  onSalvar,
}) => {
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [segmento, setSegmento] = useState('');
  const [boxNumero, setBoxNumero] = useState('');
  const [localizacao, setLocalizacao] = useState<Feirante['localizacao']>('Ala Gourmet');
  const [ativo, setAtivo] = useState(true);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (feirante) {
      setNome(feirante.nome);
      setResponsavel(feirante.responsavel);
      setTelefone(feirante.telefone);
      setSegmento(feirante.segmento);
      setBoxNumero(feirante.boxNumero);
      setLocalizacao(feirante.localizacao);
      setAtivo(feirante.ativo);
      setObservacoes(feirante.observacoes || '');
    } else {
      setNome('');
      setResponsavel('');
      setTelefone('');
      setSegmento('Gastronomia & Lanches');
      setBoxNumero('Box 22');
      setLocalizacao('Ala Gourmet');
      setAtivo(true);
      setObservacoes('');
    }
  }, [feirante, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !responsavel.trim()) return;

    onSalvar(
      {
        nome: nome.trim(),
        responsavel: responsavel.trim(),
        telefone: telefone.trim(),
        segmento: segmento.trim(),
        boxNumero: boxNumero.trim(),
        localizacao,
        ativo,
        observacoes: observacoes.trim(),
      },
      feirante?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">
              {feirante ? `Editar Barraca ${feirante.nome}` : 'Cadastrar Nova Barraca'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Nome da Barraca (ex: Bisteca, Batata Frita)
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: Batata Frita"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Número do Box / Ponto
              </label>
              <input
                type="text"
                value={boxNumero}
                onChange={(e) => setBoxNumero(e.target.value)}
                required
                placeholder="Ex: Box 05"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Nome do Responsável / Feirante</label>
              <input
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                required
                placeholder="Ex: Carlos Alberto"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">WhatsApp / Telefone com DDD</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="43999998888"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Segmento / Produtos</label>
              <input
                type="text"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                required
                placeholder="Ex: Carnes na Chapa & Porções"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Ala / Setor da Feira</label>
              <select
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value as Feirante['localizacao'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
              >
                <option value="Ala Gourmet">Ala Gourmet (Chapas, Carnes, Massas)</option>
                <option value="Ala Central">Ala Central (Porções, Fritas, Salgados)</option>
                <option value="Ala Bebidas & Doces">Ala Bebidas & Doces</option>
                <option value="Área Kids & Artesanato">Área Kids & Artesanato</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Observações Internas (Opcional)</label>
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Ponto próximo à caixa de energia"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="ativo-checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
            />
            <label htmlFor="ativo-checkbox" className="text-slate-300 font-medium cursor-pointer">
              Barraca Ativa para as próximas edições da Feira
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
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
              Salvar Barraca
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
