import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Copy, Check, Zap } from "lucide-react";
import { useState } from "react";

// Categorias de módulos
const MODULE_CATEGORIES = {
  IDENTIFICACAO: {
    label: "Identificação",
    modules: [
      { value: "cpf", label: "CPF" },
      { value: "cpfbasico", label: "CPF Básico" },
      { value: "cnpj", label: "CNPJ" },
      { value: "rg", label: "RG" },
    ],
  },
  PESSOAIS: {
    label: "Informações Pessoais",
    modules: [
      { value: "nomeAbreviadoFiltros", label: "Nome" },
      { value: "pai", label: "Pai" },
      { value: "mae", label: "Mãe" },
      { value: "nasc", label: "Data de Nascimento" },
      { value: "telefone", label: "Telefone" },
      { value: "email", label: "Email" },
      { value: "cep", label: "CEP" },
    ],
  },
  DOCUMENTOS: {
    label: "Documentos e Registros",
    modules: [
      { value: "nis", label: "NIS" },
      { value: "titulo", label: "Título de Eleitor" },
      { value: "iptu", label: "IPTU" },
      { value: "matricula", label: "Matrícula" },
      { value: "registro", label: "Registro" },
    ],
  },
  PROFISSIONAL: {
    label: "Informações Profissionais",
    modules: [
      { value: "func", label: "Função" },
      { value: "rais", label: "RAIS" },
      { value: "assessoria", label: "Assessoria" },
    ],
  },
  VEICULOS: {
    label: "Veículos",
    modules: [
      { value: "placa", label: "Placa" },
      { value: "renavam", label: "RENAVAM" },
      { value: "chassi", label: "Chassi" },
      { value: "motor", label: "Motor" },
      { value: "veiculos", label: "Veículos" },
      { value: "crlvto", label: "CRLV - TO" },
      { value: "crlvmt", label: "CRLV - MT" },
    ],
  },
  CNH: {
    label: "Carteira Nacional de Habilitação",
    modules: [
      { value: "cnham", label: "CNH - AM" },
      { value: "cnhrs", label: "CNH - RS" },
      { value: "cnhrr", label: "CNH - RR" },
      { value: "cnhnc", label: "CNH - NC" },
      { value: "fotodetran", label: "Foto DETRAN" },
    ],
  },
  FINANCEIRO: {
    label: "Informações Financeiras",
    modules: [
      { value: "cheque", label: "Cheque" },
      { value: "dividas", label: "Dívidas" },
      { value: "score", label: "Score" },
      { value: "score2", label: "Score 2" },
      { value: "pix", label: "PIX" },
    ],
  },
  JURIDICO: {
    label: "Informações Jurídicas",
    modules: [
      { value: "processo", label: "Processo" },
      { value: "mandado", label: "Mandado" },
      { value: "obito", label: "Óbito" },
    ],
  },
  EDUCACAO_SAUDE: {
    label: "Educação e Saúde",
    modules: [
      { value: "faculdades", label: "Faculdades" },
      { value: "vacinas", label: "Vacinas" },
    ],
  },
  PATRIMONIO: {
    label: "Patrimônio",
    modules: [
      { value: "bens", label: "Bens" },
      { value: "irpf", label: "IRPF" },
    ],
  },
  RELACIONAMENTOS: {
    label: "Relacionamentos",
    modules: [
      { value: "parentes", label: "Parentes" },
      { value: "certidoes", label: "Certidões" },
      { value: "catCpf", label: "CAT - CPF" },
      { value: "catNumero", label: "CAT - Número" },
    ],
  },
  FOTOS_ESTADUAIS: {
    label: "Fotos Estaduais",
    modules: [
      { value: "fotoma", label: "Foto - MA" },
      { value: "fotoes", label: "Foto - ES" },
      { value: "fototo", label: "Foto - TO" },
      { value: "fotorj", label: "Foto - RJ" },
      { value: "fotosp", label: "Foto - SP" },
      { value: "fotoce", label: "Foto - CE" },
      { value: "fotoms", label: "Foto - MS" },
      { value: "fotoro", label: "Foto - RO" },
      { value: "fotopi", label: "Foto - PI" },
      { value: "fotodf", label: "Foto - DF" },
      { value: "fotonc", label: "Foto - NC" },
      { value: "fotopr", label: "Foto - PR" },
      { value: "fotomapresos", label: "Foto - MA (Presos)" },
    ],
  },
  FOTOS_CNH_CRLV: {
    label: "CNH e CRLV (Fotos)",
    modules: [
      { value: "fotocnh", label: "Foto CNH" },
      { value: "crlvto", label: "CRLV - TO" },
      { value: "crlvmt", label: "CRLV - MT" },
    ],
  },
};

