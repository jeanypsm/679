import { queryISeek } from "./iseek";

export interface CPFCompletoResult {
  success: boolean;
  cpf: string;
  data: {
    basico?: any;
    parentes?: any;
    dividas?: any;
    bens?: any;
    irpf?: any;
    score?: any;
    score2?: any;
    processo?: any;
    mandado?: any;
    obito?: any;
    vacinas?: any;
    faculdades?: any;
    cheque?: any;
    pix?: any;
    certidoes?: any;
    rais?: any;
    beneficios?: any;
    cnh_am?: any;
    cnh_rs?: any;
    cnh_rr?: any;
    cnh_nc?: any;
  };
  errors: Array<{ module: string; error: string }>;
  timestamp: Date;
}

/**
 * Consultar TODOS os dados disponíveis para um CPF
 * Executa múltiplas queries em paralelo
 */
export async function consultarCPFCompleto(cpf: string): Promise<CPFCompletoResult> {
  const result: CPFCompletoResult = {
    success: false,
    cpf,
    data: {},
    errors: [],
    timestamp: new Date(),
  };

  // Normalizar CPF (remover caracteres especiais)
  const cpfNormalizado = cpf.replace(/[^\d]/g, "");

  if (!cpfNormalizado || cpfNormalizado.length !== 11) {
    result.errors.push({ module: "validacao", error: "CPF inválido" });
    return result;
  }

  // Lista de módulos para consultar
  const modulos = [
    { key: "basico", param: "cpfbasico" },
    { key: "parentes", param: "parentes" },
    { key: "dividas", param: "dividas" },
    { key: "bens", param: "bens" },
    { key: "irpf", param: "irpf" },
    { key: "score", param: "score" },
    { key: "score2", param: "score2" },
    { key: "processo", param: "processo" },
    { key: "mandado", param: "mandado" },
    { key: "obito", param: "obito" },
    { key: "vacinas", param: "vacinas" },
    { key: "faculdades", param: "faculdades" },
    { key: "cheque", param: "cheque" },
    { key: "pix", param: "pix" },
    { key: "certidoes", param: "certidoes" },
    { key: "rais", param: "rais" },
    { key: "beneficios", param: "beneficios" },
    { key: "cnh_am", param: "cnham" },
    { key: "cnh_rs", param: "cnhrs" },
    { key: "cnh_rr", param: "cnhrr" },
    { key: "cnh_nc", param: "cnhnc" },
  ];

  // Executar todas as queries em paralelo
  const promises = modulos.map(async (modulo) => {
    try {
      const apiResult = await queryISeek("dados", modulo.param, cpfNormalizado);
      
      if (apiResult.success) {
        result.data[modulo.key as keyof typeof result.data] = apiResult.data;
      } else {
        result.errors.push({
          module: modulo.key,
          error: apiResult.error || "Erro desconhecido",
        });
      }
    } catch (error) {
      result.errors.push({
        module: modulo.key,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  });

  // Aguardar todas as queries
  await Promise.all(promises);

  // Considerar sucesso se pelo menos um módulo retornou dados
  result.success = Object.keys(result.data).length > 0;

  return result;
}

/**
 * Consultar TODOS os dados de fotos para um CPF
 */
export async function consultarFotosCPF(cpf: string): Promise<CPFCompletoResult> {
  const result: CPFCompletoResult = {
    success: false,
    cpf,
    data: {},
    errors: [],
    timestamp: new Date(),
  };

  const cpfNormalizado = cpf.replace(/[^\d]/g, "");

  if (!cpfNormalizado || cpfNormalizado.length !== 11) {
    result.errors.push({ module: "validacao", error: "CPF inválido" });
    return result;
  }

  // Lista de fotos para consultar
  const fotos = [
    { key: "fotocnh", param: "fotocnh" },
    { key: "fotoma", param: "fotoma" },
    { key: "fotoes", param: "fotoes" },
    { key: "fototo", param: "fototo" },
    { key: "fotorj", param: "fotorj" },
    { key: "fotosp", param: "fotosp" },
    { key: "fotoce", param: "fotoce" },
    { key: "fotoms", param: "fotoms" },
    { key: "fotoro", param: "fotoro" },
    { key: "fotopi", param: "fotopi" },
    { key: "fotodf", param: "fotodf" },
    { key: "fotonc", param: "fotonc" },
    { key: "fotopr", param: "fotopr" },
    { key: "fotomapresos", param: "fotomapresos" },
    { key: "crlvto", param: "crlvto" },
    { key: "crlvmt", param: "crlvmt" },
  ];

  // Executar todas as queries em paralelo
  const promises = fotos.map(async (foto) => {
    try {
      const apiResult = await queryISeek("fotos", foto.param, cpfNormalizado);
      
      if (apiResult.success) {
        result.data[foto.key as keyof typeof result.data] = apiResult.data;
      } else {
        result.errors.push({
          module: foto.key,
          error: apiResult.error || "Erro desconhecido",
        });
      }
    } catch (error) {
      result.errors.push({
        module: foto.key,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  });

  // Aguardar todas as queries
  await Promise.all(promises);

  // Considerar sucesso se pelo menos um módulo retornou dados
  result.success = Object.keys(result.data).length > 0;

  return result;
}
