export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor || 0);
}

export function formatarDataBR(dataIso: string): string {
  if (!dataIso) return '-';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}

export function formatarTelefone(telefone: string): string {
  if (!telefone) return '';
  const num = telefone.replace(/\D/g, '');
  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
  }
  if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  }
  return telefone;
}

export function gerarLinkWhatsApp(
  telefone: string,
  nomeBarraca: string,
  dataFeira: string,
  valor: number,
  chavePix: string,
  titularPix: string,
  mensagemPersonalizada?: string
): string | null {
  if (!telefone) return null;
  const numLimpo = telefone.replace(/\D/g, '');
  if (!numLimpo) return null;

  const dataFmt = formatarDataBR(dataFeira);
  const valorFmt = formatarMoeda(valor);

  let texto = mensagemPersonalizada || 
    `Olá, equipe da *Barraca {barraca}*! 🌙\n\nPassando para lembrar referente à taxa de ocupação da *Feira da Lua de Arapongas* do dia *{data}*, no valor de *{valor}*.\n\n🔑 *Chave Pix:* {chave_pix}\n👤 *Favorecido:* {titular_pix}\n\nAssim que realizar o pagamento, por favor envie o comprovante por aqui para darmos a baixa no sistema. Muito obrigado e ótimas vendas! ✨`;

  texto = texto
    .replace('{barraca}', nomeBarraca)
    .replace('{data}', dataFmt)
    .replace('{valor}', valorFmt)
    .replace('{chave_pix}', chavePix)
    .replace('{titular_pix}', titularPix);

  // Se não tiver código de país 55, adiciona
  const phoneFinal = numLimpo.startsWith('55') ? numLimpo : `55${numLimpo}`;
  return `https://wa.me/${phoneFinal}?text=${encodeURIComponent(texto)}`;
}

export function valorPorExtenso(valor: number): string {
  if (valor === 55) return 'cinquenta e cinco reais';
  if (valor === 50) return 'cinquenta reais';
  if (valor === 60) return 'sessenta reais';
  if (valor === 100) return 'cem reais';
  if (valor === 110) return 'cento e dez reais';
  return `${valor.toFixed(2).replace('.', ',')} reais`;
}
