import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksService } from '@/services/tasks'
import { useActiveTeam } from '@/context/team-context'
import { toast } from 'sonner'
import type { CreateTaskRequest, UpdateTaskRequest } from '@/types/tasks'

export function useTasks() {
  const { activeTeamId } = useActiveTeam()

  return useQuery({
    queryKey: ['tasks', activeTeamId],
    queryFn: () => tasksService.getTasks(activeTeamId!),
    enabled: !!activeTeamId,
  })
}

export function useTasksByStatus() {
  const { activeTeamId } = useActiveTeam()

  return useQuery({
    queryKey: ['tasks', 'by-status', activeTeamId],
    queryFn: () => tasksService.getTasksByStatus(activeTeamId!),
    enabled: !!activeTeamId,
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => tasksService.getTaskById(taskId),
    enabled: !!taskId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { activeTeamId } = useActiveTeam()

  return useMutation({
    mutationFn: (task: CreateTaskRequest) =>
      tasksService.createTask(activeTeamId!, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeTeamId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'by-status', activeTeamId] })
      toast.success('Tarefa criada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar tarefa: ' + error.message)
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { activeTeamId } = useActiveTeam()

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskRequest }) =>
      tasksService.updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeTeamId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'by-status', activeTeamId] })
      toast.success('Tarefa atualizada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar tarefa: ' + error.message)
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { activeTeamId } = useActiveTeam()

  return useMutation({
    mutationFn: tasksService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeTeamId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'by-status', activeTeamId] })
      toast.success('Tarefa excluída com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao excluir tarefa: ' + error.message)
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  const { activeTeamId } = useActiveTeam()

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: 'todo' | 'doing' | 'done' }) =>
      tasksService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeTeamId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'by-status', activeTeamId] })
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message)
    },
  })
}