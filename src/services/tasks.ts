import { supabase } from '@/lib/supabase'
import type { CreateTaskRequest, UpdateTaskRequest } from '@/types/tasks'

export const tasksService = {
  async getTasks(teamId: string) {
    const { data, error } = await supabase
      .from('os_tasks')
      .select(`
        *,
        criador:os_users!criado_por(id, email),
        assignee:os_users!assignee_id(id, email)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getTasksByStatus(teamId: string) {
    const tasks = await this.getTasks(teamId)

    return {
      todo: tasks.filter(task => task.status === 'todo'),
      doing: tasks.filter(task => task.status === 'doing'),
      done: tasks.filter(task => task.status === 'done')
    }
  },

  async getTaskById(taskId: string) {
    const { data, error } = await supabase
      .from('os_tasks')
      .select(`
        *,
        criador:os_users!criado_por(id, email),
        assignee:os_users!assignee_id(id, email)
      `)
      .eq('id', taskId)
      .single()

    if (error) throw error
    return data
  },

  async createTask(teamId: string, task: CreateTaskRequest) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('os_tasks')
      .insert({
        ...task,
        team_id: teamId,
        criado_por: user.id,
        status: task.status || 'todo',
        prioridade: task.prioridade || 'media'
      })
      .select(`
        *,
        criador:os_users!criado_por(id, email),
        assignee:os_users!assignee_id(id, email)
      `)
      .single()

    if (error) throw error
    return data
  },

  async updateTask(taskId: string, updates: UpdateTaskRequest) {
    const { data, error } = await supabase
      .from('os_tasks')
      .update(updates)
      .eq('id', taskId)
      .select(`
        *,
        criador:os_users!criado_por(id, email),
        assignee:os_users!assignee_id(id, email)
      `)
      .single()

    if (error) throw error
    return data
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('os_tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
  },

  async updateTaskStatus(taskId: string, status: 'todo' | 'doing' | 'done') {
    return this.updateTask(taskId, { status })
  }
}