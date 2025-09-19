import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useMeetings } from "@/hooks/use-meetings";

const meetingSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  data_reuniao: z.date({
    required_error: "Data é obrigatória",
  }),
  hora_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (HH:MM)"),
  hora_fim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (HH:MM)"),
  video_youtube: z.string().url("URL inválida").optional().or(z.literal("")),
  video_youtube_id: z.string().optional(),
  transcript: z.string().optional(),
  status: z.enum(["planejada", "em_andamento", "finalizada", "cancelada"]),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  meeting?: any;
}

export function MeetingForm({ meeting }: MeetingFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createMeeting, updateMeeting } = useMeetings();

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      nome: meeting?.nome || "",
      descricao: meeting?.descricao || "",
      data_reuniao: meeting?.data_reuniao ? new Date(meeting.data_reuniao) : undefined,
      hora_inicio: meeting?.hora_inicio || "",
      hora_fim: meeting?.hora_fim || "",
      video_youtube: meeting?.video_youtube || "",
      video_youtube_id: meeting?.video_youtube_id || "",
      transcript: meeting?.transcript || "",
      status: meeting?.status || "planejada",
    },
  });

  const extractYoutubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        video_youtube_id: data.video_youtube ? extractYoutubeId(data.video_youtube) : "",
        data_reuniao: format(data.data_reuniao, "yyyy-MM-dd"),
      };

      if (meeting) {
        await updateMeeting(meeting.id, submitData);
      } else {
        await createMeeting(submitData);
      }

      navigate({ to: "/meetings" });
    } catch (error) {
      console.error("Erro ao salvar reunião:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Reunião</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Reunião de Planejamento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planejada">Planejada</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os objetivos e tópicos da reunião"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="data_reuniao"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Reunião</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hora_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hora_fim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="video_youtube"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do YouTube</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Link do vídeo da reunião no YouTube (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transcript"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transcrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Transcrição da reunião (opcional)"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/meetings" })}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {meeting ? "Atualizar" : "Criar"} Reunião
          </Button>
        </div>
      </form>
    </Form>
  );
}