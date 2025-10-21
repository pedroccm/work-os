export interface Task {
  id: string
  titulo: string
  descricao?: string
  status: 'todo' | 'doing' | 'done'
  prioridade: 'baixa' | 'media' | 'alta'
  team_id: string
  criado_por: string
  assignee_id?: string
  data_vencimento?: string
  created_at: string
  updated_at: string
}

export interface CreateTaskRequest {
  titulo: string
  descricao?: string
  status?: 'todo' | 'doing' | 'done'
  prioridade?: 'baixa' | 'media' | 'alta'
  assignee_id?: string
  data_vencimento?: string
}

export interface UpdateTaskRequest {
  titulo?: string
  descricao?: string
  status?: 'todo' | 'doing' | 'done'
  prioridade?: 'baixa' | 'media' | 'alta'
  assignee_id?: string
  data_vencimento?: string
}

export const TASK_STATUS = {
  todo: 'To Do',
  doing: 'Doing',
  done: 'Done'
} as const

export const TASK_PRIORITY = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta'
} as const