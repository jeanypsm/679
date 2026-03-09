import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Trash2, Lock, Unlock, Plus, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const statsQuery = trpc.admin.stats.useQuery();
  const usersQuery = trpc.admin.users.list.useQuery();
  const logsQuery = trpc.admin.logs.useQuery({ limit: 50, offset: 0 });

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserMinutes, setNewUserMinutes] = useState("0");

  const createUserMutation = trpc.admin.users.create.useMutation();
  const addTimeMutation = trpc.admin.users.addTime.useMutation();
  const blockUserMutation = trpc.admin.users.block.useMutation();

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Acesso negado. Apenas administradores podem acessar esta página.</p>
        <Button onClick={() => setLocation("/dashboard")} className="mt-4">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserMutation.mutateAsync({
        email: newUserEmail,
        password: newUserPassword,
        name: newUserName,
        accessMinutes: parseInt(newUserMinutes) || 0,
      });
      toast.success("Usuário criado com sucesso!");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserMinutes("0");
      usersQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário");
    }
  };

  const handleAddTime = async (userId: number, minutes: number) => {
    try {
      await addTimeMutation.mutateAsync({
        userId,
        minutes,
        reason: "Admin adjustment",
      });
      toast.success(`${minutes} minutos adicionados!`);
      usersQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar tempo");
    }
  };

  const handleBlockUser = async (userId: number, blocked: boolean) => {
    try {
      await blockUserMutation.mutateAsync({
        userId,
        blocked: !blocked,
      });
      toast.success(blocked ? "Usuário desbloqueado!" : "Usuário bloqueado!");
      usersQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao bloquear/desbloquear usuário");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-2">Gerenciar usuários, tempo de acesso e logs do sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsQuery.data?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsQuery.data?.activeUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários Bloqueados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statsQuery.data?.blockedUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statsQuery.data?.totalQueries || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="create">Criar Usuário</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>Visualize e controle todos os usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tempo (min)</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersQuery.data?.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono text-sm">{u.email}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.accessMinutes}</TableCell>
                        <TableCell>
                          {u.expiresAt ? new Date(u.expiresAt).toLocaleDateString("pt-BR") : "—"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            u.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}>
                            {u.isBlocked ? "Bloqueado" : "Ativo"}
                          </span>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddTime(u.id, 60)}
                            disabled={addTimeMutation.isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBlockUser(u.id, u.isBlocked)}
                            disabled={blockUserMutation.isPending}
                          >
                            {u.isBlocked ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create User Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Usuário</CardTitle>
              <CardDescription>Adicione um novo usuário ao sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minutes">Minutos de Acesso</Label>
                  <Input
                    id="minutes"
                    type="number"
                    placeholder="1440"
                    value={newUserMinutes}
                    onChange={(e) => setNewUserMinutes(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Atividade</CardTitle>
              <CardDescription>Histórico de ações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logsQuery.data?.map((log: any) => (
                  <div key={log.id} className="border rounded p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      {log.ipAddress && (
                        <p className="text-xs text-muted-foreground font-mono">{log.ipAddress}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
