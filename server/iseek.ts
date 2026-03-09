import { ENV } from "./_core/env";

export interface ISeekQueryResult {
  success: boolean;
  data?: any;
  error?: string;
  status: number;
}

/**
 * Módulos de DADOS disponíveis na API iseek.pro
 */
export const DADOS_MODULES = {
  // Identificação
  CPF: "cpf",
  CPF_BASICO: "cpfbasico",
  CNPJ: "cnpj",
  RG: "rg",
  
  // Informações Pessoais
  NOME_ABREVIADO: "nomeAbreviadoFiltros",
  PAI: "pai",
  MAE: "mae",
  NASCIMENTO: "nasc",
  TELEFONE: "telefone",
  EMAIL: "email",
  CEP: "cep",
  
  // Documentos e Registros
  NIS: "nis",
  TITULO: "titulo",
  IPTU: "iptu",
  MATRICULA: "matricula",
  REGISTRO: "registro",
  
  // Profissional
  FUNC: "func",
  RAIS: "rais",
  ASSESSORIA: "assessoria",
  
  // Veículos
  PLACA: "placa",
  RENAVAM: "renavam",
  CHASSI: "chassi",
  MOTOR: "motor",
  VEICULOS: "veiculos",
  CRLV_TO: "crlvto",
  CRLV_MT: "crlvmt",
  
  // Carteira Nacional de Habilitação
  CNH_AM: "cnham",
  CNH_RS: "cnhrs",
  CNH_RR: "cnhrr",
  CNH_NC: "cnhnc",
  FOTODETRAN: "fotodetran",
  
  // Financeiro
  CHEQUE: "cheque",
  DIVIDAS: "dividas",
  SCORE: "score",
  SCORE2: "score2",
  PIX: "pix",
  
  // Jurídico
  PROCESSO: "processo",
  MANDADO: "mandado",
  OBITO: "obito",
  
  // Educação e Saúde
  FACULDADES: "faculdades",
  VACINAS: "vacinas",
  
  // Patrimônio
  BENS: "bens",
  IRPF: "irpf",
  
  // Relacionamentos
  PARENTES: "parentes",
  CERTIDOES: "certidoes",
  CAT_CPF: "catCpf",
  CAT_NUMERO: "catNumero",
} as const;

/**
 * Módulos de FOTOS disponíveis na API iseek.pro
 */
export const FOTOS_MODULES = {
  // Fotos Estaduais
  FOTO_MA: "fotoma",
  FOTO_ES: "fotoes",
  FOTO_TO: "fototo",
  FOTO_RJ: "fotorj",
  FOTO_SP: "fotosp",
  FOTO_CE: "fotoce",
  FOTO_MS: "fotoms",
  FOTO_RO: "fotoro",
  FOTO_PI: "fotopi",
  FOTO_DF: "fotodf",
  FOTO_NC: "fotonc",
  FOTO_PR: "fotopr",
  
  // Fotos Especiais
  FOTO_MA_PRESOS: "fotomapresos",
  
  // CNH
  FOTO_CNH: "fotocnh",
  
  // CRLV
  CRLV_TO: "crlvto",
  CRLV_MT: "crlvmt",
} as const;

/**
 * Categorias de módulos para organização
 */
