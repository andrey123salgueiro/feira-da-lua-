import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Store,
  MapPin,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Feirante } from '../types';
import { formatarTelefone } from '../utils/formatters';

interface StallsTabProps {
  feirantes: Feirante[];
  onAbrirModalNovoFeirante: () => void;
  onEditarFeirante: (feirante: Feirante) => void;
  onAlternarStatusFeirante: (id: string) => void;
  onExcluirFeirante: (id: string) => void;
  modoAdmin: boolean;
}

export const StallsTab: React.FC<StallsTabProps> = ({
  feirantes,
  onAbrirModalNovoFeirante,
  onEditarFeirante,
  onAlternarStatusFeirante,
  onExcluirFeirante,
  modoAdmin,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');

  const categorias = Array.from(new Set(feirantes.map((f) => f.localizacao)));

  const filtrados = feirantes.filter((f) => {
    const termo = busca.toLowerCase();
    const coincideTexto =
      f.nome.toLowerCase().includes(termo) ||
      f.responsavel.toLowerCase().includes(termo) ||
      f.boxNumero.toLowerCase().includes(termo) ||
      f.segmento.toLowerCase().includes(termo);

    if (!coincideTexto) return false;
    if (filtroCategoria !== 'todos' && f.localizacao !== filtroCategoria) return false;

    return true;
  });

  const totalAtivas = feirantes.filter((f) => f.ativo).length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            Cadastro e Controle de Barracas · Feira da Lua
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão dos pontos fixos e feirantes autorizados a comercializar no espaço da Estação das Feiras.
          </p>
        </div>

        {modoAdmin && (
          <button
            onClick={onAbrirModalNovoFeirante}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-sm shadow-emerald-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Nova Barraca
          </button>
        )}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Total de Barracas</span>
          <p className="text-xl font-bold font-mono text-white mt-1 tabular-nums">{feirantes.length}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-emerald-400 uppercase font-medium">Pontos Ativos</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">{totalAtivas}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-teal-400 uppercase font-medium">Pontos Inativos</span>
          <p className="text-xl font-bold font-mono text-teal-400 mt-1 tabular-nums">
            {feirantes.length - totalAtivas}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-sky-400 uppercase font-medium">Setores & Alas</span>
          <p className="text-xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {categorias.length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome da barraca, responsável ou segmento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFiltroCategoria('todos')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filtroCategoria === 'todos'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            Todas as Alas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                filtroCategoria === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stalls Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <th className="py-3 px-4">Box</th>
                <th className="py-3 px-4">Nome da Barraca</th>
                <th className="py-3 px-4">Responsável & Contato</th>
                <th className="py-3 px-4">Segmento / Produto</th>
                <th className="py-3 px-4">Setor / Ala</th>
                <th className="py-3 px-4 text-center">Status</th>
                {modoAdmin && <th className="py-3 px-4 text-right no-print">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    Nenhuma barraca encontrada com os filtros informados.
                  </td>
                </tr>
              ) : (
                filtrados.map((feirante) => (
                  <tr
                    key={feirante.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      !feirante.ativo ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Box */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20 text-[11px]">
                        {feirante.boxNumero}
                      </span>
                    </td>

                    {/* Nome da Barraca */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">
                        Barraca {feirante.nome}
                      </div>
                      {feirante.observacoes && (
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {feirante.observacoes}
                        </div>
                      )}
                    </td>

                    {/* Responsável & WhatsApp */}
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">{feirante.responsavel}</div>
                      {feirante.telefone ? (
                        <a
                          href={`https://wa.me/55${feirante.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 hover:underline mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {formatarTelefone(feirante.telefone)}
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">Sem telefone</span>
                      )}
                    </td>

                    {/* Segmento */}
                    <td className="py-3 px-4 text-slate-300">
                      {feirante.segmento}
                    </td>

                    {/* Localização */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {feirante.localizacao}
                      </span>
                    </td>

                    {/* Status Ativo/Inativo */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => modoAdmin && onAlternarStatusFeirante(feirante.id)}
                        disabled={!modoAdmin}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          feirante.ativo
                            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {feirante.ativo ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>

                    {/* Ações */}
                    {modoAdmin && (
                      <td className="py-3 px-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditarFeirante(feirante)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Editar Barraca"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onExcluirFeirante(feirante.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Excluir Barraca"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
