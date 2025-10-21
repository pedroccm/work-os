import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MeetingForm } from "@/components/meetings/meeting-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/meetings/new")({
  component: NewMeetingPage,
});

function NewMeetingPage() {
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold tracking-tight">Nova Reunião</h1>
          <p className="text-muted-foreground">
            Agende uma nova reunião para sua equipe
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Reunião</CardTitle>
        </CardHeader>
        <CardContent>
          <MeetingForm />
        </CardContent>
      </Card>
    </div>
  );
}