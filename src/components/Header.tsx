import React from 'react';
import { Moon, Plus, ShieldCheck, UserCheck } from 'lucide-react';
import { TabTipo } from '../types';

interface HeaderProps {
  tabAtiva: TabTipo;
  onMudarTab: (tab: TabTipo) => void;
  onAbrirNovaFeira: () => void;
  modoAdmin: boolean;
  onAlternarModoAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tabAtiva,
  onMudarTab,
  onAbrirNovaFeira,
  modoAdmin,
  onAlternarModoAdmin,
}) => {
  const tabs: { id: TabTipo; label: string }[] = [
    { id: 'feiras', label: 'Feira Atual' },
    { id: 'mapa', label: 'Mapa das Barracas' },
    { id: 'feirantes', label: 'Cadastro de Barracas' },
    { id: 'relatorios', label: 'Relatórios' },
    { id: 'configuracoes', label: 'Configurações' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand wordmark (single line, no subtitle pill) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
            <Moon className="w-5 h-5 fill-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              Feira da Lua <span className="text-amber-400 font-normal">Arapongas</span>
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">
              Controle de Aluguel & Gestão
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, clean text with active indicator) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const ativa = tabAtiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onMudarTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  ativa
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm shadow-amber-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {modoAdmin && (
            <button
              onClick={onAbrirNovaFeira}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors shadow-sm shadow-amber-400/25 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Feira</span>
            </button>
          )}

          <button
            onClick={onAlternarModoAdmin}
            title={modoAdmin ? 'Alternar para Modo Fiscal' : 'Alternar para Modo Administrador'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              modoAdmin
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {modoAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Tesouraria (Admin)</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modo Fiscal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-slate-900 overflow-x-auto bg-slate-950/95 scrollbar-none">
        {tabs.map((tab) => {
          const ativa = tabAtiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onMudarTab(tab.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                ativa
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
