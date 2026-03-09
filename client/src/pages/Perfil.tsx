import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { LogOut, User, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Perfil() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem("token");
      toast.success("Logout realizado com sucesso!");
      setLocation("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout");
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  const remainingMinutes = (user.accessMinutes || 0) - (user.usedMinutes || 0);
  const percentageUsed = ((user.usedMinutes || 0) / (user.accessMinutes || 1)) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Informações da sua conta e status de acesso
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="text-lg font-medium">{user.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-medium">{user.email || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Função</p>
              <p className="text-lg font-medium capitalize">
                {user.role === "admin" ? "Administrador" : "Usuário"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`text-lg font-medium ${user.isBlocked ? "text-red-600" : "text-green-600"}`}>
                {user.isBlocked ? "Bloqueado" : "Ativo"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Tempo Disponível</p>
              <p className="text-lg font-bold">{remainingMinutes} min</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  remainingMinutes <= 0
                    ? "bg-red-500"
                    : remainingMinutes <= 480
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, 100 - percentageUsed)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {percentageUsed.toFixed(1)}% utilizado de {user.accessMinutes} minutos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Total</p>
              <p className="text-2xl font-bold">{user.accessMinutes} min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Usado</p>
              <p className="text-2xl font-bold">{user.usedMinutes} min</p>
            </div>
          </div>

          {user.expiresAt && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <p className="text-sm font-medium">Data de Vencimento</p>
              </div>
              <p className="text-lg">
                {new Date(user.expiresAt).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {new Date(user.expiresAt) < new Date() && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Seu acesso expirou
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Consultas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total de Consultas</p>
            <p className="text-3xl font-bold">{user.queryCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Limite de Consultas</p>
            <p className="text-3xl font-bold">
              {user.maxQueries === 0 ? "Ilimitado" : user.maxQueries}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Sair da Conta</CardTitle>
          <CardDescription className="text-red-800">
            Você será desconectado de todas as sessões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Saindo..." : "Sair"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