export const MODULE_CATEGORIES = {
  IDENTIFICACAO: {
    label: "Identificação",
    modules: [
      { key: "cpf", label: "CPF", param: "cpf", type: "number" },
      { key: "cpfbasico", label: "CPF Básico", param: "cpfbasico", type: "number" },
      { key: "cnpj", label: "CNPJ", param: "cnpj", type: "number" },
      { key: "rg", label: "RG", param: "rg", type: "text" },
    ],
  },
  PESSOAIS: {
    label: "Informações Pessoais",
    modules: [
      { key: "nomeAbreviadoFiltros", label: "Nome", param: "nomeAbreviadoFiltros", type: "text" },
      { key: "pai", label: "Pai", param: "pai", type: "text" },
      { key: "mae", label: "Mãe", param: "mae", type: "text" },
      { key: "nasc", label: "Data de Nascimento", param: "nasc", type: "date" },
      { key: "telefone", label: "Telefone", param: "telefone", type: "phone" },
      { key: "email", label: "Email", param: "email", type: "email" },
      { key: "cep", label: "CEP", param: "cep", type: "number" },
    ],
  },
  DOCUMENTOS: {
    label: "Documentos e Registros",
    modules: [
      { key: "nis", label: "NIS", param: "nis", type: "number" },
      { key: "titulo", label: "Título de Eleitor", param: "titulo", type: "number" },
      { key: "iptu", label: "IPTU", param: "iptu", type: "text" },
      { key: "matricula", label: "Matrícula", param: "matricula", type: "number" },
      { key: "registro", label: "Registro", param: "registro", type: "text" },
    ],
  },
  PROFISSIONAL: {
    label: "Informações Profissionais",
    modules: [
      { key: "func", label: "Função", param: "func", type: "text" },
      { key: "rais", label: "RAIS", param: "rais", type: "number" },
      { key: "assessoria", label: "Assessoria", param: "assessoria", type: "text" },
    ],
  },
  VEICULOS: {
    label: "Veículos",
    modules: [
      { key: "placa", label: "Placa", param: "placa", type: "text" },
      { key: "renavam", label: "RENAVAM", param: "renavam", type: "number" },
      { key: "chassi", label: "Chassi", param: "chassi", type: "text" },
      { key: "motor", label: "Motor", param: "motor", type: "text" },
      { key: "veiculos", label: "Veículos", param: "veiculos", type: "text" },
      { key: "crlvto", label: "CRLV - TO", param: "crlvto", type: "number" },
      { key: "crlvmt", label: "CRLV - MT", param: "crlvmt", type: "number" },
    ],
  },
  CNH: {
    label: "Carteira Nacional de Habilitação",
    modules: [
      { key: "cnham", label: "CNH - AM", param: "cnham", type: "number" },
      { key: "cnhrs", label: "CNH - RS", param: "cnhrs", type: "number" },
      { key: "cnhrr", label: "CNH - RR", param: "cnhrr", type: "number" },
      { key: "cnhnc", label: "CNH - NC", param: "cnhnc", type: "number" },
      { key: "fotodetran", label: "Foto DETRAN", param: "fotodetran", type: "number" },
    ],
  },
  FINANCEIRO: {
    label: "Informações Financeiras",
    modules: [
      { key: "cheque", label: "Cheque", param: "cheque", type: "number" },
      { key: "dividas", label: "Dívidas", param: "dividas", type: "text" },
      { key: "score", label: "Score", param: "score", type: "number" },
      { key: "score2", label: "Score 2", param: "score2", type: "number" },
      { key: "pix", label: "PIX", param: "pix", type: "text" },
    ],
  },
  JURIDICO: {
    label: "Informações Jurídicas",
    modules: [
      { key: "processo", label: "Processo", param: "processo", type: "number" },
      { key: "mandado", label: "Mandado", param: "mandado", type: "text" },
      { key: "obito", label: "Óbito", param: "obito", type: "number" },
    ],
  },
  EDUCACAO_SAUDE: {
    label: "Educação e Saúde",
    modules: [
      { key: "faculdades", label: "Faculdades", param: "faculdades", type: "text" },
      { key: "vacinas", label: "Vacinas", param: "vacinas", type: "text" },
    ],
  },
  PATRIMONIO: {
    label: "Patrimônio",
    modules: [
      { key: "bens", label: "Bens", param: "bens", type: "text" },
      { key: "irpf", label: "IRPF", param: "irpf", type: "number" },
    ],
  },
  RELACIONAMENTOS: {
    label: "Relacionamentos",
    modules: [
      { key: "parentes", label: "Parentes", param: "parentes", type: "text" },
      { key: "certidoes", label: "Certidões", param: "certidoes", type: "text" },
      { key: "catCpf", label: "CAT - CPF", param: "catCpf", type: "number" },
      { key: "catNumero", label: "CAT - Número", param: "catNumero", type: "number" },
    ],
  },
  FOTOS_ESTADUAIS: {
    label: "Fotos Estaduais",
    modules: [
      { key: "fotoma", label: "Foto - MA", param: "fotoma", type: "text" },
      { key: "fotoes", label: "Foto - ES", param: "fotoes", type: "text" },
      { key: "fototo", label: "Foto - TO", param: "fototo", type: "text" },
      { key: "fotorj", label: "Foto - RJ", param: "fotorj", type: "text" },
      { key: "fotosp", label: "Foto - SP", param: "fotosp", type: "text" },
      { key: "fotoce", label: "Foto - CE", param: "fotoce", type: "text" },
      { key: "fotoms", label: "Foto - MS", param: "fotoms", type: "text" },
      { key: "fotoro", label: "Foto - RO", param: "fotoro", type: "text" },
      { key: "fotopi", label: "Foto - PI", param: "fotopi", type: "text" },
      { key: "fotodf", label: "Foto - DF", param: "fotodf", type: "text" },
      { key: "fotonc", label: "Foto - NC", param: "fotonc", type: "text" },
      { key: "fotopr", label: "Foto - PR", param: "fotopr", type: "text" },
      { key: "fotomapresos", label: "Foto - MA (Presos)", param: "fotomapresos", type: "text" },
    ],
  },
  FOTOS_CNH_CRLV: {
    label: "CNH e CRLV (Fotos)",
    modules: [
      { key: "fotocnh", label: "Foto CNH", param: "fotocnh", type: "number" },
      { key: "crlvto", label: "CRLV - TO", param: "crlvto", type: "number" },
      { key: "crlvmt", label: "CRLV - MT", param: "crlvmt", type: "number" },
    ],
  },
};

/**
 * Fazer query na API iseek.pro
 */
export async function queryISeek(
  endpoint: "dados" | "fotos",
  param: string,
  value: string
): Promise<ISeekQueryResult> {
  if (!ENV.iseekApiKey) {
    return {
      success: false,
      error: "API key not configured",
      status: 500,
    };
  }

  try {
    if (!value || value.trim().length === 0) {
      return {
        success: false,
        error: "Invalid query value",
        status: 400,
      };
    }

    // Construir URL com parâmetro dinâmico
    const url = new URL(`https://iseek.pro/api/${endpoint}`);
    url.searchParams.append("token", ENV.iseekApiKey);
    url.searchParams.append(param, value);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();

    // Verificar se há erro na resposta
    if (data.error) {
      return {
        success: false,
        error: data.error,
        status: 400,
      };
    }

    return {
      success: true,
      data,
      status: 200,
    };
  } catch (error) {
    console.error(`[iseek.pro] Query error for ${endpoint}/${param}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}

/**
 * Obter todos os módulos disponíveis
 */
export function getAllModules() {
  return MODULE_CATEGORIES;
}

/**
 * Obter módulo específico por chave
 */
export function getModuleByKey(key: string) {
  for (const category of Object.values(MODULE_CATEGORIES)) {
    const module = category.modules.find(m => m.key === key);
    if (module) return module;
  }
  return null;
}

/**
 * Determinar endpoint (dados ou fotos) baseado no parâmetro
 */
export function getEndpointForParam(param: string): "dados" | "fotos" {
  const fotoParams = Object.values(FOTOS_MODULES);
  return fotoParams.includes(param as any) ? "fotos" : "dados";
}
