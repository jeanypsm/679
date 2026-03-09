import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Historico() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const historyQuery = trpc.queries.history.useQuery({
    limit: 20,
    offset: page * 20,
  });

  const records = historyQuery.data?.records || [];
  const total = historyQuery.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const filteredRecords = records.filter(
    (r) => r.queryValue.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "blocked":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "Sucesso";
      case "error":
        return "Erro";
      case "blocked":
        return "Bloqueado";
      case "expired":
        return "Expirado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Consultas</h1>
        <p className="text-muted-foreground mt-2">
          Visualize todas as suas consultas anteriores
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Histórico</CardTitle>
          <CardDescription>Pesquise por valor consultado</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Pesquise por CPF, CNPJ, RG, placa ou telefone..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
          <CardDescription>
            Mostrando {filteredRecords.length} de {total} consultas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo Usado (min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">
                        {new Date(record.createdAt).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-mono text-sm uppercase">
                        {record.queryType}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.queryValue}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusLabel(record.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {record.minutesUsed}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma consulta encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {page + 1} de {totalPages}
              </p>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tempo Total Usado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {records.reduce((sum: number, r: any) => sum + (r.minutesUsed || 0), 0)} min
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
