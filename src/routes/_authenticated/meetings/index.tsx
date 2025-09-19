import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Video, Calendar, Clock, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
                  <TableHead>Status</TableHead>
                  <TableHead>Vídeo</TableHead>
                  <TableHead>Transcrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings?.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">
                      {meeting.nome}
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
                        {meeting.hora_inicio} - {meeting.hora_fim}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meeting.status === 'finalizada' ? 'secondary' : 'default'}>
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meeting.video_youtube && (
                        <a
                          href={meeting.video_youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          <Video className="h-4 w-4" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      {meeting.transcript && (
                        <Badge variant="outline">Disponível</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate({ to: `/meetings/${meeting.id}/edit` })}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(meeting.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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