import React from 'react';
import { Sparkles, Plus, ShieldCheck, UserCheck, Palette, Sun, Moon } from 'lucide-react';
import { ConfiguracaoFeira, TabTipo } from '../types';

interface HeaderProps {
  tabAtiva: TabTipo;
  onMudarTab: (tab: TabTipo) => void;
  onAbrirNovaFeira: () => void;
  modoAdmin: boolean;
  onAlternarModoAdmin: () => void;
  config: ConfiguracaoFeira;
  onAlternarTemaCor: (cor: 'esmeralda' | 'safira' | 'cobre') => void;
  onAlternarModoEscuro: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tabAtiva,
  onMudarTab,
  onAbrirNovaFeira,
  modoAdmin,
  onAlternarModoAdmin,
  config,
  onAlternarTemaCor,
  onAlternarModoEscuro,
}) => {
  const tabs: { id: TabTipo; label: string }[] = [
    { id: 'feiras', label: 'Feira Atual' },
    { id: 'mapa', label: 'Mapa das Barracas' },
    { id: 'feirantes', label: 'Cadastro de Barracas' },
    { id: 'relatorios', label: 'Relatórios' },
    { id: 'configuracoes', label: 'Configurações' },
  ];

  const tema = config.temaCor || 'esmeralda';
  const isDark = config.modoEscuro !== false;

  // Colors based on selected theme
  const getBrandClasses = () => {
    if (tema === 'safira') {
      return {
        gradient: 'from-blue-600 via-sky-500 to-cyan-400',
        textAccent: 'text-sky-400',
        activeNav: 'bg-sky-600 text-white shadow-sky-600/25',
        primaryBtn: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
      };
    }
    if (tema === 'cobre') {
      return {
        gradient: 'from-amber-700 via-orange-600 to-rose-400',
        textAccent: 'text-orange-400',
        activeNav: 'bg-orange-600 text-white shadow-orange-600/25',
        primaryBtn: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
      };
    }
    // Default: Esmeralda
    return {
      gradient: 'from-emerald-600 via-teal-500 to-cyan-400',
      textAccent: 'text-emerald-400',
      activeNav: 'bg-emerald-600 text-white shadow-emerald-600/25',
      primaryBtn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    };
  };

  const colors = getBrandClasses();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand wordmark (single line, distinctive modern gradient) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${colors.gradient} flex items-center justify-center shadow-md text-slate-950`}>
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              Feira da Lua <span className={`${colors.textAccent} font-semibold`}>Arapongas</span>
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">
              Gestão de Aluguel & Espaços
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const ativa = tabAtiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onMudarTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  ativa
                    ? `${colors.activeNav} font-semibold shadow-sm`
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions and Theme switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Palette Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => onAlternarTemaCor('esmeralda')}
              title="Paleta Esmeralda & Menta"
              className={`w-5 h-5 rounded-full bg-emerald-500 transition-transform ${
                tema === 'esmeralda' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            />
            <button
              onClick={() => onAlternarTemaCor('safira')}
              title="Paleta Azul Safira & Ciano"
              className={`w-5 h-5 rounded-full bg-sky-500 transition-transform ${
                tema === 'safira' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            />
            <button
              onClick={() => onAlternarTemaCor('cobre')}
              title="Paleta Cobre & Terracota"
              className={`w-5 h-5 rounded-full bg-orange-500 transition-transform ${
                tema === 'cobre' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            />
          </div>

          {modoAdmin && (
            <button
              onClick={onAbrirNovaFeira}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold ${colors.primaryBtn} rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0`}
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
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {modoAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
                  ? `${colors.activeNav} font-semibold`
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
