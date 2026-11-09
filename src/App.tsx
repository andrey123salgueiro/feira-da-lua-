import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ConfiguracaoFeira,
  Despesa,
  Feira,
  Feirante,
  FormaPagamento,
  ReceitaExtra,
  TabTipo,
} from './types';
import { CONFIG_INICIAL, FEIRAS_INICIAIS, FEIRANTES_INICIAIS } from './data/initialData';
import { Header } from './components/Header';
import { FairManagerTab } from './components/FairManagerTab';
import { FairMapTab } from './components/FairMapTab';
import { StallsTab } from './components/StallsTab';
import { ReportsTab } from './components/ReportsTab';
import { SettingsTab } from './components/SettingsTab';
import { ReceiptModal } from './components/ReceiptModal';
import { NewFairModal } from './components/NewFairModal';
import { EditStallModal } from './components/EditStallModal';

const STORAGE_KEY_FEIRAS = 'feira_lua_feiras_v3';
const STORAGE_KEY_FEIRANTES = 'feira_lua_feirantes_v3';
const STORAGE_KEY_CONFIG = 'feira_lua_config_v3';

export default function App() {
  const [feirantes, setFeirantes] = useState<Feirante[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEY_FEIRANTES);
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        console.error(e);
      }
    }
    return FEIRANTES_INICIAIS;
  });

  const [feiras, setFeiras] = useState<Feira[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEY_FEIRAS);
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        console.error(e);
      }
    }
    return FEIRAS_INICIAIS;
  });

  const [config, setConfig] = useState<ConfiguracaoFeira>(() => {
    const salvo = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        console.error(e);
      }
    }
    return CONFIG_INICIAL;
  });

  const [feiraAtivaId, setFeiraAtivaId] = useState<string>(() => {
    return feiras[0]?.id || 'feira-2026-11-05';
  });

  const [tabAtiva, setTabAtiva] = useState<TabTipo>('feiras');
  const [modoAdmin, setModoAdmin] = useState(true);

  // Modals state
  const [modalNovaFeiraAberta, setModalNovaFeiraAberta] = useState(false);
  const [modalFeiranteAberto, setModalFeiranteAberto] = useState(false);
  const [feiranteEmEdicao, setFeiranteEmEdicao] = useState<Feirante | null>(null);

  const [modalReciboAberto, setModalReciboAberto] = useState(false);
  const [feiranteParaRecibo, setFeiranteParaRecibo] = useState<Feirante | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FEIRANTES, JSON.stringify(feirantes));
  }, [feirantes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FEIRAS, JSON.stringify(feiras));
  }, [feiras]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  // Current active fair
  const feiraAtiva = feiras.find((f) => f.id === feiraAtivaId) || feiras[0];

  // Theme background styling
  const tema = config.temaCor || 'esmeralda';

  const getBackgroundGradient = () => {
    if (tema === 'safira') {
      return 'radial-gradient(circle at 15% 15%, rgba(14, 165, 233, 0.09) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.07) 0%, transparent 40%), linear-gradient(180deg, #070d18 0%, #0b1424 50%, #070d18 100%)';
    }
    if (tema === 'cobre') {
      return 'radial-gradient(circle at 15% 15%, rgba(249, 115, 22, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(244, 63, 94, 0.06) 0%, transparent 40%), linear-gradient(180deg, #140d0a 0%, #1c130f 50%, #140d0a 100%)';
    }
    // Default: Esmeralda & Menta
    return 'radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.09) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.07) 0%, transparent 40%), linear-gradient(180deg, #060e15 0%, #0a1722 50%, #060e15 100%)';
  };

  // Handlers for payments and fair records
  const handleAtualizarPagamento = (feiranteId: string, novoPagamento: FormaPagamento) => {
    if (!feiraAtiva) return;

    if (novoPagamento === 'pix' || novoPagamento === 'dinheiro') {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.8 },
        colors: novoPagamento === 'pix' ? ['#0284c7', '#38bdf8', '#7dd3fc'] : ['#059669', '#10b981', '#34d399'],
      });
    }

    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        const regAtual = f.registros[feiranteId] || {
          feiranteId,
          presente: true,
          pagamento: 'pendente',
          valorTaxa: f.taxaPadrao,
        };
        return {
          ...f,
          registros: {
            ...f.registros,
            [feiranteId]: {
              ...regAtual,
              pagamento: novoPagamento,
              dataPagamento: novoPagamento !== 'pendente' ? new Date().toISOString() : undefined,
            },
          },
        };
      })
    );

    const fObj = feirantes.find((item) => item.id === feiranteId);
    mostrarToast(`Barraca ${fObj?.nome || 'Feirante'}: pagamento ${novoPagamento.toUpperCase()}`);
  };

  const handleAtualizarPresenca = (feiranteId: string, presente: boolean) => {
    if (!feiraAtiva) return;

    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        const regAtual = f.registros[feiranteId] || {
          feiranteId,
          presente: false,
          pagamento: 'pendente',
          valorTaxa: f.taxaPadrao,
        };
        return {
          ...f,
          registros: {
            ...f.registros,
            [feiranteId]: {
              ...regAtual,
              presente,
            },
          },
        };
      })
    );

    const fObj = feirantes.find((item) => item.id === feiranteId);
    mostrarToast(`Barraca ${fObj?.nome || 'Feirante'} marcada como ${presente ? 'Presente' : 'Ausente'}`);
  };

  const handleAtualizarTaxaIndividual = (feiranteId: string, novaTaxa: number) => {
    if (!feiraAtiva) return;

    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        const regAtual = f.registros[feiranteId] || {
          feiranteId,
          presente: true,
          pagamento: 'pendente',
          valorTaxa: f.taxaPadrao,
        };
        return {
          ...f,
          registros: {
            ...f.registros,
            [feiranteId]: {
              ...regAtual,
              valorTaxa: novaTaxa,
            },
          },
        };
      })
    );
  };

  const handleAdicionarDespesa = (despesa: Omit<Despesa, 'id'>) => {
    if (!feiraAtiva) return;
    const nova: Despesa = {
      ...despesa,
      id: `desp-${Date.now()}`,
    };

    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        return {
          ...f,
          despesas: [...(f.despesas || []), nova],
        };
      })
    );
    mostrarToast('Despesa lançada com sucesso');
  };

  const handleRemoverDespesa = (despesaId: string) => {
    if (!feiraAtiva) return;
    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        return {
          ...f,
          despesas: (f.despesas || []).filter((d) => d.id !== despesaId),
        };
      })
    );
    mostrarToast('Despesa removida');
  };

  const handleAdicionarReceitaExtra = (receita: Omit<ReceitaExtra, 'id'>) => {
    if (!feiraAtiva) return;
    const nova: ReceitaExtra = {
      ...receita,
      id: `rex-${Date.now()}`,
    };

    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        return {
          ...f,
          receitasExtras: [...(f.receitasExtras || []), nova],
        };
      })
    );
    mostrarToast('Receita extra adicionada');
  };

  const handleRemoverReceitaExtra = (receitaId: string) => {
    if (!feiraAtiva) return;
    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        return {
          ...f,
          receitasExtras: (f.receitasExtras || []).filter((r) => r.id !== receitaId),
        };
      })
    );
    mostrarToast('Receita extra removida');
  };

  const handleAdicionarPagamentoPosFeira = (
    feiranteId: string,
    valor: number,
    pagamento: 'dinheiro' | 'pix',
    dataPg: string
  ) => {
    if (!feiraAtiva) return;
    const novoPos = {
      id: `pos-${Date.now()}`,
      feiranteId,
      valor,
      pagamento,
      dataPagamento: dataPg,
    };

    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        const regAtual = f.registros[feiranteId] || {
          feiranteId,
          presente: true,
          pagamento: 'pendente',
          valorTaxa: f.taxaPadrao,
        };
        return {
          ...f,
          pagamentosPosFeira: [...(f.pagamentosPosFeira || []), novoPos],
          registros: {
            ...f.registros,
            [feiranteId]: {
              ...regAtual,
              pagamento: 'pago_outro_dia',
              dataPagamento: dataPg,
            },
          },
        };
      })
    );
    mostrarToast('Quitação pós-feira registrada!');
  };

  const handleRemoverPagamentoPosFeira = (posId: string) => {
    if (!feiraAtiva) return;
    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        return {
          ...f,
          pagamentosPosFeira: (f.pagamentosPosFeira || []).filter((p) => p.id !== posId),
        };
      })
    );
  };

  const handleMarcarTodosPresentes = () => {
    if (!feiraAtiva) return;
    setFeiras((prev) =>
      prev.map((f) => {
        if (f.id !== feiraAtiva.id) return f;
        const novosRegistros = { ...f.registros };
        feirantes.forEach((feirante) => {
          novosRegistros[feirante.id] = {
            feiranteId: feirante.id,
            presente: true,
            pagamento: novosRegistros[feirante.id]?.pagamento || 'pendente',
            valorTaxa: novosRegistros[feirante.id]?.valorTaxa || f.taxaPadrao,
          };
        });
        return {
          ...f,
          registros: novosRegistros,
        };
      })
    );
    mostrarToast('Todas as barracas foram marcadas como presentes');
  };

  const handleCriarFeira = (novaFeiraData: Omit<Feira, 'id'>) => {
    const novaFeira: Feira = {
      ...novaFeiraData,
      id: `feira-${novaFeiraData.data}-${Date.now()}`,
    };
    setFeiras((prev) => [novaFeira, ...prev]);
    setFeiraAtivaId(novaFeira.id);
    mostrarToast(`Nova feira criada com sucesso para ${novaFeira.data}`);
  };

  const handleExcluirFeiraAtual = () => {
    if (!feiraAtiva) return;
    if (feiras.length <= 1) {
      alert('Não é possível excluir a única feira do sistema.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a feira do dia ${feiraAtiva.data}?`)) {
      const restantes = feiras.filter((f) => f.id !== feiraAtiva.id);
      setFeiras(restantes);
      setFeiraAtivaId(restantes[0].id);
      mostrarToast('Feira excluída com sucesso');
    }
  };

  const handleSalvarFeirante = (feiranteData: Omit<Feirante, 'id'>, id?: string) => {
    if (id) {
      setFeirantes((prev) =>
        prev.map((item) => (item.id === id ? { ...feiranteData, id } : item))
      );
      mostrarToast(`Barraca ${feiranteData.nome} atualizada`);
    } else {
      const novoId = `f-${Date.now()}`;
      const novo: Feirante = { ...feiranteData, id: novoId };
      setFeirantes((prev) => [...prev, novo]);

      if (feiraAtiva) {
        setFeiras((prev) =>
          prev.map((f) => {
            if (f.id !== feiraAtiva.id) return f;
            return {
              ...f,
              registros: {
                ...f.registros,
                [novoId]: {
                  feiranteId: novoId,
                  presente: true,
                  pagamento: 'pendente',
                  valorTaxa: f.taxaPadrao,
                },
              },
            };
          })
        );
      }
      mostrarToast(`Barraca ${feiranteData.nome} cadastrada com sucesso!`);
    }
  };

  const handleAlternarStatusFeirante = (id: string) => {
    setFeirantes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ativo: !item.ativo } : item))
    );
  };

  const handleExcluirFeirante = (id: string) => {
    const fObj = feirantes.find((f) => f.id === id);
    if (window.confirm(`Deseja remover o cadastro da Barraca ${fObj?.nome || ''}?`)) {
      setFeirantes((prev) => prev.filter((f) => f.id !== id));
      mostrarToast(`Barraca removida do cadastro`);
    }
  };

  const handleRestaurarDadosPadrao = () => {
    setFeiras(FEIRAS_INICIAIS);
    setFeirantes(FEIRANTES_INICIAIS);
    setConfig(CONFIG_INICIAL);
    setFeiraAtivaId(FEIRAS_INICIAIS[0].id);
    mostrarToast('Dados autênticos de Arapongas restaurados');
  };

  const handleImportarBackup = (dados: {
    config: ConfiguracaoFeira;
    feiras: Feira[];
    feirantes: Feirante[];
  }) => {
    setConfig(dados.config);
    setFeiras(dados.feiras);
    setFeirantes(dados.feirantes);
    if (dados.feiras.length > 0) {
      setFeiraAtivaId(dados.feiras[0].id);
    }
  };

  const handleEmitirRecibo = (feirante: Feirante) => {
    setFeiranteParaRecibo(feirante);
    setModalReciboAberto(true);
  };

  const registroParaRecibo =
    feiraAtiva && feiranteParaRecibo
      ? feiraAtiva.registros[feiranteParaRecibo.id] || {
          feiranteId: feiranteParaRecibo.id,
          presente: true,
          pagamento: 'dinheiro',
          valorTaxa: feiraAtiva.taxaPadrao,
        }
      : null;

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Decorative backdrop according to selected theme */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-75 transition-all duration-500"
        style={{
          background: getBackgroundGradient(),
        }}
      />

      {/* Header */}
      <Header
        tabAtiva={tabAtiva}
        onMudarTab={setTabAtiva}
        onAbrirNovaFeira={() => setModalNovaFeiraAberta(true)}
        modoAdmin={modoAdmin}
        onAlternarModoAdmin={() => setModoAdmin(!modoAdmin)}
        config={config}
        onAlternarTemaCor={(cor) => setConfig((prev) => ({ ...prev, temaCor: cor }))}
        onAlternarModoEscuro={() => setConfig((prev) => ({ ...prev, modoEscuro: !prev.modoEscuro }))}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tabAtiva === 'feiras' && (
          <FairManagerTab
            feiras={feiras}
            feiraAtivaId={feiraAtiva?.id || ''}
            onSelecionarFeira={setFeiraAtivaId}
            feirantes={feirantes}
            config={config}
            onAtualizarPagamento={handleAtualizarPagamento}
            onAtualizarPresenca={handleAtualizarPresenca}
            onAtualizarTaxaIndividual={handleAtualizarTaxaIndividual}
            onAdicionarDespesa={handleAdicionarDespesa}
            onRemoverDespesa={handleRemoverDespesa}
            onAdicionarReceitaExtra={handleAdicionarReceitaExtra}
            onRemoverReceitaExtra={handleRemoverReceitaExtra}
            onAdicionarPagamentoPosFeira={handleAdicionarPagamentoPosFeira}
            onRemoverPagamentoPosFeira={handleRemoverPagamentoPosFeira}
            onMarcarTodosPresentes={handleMarcarTodosPresentes}
            onEmitirRecibo={handleEmitirRecibo}
            onExcluirFeiraAtual={handleExcluirFeiraAtual}
            modoAdmin={modoAdmin}
          />
        )}

        {tabAtiva === 'mapa' && (
          <FairMapTab
            feirantes={feirantes}
            feira={feiraAtiva}
            config={config}
            onAtualizarPagamento={handleAtualizarPagamento}
            onAtualizarPresenca={handleAtualizarPresenca}
            onEmitirRecibo={handleEmitirRecibo}
            modoAdmin={modoAdmin}
          />
        )}

        {tabAtiva === 'feirantes' && (
          <StallsTab
            feirantes={feirantes}
            onAbrirModalNovoFeirante={() => {
              setFeiranteEmEdicao(null);
              setModalFeiranteAberto(true);
            }}
            onEditarFeirante={(f) => {
              setFeiranteEmEdicao(f);
              setModalFeiranteAberto(true);
            }}
            onAlternarStatusFeirante={handleAlternarStatusFeirante}
            onExcluirFeirante={handleExcluirFeirante}
            modoAdmin={modoAdmin}
          />
        )}

        {tabAtiva === 'relatorios' && (
          <ReportsTab feiras={feiras} feirantes={feirantes} config={config} />
        )}

        {tabAtiva === 'configuracoes' && (
          <SettingsTab
            config={config}
            onSalvarConfig={setConfig}
            feiras={feiras}
            feirantes={feirantes}
            onRestaurarDadosPadrao={handleRestaurarDadosPadrao}
            onImportarBackup={handleImportarBackup}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 text-center py-4 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {config.instituicaoNome} · {config.localFeira} · {config.cidade}
          </span>
          <span className="text-[11px] text-slate-400">
            Controle de Aluguel & Arrecadação das Barracas
          </span>
        </div>
      </footer>

      {/* Modals */}
      <NewFairModal
        isOpen={modalNovaFeiraAberta}
        onClose={() => setModalNovaFeiraAberta(false)}
        onCriarFeira={handleCriarFeira}
        feirantes={feirantes}
        taxaPadraoGlobal={config.taxaPadraoGlobal}
      />

      <EditStallModal
        isOpen={modalFeiranteAberto}
        onClose={() => setModalFeiranteAberto(false)}
        feirante={feiranteEmEdicao}
        onSalvar={handleSalvarFeirante}
      />

      <ReceiptModal
        isOpen={modalReciboAberto}
        onClose={() => setModalReciboAberto(false)}
        feirante={feiranteParaRecibo}
        registro={registroParaRecibo}
        feira={feiraAtiva}
        config={config}
      />

      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
