import React, { useState } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  RefreshCw,
  QrCode,
  Building,
  MessageSquare,
  Check,
  Palette,
} from 'lucide-react';
import { ConfiguracaoFeira, Feira, Feirante } from '../types';

interface SettingsTabProps {
  config: ConfiguracaoFeira;
  onSalvarConfig: (novaConfig: ConfiguracaoFeira) => void;
  feiras: Feira[];
  feirantes: Feirante[];
  onRestaurarDadosPadrao: () => void;
  onImportarBackup: (dados: { config: ConfiguracaoFeira; feiras: Feira[]; feirantes: Feirante[] }) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  config,
  onSalvarConfig,
  feiras,
  feirantes,
  onRestaurarDadosPadrao,
  onImportarBackup,
}) => {
  const [formData, setFormData] = useState<ConfiguracaoFeira>(config);
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarConfig(formData);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2500);
  };

  const handleExportarBackup = () => {
    const backup = {
      config: formData,
      feiras,
      feirantes,
      exportadoEm: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-feira-da-lua-arapongas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const conteudo = JSON.parse(event.target?.result as string);
        if (conteudo.feiras && conteudo.feirantes) {
          onImportarBackup({
            config: conteudo.config || formData,
            feiras: conteudo.feiras,
            feirantes: conteudo.feirantes,
          });
          alert('Backup importado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Configurações da Feira & Identidade Visual
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Personalize as cores do aplicativo, informações da associação, chave Pix para cobranças e recibos.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
        {/* Section 0: Escolha das Cores Principais */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Palette className="w-4 h-4 text-emerald-400" />
            Paleta de Cores do Sistema
          </h3>
          <p className="text-xs text-slate-400">
            Escolha uma combinação visual exclusiva que diferencia este sistema de qualquer versão anterior:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Esmeralda */}
            <div
              onClick={() => setFormData({ ...formData, temaCor: 'esmeralda' })}
              className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
                (formData.temaCor || 'esmeralda') === 'esmeralda'
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500"></span>
                <span className="w-4 h-4 rounded-full bg-teal-400"></span>
                <span className="w-4 h-4 rounded-full bg-cyan-400"></span>
              </div>
              <h4 className="text-xs font-bold text-white">Esmeralda & Menta</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Visual fresco, sofisticado e moderno.
              </p>
            </div>

            {/* Safira */}
            <div
              onClick={() => setFormData({ ...formData, temaCor: 'safira' })}
              className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
                formData.temaCor === 'safira'
                  ? 'bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full bg-blue-600"></span>
                <span className="w-4 h-4 rounded-full bg-sky-500"></span>
                <span className="w-4 h-4 rounded-full bg-cyan-300"></span>
              </div>
              <h4 className="text-xs font-bold text-white">Azul Safira & Ciano</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Visual institucional corporativo de alta tecnologia.
              </p>
            </div>

            {/* Cobre */}
            <div
              onClick={() => setFormData({ ...formData, temaCor: 'cobre' })}
              className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
                formData.temaCor === 'cobre'
                  ? 'bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full bg-amber-700"></span>
                <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                <span className="w-4 h-4 rounded-full bg-rose-400"></span>
              </div>
              <h4 className="text-xs font-bold text-white">Cobre & Terracota</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Visual artesanal refinado com tons terrosos.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Instituição */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building className="w-4 h-4 text-teal-400" />
            Dados da Instituição & Local
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Nome da Instituição / Associação</label>
              <input
                type="text"
                value={formData.instituicaoNome}
                onChange={(e) => setFormData({ ...formData, instituicaoNome: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Local da Feira</label>
              <input
                type="text"
                value={formData.localFeira}
                onChange={(e) => setFormData({ ...formData, localFeira: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Cidade & UF</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Taxa Padrão Global de Aluguel (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.taxaPadraoGlobal}
                onChange={(e) =>
                  setFormData({ ...formData, taxaPadraoGlobal: parseFloat(e.target.value) || 0 })
                }
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Chave Pix */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
            <QrCode className="w-4 h-4 text-sky-400" />
            Dados para Recebimento via PIX
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Chave PIX Oficial</label>
              <input
                type="text"
                value={formData.chavePix}
                onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Nome do Titular / Favorecido</label>
              <input
                type="text"
                value={formData.titularPix}
                onChange={(e) => setFormData({ ...formData, titularPix: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Banco / Instituição Financeira</label>
              <input
                type="text"
                value={formData.bancoPix}
                onChange={(e) => setFormData({ ...formData, bancoPix: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Mensagem WhatsApp */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Modelo da Mensagem de Cobrança WhatsApp
          </h3>
          <p className="text-[11px] text-slate-400">
            Variáveis disponíveis:{' '}
            <code className="text-teal-300 font-mono">{"{barraca}"}</code>,{' '}
            <code className="text-teal-300 font-mono">{"{data}"}</code>,{' '}
            <code className="text-teal-300 font-mono">{"{valor}"}</code>,{' '}
            <code className="text-teal-300 font-mono">{"{chave_pix}"}</code>,{' '}
            <code className="text-teal-300 font-mono">{"{titular_pix}"}</code>
          </p>
          <textarea
            rows={4}
            value={formData.mensagemWhatsAppModelo}
            onChange={(e) => setFormData({ ...formData, mensagemWhatsAppModelo: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-400 font-sans"
          />
        </div>

        {/* Submit button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-sm shadow-emerald-500/25"
          >
            {salvoFeedback ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                Configurações Salvas com Sucesso!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>

      {/* Backup and Restore Section */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-800">
          Backup, Exportação & Restauração de Dados
        </h3>
        <p className="text-xs text-slate-400">
          Você pode salvar uma cópia completa de segurança em arquivo JSON contendo todas as feiras, barracas e despesas.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportarBackup}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-teal-400" />
            Baixar Backup Completo (JSON)
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-sky-400" />
            Importar Arquivo de Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportarArquivo}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Deseja restaurar as 21 barracas e o histórico de Arapongas? Seus dados atuais serão reiniciados.'
                )
              ) {
                onRestaurarDadosPadrao();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-xl border border-rose-900/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Restaurar Dados de Arapongas
          </button>
        </div>
      </div>
    </div>
  );
};
