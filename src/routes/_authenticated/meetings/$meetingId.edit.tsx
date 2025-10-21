import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MeetingForm } from "@/components/meetings/meeting-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMeeting } from "@/hooks/use-meetings";

export const Route = createFileRoute("/_authenticated/meetings/$meetingId/edit")({
  component: EditMeetingPage,
});

function EditMeetingPage() {
  const navigate = useNavigate();
  const { meetingId } = Route.useParams();
  const { meeting, isLoading } = useMeeting(meetingId);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-6">
        <p>Reunião não encontrada</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/meetings" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Reunião</h1>
          <p className="text-muted-foreground">
            Atualize as informações da reunião
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Reunião</CardTitle>
        </CardHeader>
        <CardContent>
          <MeetingForm meeting={meeting} />
        </CardContent>
      </Card>
    </div>
  );
}