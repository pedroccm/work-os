import { useState } from 'react'
import { Plus, MoreHorizontal, Calendar, User, Flag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTasksByStatus, useUpdateTaskStatus, useDeleteTask } from '@/hooks/use-tasks'
import { TASK_PRIORITY } from '@/types/tasks'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function KanbanView() {
  const { data: tasksByStatus, isLoading } = useTasksByStatus()
  const updateTaskStatus = useUpdateTaskStatus()
  const deleteTask = useDeleteTask()

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask.mutateAsync(taskId)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    await updateTaskStatus.mutateAsync({ taskId, status: newStatus })
  }

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'destructive'
      case 'media': return 'secondary'
      case 'baixa': return 'outline'
      default: return 'secondary'
    }
  }

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: tasksByStatus?.todo || [],
      color: 'border-slate-200 bg-slate-50/50'
    },
    {
      id: 'doing',
      title: 'Doing',
      tasks: tasksByStatus?.doing || [],
      color: 'border-blue-200 bg-blue-50/50'
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasksByStatus?.done || [],
      color: 'border-green-200 bg-green-50/50'
    }
  ]

  if (isLoading) {
    return <p className='text-center py-4'>Carregando...</p>
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      {columns.map((column) => (
        <div key={column.id} className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold text-lg'>{column.title}</h3>
            <Badge variant='outline' className='text-xs'>
              {column.tasks.length}
            </Badge>
          </div>

          <div className={`min-h-[400px] rounded-lg border-2 border-dashed p-4 ${column.color}`}>
            <div className='space-y-3'>
              {column.tasks.map((task) => (
                <Card
                  key={task.id}
                  className='cursor-pointer hover:shadow-md transition-shadow'
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', task.id)
                    e.dataTransfer.setData('application/json', JSON.stringify(task))
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const taskId = e.dataTransfer.getData('text/plain')
                    if (taskId !== task.id) {
                      handleStatusChange(taskId, column.id as 'todo' | 'doing' | 'done')
                    }
                  }}
                >
                  <CardHeader className='pb-2'>
                    <div className='flex items-start justify-between'>
                      <CardTitle className='text-sm font-medium leading-tight'>
                        {task.titulo}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-6 w-6'>
                            <MoreHorizontal className='h-3 w-3' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          {column.id !== 'todo' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(task.id, 'todo')}
                            >
                              Mover para To Do
                            </DropdownMenuItem>
                          )}
                          {column.id !== 'doing' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(task.id, 'doing')}
                            >
                              Mover para Doing
                            </DropdownMenuItem>
                          )}
                          {column.id !== 'done' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(task.id, 'done')}
                            >
                              Mover para Done
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.id)}
                            className='text-destructive'
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className='pt-0 space-y-3'>
                    {task.descricao && (
                      <p className='text-xs text-muted-foreground line-clamp-2'>
                        {task.descricao}
                      </p>
                    )}

                    <div className='flex items-center justify-between'>
                      <Badge
                        variant={getPriorityColor(task.prioridade)}
                        className='text-xs'
                      >
                        <Flag className='mr-1 h-3 w-3' />
                        {TASK_PRIORITY[task.prioridade as keyof typeof TASK_PRIORITY]}
                      </Badge>

                      {task.data_vencimento && (
                        <div className='flex items-center text-xs text-muted-foreground'>
                          <Calendar className='mr-1 h-3 w-3' />
                          {format(new Date(task.data_vencimento), 'dd/MM', { locale: ptBR })}
                        </div>
                      )}
                    </div>

                    {task.assignee && (
                      <div className='flex items-center text-xs text-muted-foreground'>
                        <User className='mr-1 h-3 w-3' />
                        {task.assignee.email}
                      </div>
                    )}

                    <div className='text-xs text-muted-foreground'>
                      Criado em {format(new Date(task.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {column.tasks.length === 0 && (
                <div
                  className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center text-muted-foreground'
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const taskId = e.dataTransfer.getData('text/plain')
                    handleStatusChange(taskId, column.id as 'todo' | 'doing' | 'done')
                  }}
                >
                  <p className='text-sm'>Nenhuma tarefa em {column.title}</p>
                  <p className='text-xs mt-1'>Arraste tarefas para cá</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}