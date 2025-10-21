import { supabase } from "@/lib/supabase";

export interface LogData {
  id?: string;
  titulo: string;
  conteudo: string;
  data_log: string;
  hora_log: string;
  tags?: string;
  team_id?: string;
  criado_por?: string;
}

export class LogsService {
  static async getAll(teamId: string) {
    const { data, error } = await supabase
      .from("os_logs")
      .select(`
        *,
        os_users!os_logs_criado_por_fkey (
          nome
        )
      `)
      .eq("team_id", teamId)
      .order("data_log", { ascending: false })
      .order("hora_log", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
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
    return data;
  }

  static async create(log: LogData, userId: string, teamId: string) {
    const { data, error } = await supabase
      .from("os_logs")
      .insert({
        ...log,
        team_id: teamId,
        criado_por: userId,
      })
      .select(`
        *,
        os_users!os_logs_criado_por_fkey (
          nome
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, log: Partial<LogData>) {
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
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from("os_logs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async getByDateRange(teamId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("os_logs")
      .select(`
        *,
        os_users!os_logs_criado_por_fkey (
          nome
        )
      `)
      .eq("team_id", teamId)
      .gte("data_log", startDate)
      .lte("data_log", endDate)
      .order("data_log", { ascending: false })
      .order("hora_log", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getByTags(teamId: string, tags: string[]) {
    const { data, error } = await supabase
      .from("os_logs")
      .select(`
        *,
        os_users!os_logs_criado_por_fkey (
          nome
        )
      `)
      .eq("team_id", teamId)
      .or(tags.map(tag => `tags.ilike.%${tag}%`).join(','))
      .order("data_log", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async search(teamId: string, searchTerm: string) {
    const { data, error } = await supabase
      .from("os_logs")
      .select(`
        *,
        os_users!os_logs_criado_por_fkey (
          nome
        )
      `)
      .eq("team_id", teamId)
      .or(`titulo.ilike.%${searchTerm}%,conteudo.ilike.%${searchTerm}%,tags.ilike.%${searchTerm}%`)
      .order("data_log", { ascending: false });

    if (error) throw error;
    return data;
  }
}