export default function ConsultarDados() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"individual" | "cpf_completo" | "fotos_completo">("individual");
  const [queryType, setQueryType] = useState("cpf");
  const [queryValue, setQueryValue] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchMutation = trpc.queries.search.useMutation();
  const cpfCompletoMutation = trpc.queries.cpfCompleto.useMutation();
  const fotosCompletoMutation = trpc.queries.fotosCompleto.useMutation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryValue.trim()) {
      toast.error("Digite um valor para consultar");
      return;
    }

    setLoading(true);
    try {
      let res;
      
      if (mode === "cpf_completo") {
        res = await cpfCompletoMutation.mutateAsync({ cpf: queryValue });
        toast.success(`Consulta completa realizada! ${Object.keys(res.data).length} módulos com dados`);
      } else if (mode === "fotos_completo") {
        res = await fotosCompletoMutation.mutateAsync({ cpf: queryValue });
        toast.success(`Fotos consultadas! ${Object.keys(res.data).length} estados com dados`);
      } else {
        res = await searchMutation.mutateAsync({
          type: queryType,
          value: queryValue,
        });
        toast.success("Consulta realizada com sucesso!");
      }
      
      setResult(res);
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar consulta");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consultar Dados</h1>
        <p className="text-muted-foreground mt-2">
          Pesquise informações com mais de 40 módulos de dados e 16+ fotos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Formulário de Busca</CardTitle>
            <CardDescription>Selecione o tipo de consulta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Mode Selection */}
              <div className="space-y-2">
                <Label>Modo de Consulta</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="individual"
                      checked={mode === "individual"}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Consulta Individual</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="cpf_completo"
                      checked={mode === "cpf_completo"}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      CPF Completo (Todos os dados)
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="fotos_completo"
                      checked={mode === "fotos_completo"}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Fotos Completo (Todos os estados)
                    </span>
                  </label>
                </div>
              </div>

              {/* Type Selection - Only for individual mode */}
              {mode === "individual" && (
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Consulta</Label>
                  <Select value={queryType} onValueChange={setQueryType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODULE_CATEGORIES).map(([key, category]) => (
                        <div key={key}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {category.label}
                          </div>
                          {category.modules.map((module) => (
                            <SelectItem key={module.value} value={module.value}>
                              {module.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Value Input */}
              <div className="space-y-2">
                <Label htmlFor="value">
                  {mode === "individual" ? "Valor" : "CPF"}
                </Label>
                <Input
                  id="value"
                  placeholder={
                    mode === "individual"
                      ? "Digite o valor para consultar..."
                      : "Digite o CPF (com ou sem formatação)..."
                  }
                  value={queryValue}
                  onChange={(e) => setQueryValue(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  "Consultar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resultado da Consulta</CardTitle>
                <CardDescription>
                  {result ? "Dados retornados pela API" : "Nenhuma consulta realizada ainda"}
                </CardDescription>
              </div>
              {result && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* CPF Completo Results */}
                {(mode === "cpf_completo" || mode === "fotos_completo") && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        ✓ Consulta realizada com sucesso!
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        {Object.keys(result.data).length} módulos com dados retornados
                      </p>
                      {result.errors.length > 0 && (
                        <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                          {result.errors.length} módulos sem dados
                        </p>
                      )}
                    </div>

                    {/* Data Modules */}
                    {Object.keys(result.data).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Módulos com Dados:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(result.data).map((key) => (
                            <div
                              key={key}
                              className="bg-green-50 dark:bg-green-950 p-2 rounded text-xs border border-green-200 dark:border-green-800"
                            >
                              <p className="font-semibold text-green-900 dark:text-green-100">
                                ✓ {key}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Individual Query Results */}
                {mode === "individual" && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 max-h-96 overflow-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Full JSON */}
                <details className="text-xs">
                  <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                    Ver JSON Completo
                  </summary>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 mt-2 max-h-96 overflow-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma consulta realizada ainda.</p>
                <p className="text-sm mt-2">Preencha o formulário e clique em "Consultar" para começar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
