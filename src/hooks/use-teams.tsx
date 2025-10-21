import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamsService, type Team } from '@/services/teams'
import { toast } from 'sonner'

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: teamsService.getTeams,
  })
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => teamsService.getTeamById(teamId),
    enabled: !!teamId,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teamsService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Time criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar time: ' + error.message)
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, updates }: { teamId: string; updates: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at' | 'owner_id'>> }) =>
      teamsService.updateTeam(teamId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Time atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar time: ' + error.message)
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teamsService.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Time deletado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao deletar time: ' + error.message)
    },
  })
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: () => teamsService.getTeamMembers(teamId),
    enabled: !!teamId,
  })
}

export function useAddTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role?: string }) =>
      teamsService.addTeamMember(teamId, userId, role),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] })
      toast.success('Membro adicionado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao adicionar membro: ' + error.message)
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsService.removeTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] })
      toast.success('Membro removido com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao remover membro: ' + error.message)
    },
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) =>
      teamsService.updateMemberRole(teamId, userId, role),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] })
      toast.success('Role atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar role: ' + error.message)
    },
  })
}