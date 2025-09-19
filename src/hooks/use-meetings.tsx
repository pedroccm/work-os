import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useActiveTeam } from "@/context/team-context";
import { toast } from "sonner";

export interface Meeting {
  id: string;
  nome: string;
  descricao?: string;
  data_reuniao: string;
  hora_inicio: string;
  hora_fim: string;
  video_youtube?: string;
  video_youtube_id?: string;
  transcript?: string;
  status: "planejada" | "em_andamento" | "finalizada" | "cancelada";
  team_id: string;
  criado_por: string;
  created_at: string;
  updated_at: string;
}

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { activeTeamId } = useActiveTeam();

  useEffect(() => {
    if (user && activeTeamId) {
      fetchMeetings();
    }
  }, [user, activeTeamId]);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);

      if (!activeTeamId) {
        setMeetings([]);
        return;
      }

      const { data, error } = await supabase
        .from("os_reunioes")
        .select("*")
        .eq("team_id", activeTeamId)
        .order("data_reuniao", { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error("Erro ao buscar reuniões:", error);
      toast.error("Erro ao carregar reuniões");
    } finally {
      setIsLoading(false);
    }
  };

  const createMeeting = async (meeting: Omit<Meeting, "id" | "created_at" | "updated_at" | "criado_por" | "team_id">) => {
    try {
      if (!activeTeamId) {
        throw new Error("Nenhum team selecionado");
      }

      const { data, error } = await supabase
        .from("os_reunioes")
        .insert({
          ...meeting,
          team_id: activeTeamId,
          criado_por: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setMeetings([data, ...meetings]);
      toast.success("Reunião criada com sucesso");

      return data;
    } catch (error) {
      console.error("Erro ao criar reunião:", error);
      toast.error("Erro ao criar reunião");
      throw error;
    }
  };

  const updateMeeting = async (id: string, meeting: Partial<Meeting>) => {
    try {
      const { data, error } = await supabase
        .from("os_reunioes")
        .update(meeting)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setMeetings(meetings.map(m => m.id === id ? data : m));
      toast.success("Reunião atualizada com sucesso");

      return data;
    } catch (error) {
      console.error("Erro ao atualizar reunião:", error);
      toast.error("Erro ao atualizar reunião");
      throw error;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase
        .from("os_reunioes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMeetings(meetings.filter(m => m.id !== id));
      toast.success("Reunião excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir reunião:", error);
      toast.error("Erro ao excluir reunião");
      throw error;
    }
  };

  return {
    meetings,
    isLoading,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
}

export function useMeeting(id: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMeeting();
    }
  }, [id]);

  const fetchMeeting = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("os_reunioes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setMeeting(data);
    } catch (error) {
      console.error("Erro ao buscar reunião:", error);
      toast.error("Erro ao carregar reunião");
    } finally {
      setIsLoading(false);
    }
  };

  return { meeting, isLoading, fetchMeeting };
}