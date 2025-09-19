import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Calendar, User, Flag, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { TASK_STATUS, TASK_PRIORITY } from '@/types/tasks'
import type { CreateTaskRequest } from '@/types/tasks'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { KanbanView } from './kanban'

export const Route = createFileRoute('/_authenticated/todos/')({
  component: TodosPage,
})

function TodosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [newTask, setNewTask] = useState<CreateTaskRequest>({
    titulo: '',
    descricao: '',
    status: 'todo',
    prioridade: 'media',
  })

  const { data: tasks, isLoading } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const filteredTasks = tasks?.filter(task =>
    task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateTask = async () => {
    if (!newTask.titulo.trim()) return

    await createTask.mutateAsync(newTask)
    setIsCreateOpen(false)
    setNewTask({
      titulo: '',
      descricao: '',
      status: 'todo',
      prioridade: 'media',
    })
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask.mutateAsync(taskId)
    }
  }

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'destructive'
      case 'media': return 'secondary'
      case 'baixa': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'outline'
      case 'doing': return 'secondary'
      case 'done': return 'default'
      default: return 'outline'
    }
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>To-Do</h1>
          <p className='text-muted-foreground'>
            Gerencie as tarefas da sua equipe
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Nova Tarefa
        </Button>
      </div>

      <div className='flex items-center space-x-2'>
        <Search className='h-5 w-5 text-muted-foreground' />
        <Input
          placeholder='Buscar tarefas...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
      </div>

      <Tabs defaultValue='list' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='list'>Lista</TabsTrigger>
          <TabsTrigger value='kanban'>Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value='list'>
          <Card>
            <CardContent>
              {isLoading ? (
                <p className='text-center py-4'>Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className='text-right'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks?.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className='font-medium'>
                          <div>
                            <p className='font-semibold'>{task.titulo}</p>
                            {task.descricao && (
                              <p className='text-sm text-muted-foreground'>
                                {task.descricao}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(task.status)}>
                            {TASK_STATUS[task.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(task.prioridade)}>
                            {TASK_PRIORITY[task.prioridade]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.assignee?.email || 'Não atribuído'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(task.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => setSelectedTask(task)}
                              >
                                <Eye className='mr-2 h-4 w-4' />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTask(task.id)}
                                className='text-destructive'
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!filteredTasks || filteredTasks.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className='text-center py-8'>
                          <div className='text-muted-foreground'>
                            <p>Nenhuma tarefa encontrada</p>
                            <p className='text-sm'>Crie sua primeira tarefa para começar</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='kanban'>
          <KanbanView />
        </TabsContent>
      </Tabs>

      {/* Dialog de criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Crie uma nova tarefa para sua equipe
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='titulo'>Título</Label>
              <Input
                id='titulo'
                value={newTask.titulo}
                onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
                placeholder='Digite o título da tarefa'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='descricao'>Descrição</Label>
              <Textarea
                id='descricao'
                value={newTask.descricao}
                onChange={(e) => setNewTask({ ...newTask, descricao: e.target.value })}
                placeholder='Descreva a tarefa...'
                rows={3}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value: 'todo' | 'doing' | 'done') =>
                    setNewTask({ ...newTask, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='todo'>To Do</SelectItem>
                    <SelectItem value='doing'>Doing</SelectItem>
                    <SelectItem value='done'>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='prioridade'>Prioridade</Label>
                <Select
                  value={newTask.prioridade}
                  onValueChange={(value: 'baixa' | 'media' | 'alta') =>
                    setNewTask({ ...newTask, prioridade: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='baixa'>Baixa</SelectItem>
                    <SelectItem value='media'>Média</SelectItem>
                    <SelectItem value='alta'>Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.titulo.trim() || createTask.isPending}
            >
              {createTask.isPending ? 'Criando...' : 'Criar tarefa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}