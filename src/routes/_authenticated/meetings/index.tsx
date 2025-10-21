import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Calendar, Clock, SquarePen, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMeetings } from "@/hooks/use-meetings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/meetings/")({
  component: MeetingsPage,
});

function MeetingsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { meetings, isLoading, deleteMeeting } = useMeetings();

  const filteredMeetings = meetings?.filter(meeting =>
    meeting.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta reunião?")) {
      await deleteMeeting(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reuniões</h1>
          <p className="text-muted-foreground">
            Gerencie as reuniões da sua equipe
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/meetings/new" })}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Reunião
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar reuniões..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings?.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate" title={meeting.nome}>
                        {meeting.nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(new Date(meeting.data_reuniao), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {meeting.hora_inicio}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate({ to: `/meetings/${meeting.id}/edit` })}
                        >
                          <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(meeting.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}