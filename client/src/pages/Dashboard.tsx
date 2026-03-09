import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Clock, Search, Image, History, User, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [timeStatus, setTimeStatus] = useState<"green" | "yellow" | "red" | "expired">("green");

  const meQuery = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (meQuery.data) {
      const remaining = (meQuery.data.accessMinutes || 0) - (meQuery.data.usedMinutes || 0);
      setRemainingMinutes(remaining);

      if (meQuery.data.isBlocked) {
        setTimeStatus("expired");
      } else if (remaining <= 0) {
        setTimeStatus("red");
      } else if (remaining <= 480) { // 8 hours
        setTimeStatus("red");
      } else if (remaining <= 2880) { // 2 days
        setTimeStatus("yellow");
      } else {
        setTimeStatus("green");
      }
    }
  }, [meQuery.data]);

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const statusColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    expired: "bg-gray-500",
  };

  const statusLabels = {
    green: "Ativo",
    yellow: "Atenção",
    red: "Crítico",
    expired: "Expirado",
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === "admin" ? "Painel Administrativo" : "Painel do Usuário"}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${statusColors[timeStatus]} text-white rounded-lg p-4`}>
                {formatMinutes(remainingMinutes)}
              </div>
              <p className={`text-sm font-medium ${statusColors[timeStatus]} text-white rounded px-2 py-1 inline-block`}>
                {statusLabels[timeStatus]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Queries Made */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Consultas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{meQuery.data?.queryCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Limite: {meQuery.data?.maxQueries || "Ilimitado"}
            </p>
          </CardContent>
        </Card>

        {/* Expiration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {meQuery.data?.expiresAt ? (
                <>
                  <div className="font-bold">
                    {new Date(meQuery.data.expiresAt).toLocaleDateString("pt-BR")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(meQuery.data.expiresAt) > new Date() ? "Ativo" : "Expirado"}
                  </p>
                </>
              ) : (
                <div className="text-muted-foreground">Sem data de vencimento</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Consultar Dados
            </CardTitle>
            <CardDescription>
              CPF, CNPJ, RG, Placa, Telefone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/consultar-dados")}
              className="w-full"
            >
              Ir para Consultas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Consultar Fotos
            </CardTitle>
            <CardDescription>
              CNH, CRLV, Registros Estaduais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/consultar-fotos")}
              className="w-full"
            >
              Ir para Fotos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico
            </CardTitle>
            <CardDescription>
              Suas consultas anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/historico")}
              variant="outline"
              className="w-full"
            >
              Ver Histórico
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>
              Suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/perfil")}
              variant="outline"
              className="w-full"
            >
              Ver Perfil
            </Button>
          </CardContent>
        </Card>

        {user?.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Administração
              </CardTitle>
              <CardDescription>
                Gerenciar usuários e sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation("/admin")}
                variant="outline"
                className="w-full"
              >
                Painel Admin
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
