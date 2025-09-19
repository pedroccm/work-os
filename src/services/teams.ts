import { supabase } from '@/lib/supabase'

export interface Team {
  id: string
  nome: string
  descricao?: string
  cor?: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: string
  joined_at: string
}

export const teamsService = {
  async getTeams() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('os_teams')
      .select(`
        *,
        os_team_members!inner(
          user_id,
          role
        )
      `)
      .eq('os_team_members.user_id', user.id)

    if (error) throw error
    return data
  },

  async getTeamById(teamId: string) {
    const { data, error } = await supabase
      .from('os_teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (error) throw error
    return data
  },

  async createTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: newTeam, error: teamError } = await supabase
      .from('os_teams')
      .insert({
        ...team,
        owner_id: user.id
      })
      .select()
      .single()

    if (teamError) throw teamError

    // Use upsert to avoid duplicate key constraint error
    const { error: memberError } = await supabase
      .from('os_team_members')
      .upsert({
        team_id: newTeam.id,
        user_id: user.id,
        role: 'owner'
      }, {
        onConflict: 'team_id,user_id'
      })

    if (memberError) {
      // If member insertion fails, cleanup the team
      await supabase.from('os_teams').delete().eq('id', newTeam.id)
      throw memberError
    }

    return newTeam
  },

  async updateTeam(teamId: string, updates: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at' | 'owner_id'>>) {
    const { data, error } = await supabase
      .from('os_teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTeam(teamId: string) {
    const { error: membersError } = await supabase
      .from('os_team_members')
      .delete()
      .eq('team_id', teamId)

    if (membersError) throw membersError

    const { error } = await supabase
      .from('os_teams')
      .delete()
      .eq('id', teamId)

    if (error) throw error
  },

  async getTeamMembers(teamId: string) {
    const { data, error } = await supabase
      .from('os_team_members')
      .select(`
        *,
        os_users(
          id,
          email,
          nome
        )
      `)
      .eq('team_id', teamId)

    if (error) throw error
    return data
  },

  async addTeamMember(teamId: string, userId: string, role = 'member') {
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('os_team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      throw new Error('User is already a member of this team')
    }

    const { data, error } = await supabase
      .from('os_team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeTeamMember(teamId: string, userId: string) {
    const { error } = await supabase
      .from('os_team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async updateMemberRole(teamId: string, userId: string, role: string) {
    const { data, error } = await supabase
      .from('os_team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}