import { supabase } from "@/lib/supabase";

export interface MeetingData {
  id?: string;
  nome: string;
  descricao?: string;
  data_reuniao: string;
  hora_inicio: string;
  hora_fim: string;
  video_youtube?: string;
  video_youtube_id?: string;
  transcript?: string;
  status: "planejada" | "em_andamento" | "finalizada" | "cancelada";
  team_id?: string;
  criado_por?: string;
}

export class MeetingsService {
  static async getAll(teamId: string) {
    const { data, error } = await supabase
      .from("os_reunioes")
      .select("*")
      .eq("team_id", teamId)
      .order("data_reuniao", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from("os_reunioes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(meeting: MeetingData, userId: string, teamId: string) {
    const { data, error } = await supabase
      .from("os_reunioes")
      .insert({
        ...meeting,
        team_id: teamId,
        criado_por: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, meeting: Partial<MeetingData>) {
    const { data, error } = await supabase
      .from("os_reunioes")
      .update(meeting)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from("os_reunioes")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async getUpcoming(teamId: string, limit = 5) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("os_reunioes")
      .select("*")
      .eq("team_id", teamId)
      .gte("data_reuniao", today)
      .eq("status", "planejada")
      .order("data_reuniao", { ascending: true })
      .order("hora_inicio", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getPast(teamId: string, limit = 10) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("os_reunioes")
      .select("*")
      .eq("team_id", teamId)
      .lt("data_reuniao", today)
      .order("data_reuniao", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async updateStatus(id: string, status: MeetingData["status"]) {
    const { data, error } = await supabase
      .from("os_reunioes")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async addTranscription(id: string, transcript: string) {
    const { data, error } = await supabase
      .from("os_reunioes")
      .update({ transcript })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async addYoutubeVideo(id: string, videoUrl: string) {
    const videoId = this.extractYoutubeId(videoUrl);

    const { data, error } = await supabase
      .from("os_reunioes")
      .update({
        video_youtube: videoUrl,
        video_youtube_id: videoId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private static extractYoutubeId(url: string): string {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  }
}