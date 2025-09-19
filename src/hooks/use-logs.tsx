import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useActiveTeam } from "@/context/team-context";
import { toast } from "sonner";

export interface Log {
  id: string;
  titulo: string;
  conteudo: string;
  data_log: string;
  hora_log: string;
  tags?: string;
  team_id: string;
  criado_por: string;
  autor_nome?: string;
  created_at: string;
  updated_at: string;
}

export function useLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { activeTeamId } = useActiveTeam();

  useEffect(() => {
    if (user && activeTeamId) {
      fetchLogs();
    }
  }, [user, activeTeamId]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);

      if (!activeTeamId) {
        setLogs([]);
        return;
      }

      const { data, error } = await supabase
        .from("os_logs")
        .select(`
          *,
          os_users!os_logs_criado_por_fkey (
            nome
          )
        `)
        .eq("team_id", activeTeamId)
        .order("data_log", { ascending: false })
        .order("hora_log", { ascending: false });

      if (error) throw error;

      // Mapear os dados para incluir o nome do autor
      const logsWithAuthor = data?.map(log => ({
        ...log,
        autor_nome: log.os_users?.nome
      })) || [];

      setLogs(logsWithAuthor);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      toast.error("Erro ao carregar logs");
    } finally {
      setIsLoading(false);
    }
  };

  const createLog = async (log: Omit<Log, "id" | "created_at" | "updated_at" | "criado_por" | "team_id" | "autor_nome">) => {
    try {
      if (!activeTeamId) {
        throw new Error("Nenhum team selecionado");
      }

      const { data, error } = await supabase
        .from("os_logs")
        .insert({
          ...log,
          team_id: activeTeamId,
          criado_por: user?.id,
        })
        .select(`
          *,
          os_users!os_logs_criado_por_fkey (
            nome
          )
        `)
        .single();

      if (error) throw error;

      const logWithAuthor = {
        ...data,
        autor_nome: data.os_users?.nome
      };

      setLogs([logWithAuthor, ...logs]);
      toast.success("Log criado com sucesso");

      return logWithAuthor;
    } catch (error) {
      console.error("Erro ao criar log:", error);
      toast.error("Erro ao criar log");
      throw error;
    }
  };

  const updateLog = async (id: string, log: Partial<Log>) => {
    try {
      const { data, error } = await supabase
        .from("os_logs")
        .update(log)
        .eq("id", id)
        .select(`
          *,
          os_users!os_logs_criado_por_fkey (
            nome
          )
        `)
        .single();

      if (error) throw error;

      const logWithAuthor = {
        ...data,
        autor_nome: data.os_users?.nome
      };

      setLogs(logs.map(l => l.id === id ? logWithAuthor : l));
      toast.success("Log atualizado com sucesso");

      return logWithAuthor;
    } catch (error) {
      console.error("Erro ao atualizar log:", error);
      toast.error("Erro ao atualizar log");
      throw error;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from("os_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setLogs(logs.filter(l => l.id !== id));
      toast.success("Log excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir log:", error);
      toast.error("Erro ao excluir log");
      throw error;
    }
  };

  return {
    logs,
    isLoading,
    fetchLogs,
    createLog,
    updateLog,
    deleteLog,
  };
}

export function useLog(id: string) {
  const [log, setLog] = useState<Log | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLog();
    }
  }, [id]);

  const fetchLog = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("os_logs")
        .select(`
          *,
          os_users!os_logs_criado_por_fkey (
            nome
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const logWithAuthor = {
        ...data,
        autor_nome: data.os_users?.nome
      };

      setLog(logWithAuthor);
    } catch (error) {
      console.error("Erro ao buscar log:", error);
      toast.error("Erro ao carregar log");
    } finally {
      setIsLoading(false);
    }
  };

  return { log, isLoading, fetchLog };
}