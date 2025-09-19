import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, Trash2, Edit, MoreHorizontal, UserPlus } from 'lucide-react'
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, useTeamMembers, useAddTeamMember, useRemoveTeamMember } from '@/hooks/use-teams'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/_authenticated/teams/')({
  component: TeamsPage,
})

function TeamsPage() {
  const { data: teams, isLoading } = useTeams()
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()
  const deleteTeam = useDeleteTeam()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    nome: '',
    descricao: '',
    cor: '#3b82f6'
  })
  const [editTeam, setEditTeam] = useState({
    nome: '',
    descricao: '',
    cor: ''
  })

  const handleCreateTeam = async () => {
    if (!newTeam.nome.trim()) return
    await createTeam.mutateAsync(newTeam)
    setIsCreateOpen(false)
    setNewTeam({ nome: '', descricao: '', cor: '#3b82f6' })
  }

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !editTeam.nome.trim()) return
    await updateTeam.mutateAsync({
      teamId: selectedTeam.id,
      updates: editTeam
    })
    setIsEditOpen(false)
    setSelectedTeam(null)
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return
    await deleteTeam.mutateAsync(selectedTeam.id)
    setIsDeleteOpen(false)
    setSelectedTeam(null)
  }

  const openEditDialog = (team: any) => {
    setSelectedTeam(team)
    setEditTeam({
      nome: team.nome,
      descricao: team.descricao || '',
      cor: team.cor || '#3b82f6'
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (team: any) => {
    setSelectedTeam(team)
    setIsDeleteOpen(true)
  }

  if (isLoading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='grid gap-6'>
          <Skeleton className='h-12 w-48' />
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className='h-48' />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Times</h1>
          <p className='text-muted-foreground'>Gerencie seus times e membros</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Novo Time
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {teams?.map((team) => (
          <Card key={team.id} className='relative'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div
                    className='w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold'
                    style={{ backgroundColor: team.cor || '#3b82f6' }}
                  >
                    {team.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className='text-lg'>{team.nome}</CardTitle>
                    {team.os_team_members?.[0]?.role && (
                      <Badge variant='secondary' className='mt-1'>
                        {team.os_team_members[0].role}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => openEditDialog(team)}>
                      <Edit className='mr-2 h-4 w-4' />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedTeam(team)}
                      className='cursor-pointer'
                    >
                      <Users className='mr-2 h-4 w-4' />
                      Gerenciar Membros
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(team)}
                      className='text-destructive'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {team.descricao || 'Sem descrição'}
              </CardDescription>
            </CardContent>
            <CardFooter className='text-sm text-muted-foreground'>
              Criado em {new Date(team.created_at).toLocaleDateString('pt-BR')}
            </CardFooter>
          </Card>
        ))}

        {(!teams || teams.length === 0) && (
          <Card className='col-span-full'>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <div className='rounded-full bg-muted p-3 mb-4'>
                <Users className='h-6 w-6 text-muted-foreground' />
              </div>
              <p className='text-muted-foreground mb-4'>Nenhum time encontrado</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Criar Primeiro Time
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo time</DialogTitle>
            <DialogDescription>
              Crie um novo time para organizar seus projetos e colaboradores.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='nome'>Nome do time</Label>
              <Input
                id='nome'
                value={newTeam.nome}
                onChange={(e) => setNewTeam({ ...newTeam, nome: e.target.value })}
                placeholder='Ex: Minha Empresa'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='descricao'>Descrição (opcional)</Label>
              <Textarea
                id='descricao'
                value={newTeam.descricao}
                onChange={(e) => setNewTeam({ ...newTeam, descricao: e.target.value })}
                placeholder='Descreva o time...'
                rows={3}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='cor'>Cor do time</Label>
              <div className='flex gap-2'>
                <Input
                  id='cor'
                  type='color'
                  value={newTeam.cor}
                  onChange={(e) => setNewTeam({ ...newTeam, cor: e.target.value })}
                  className='w-20 h-10'
                />
                <Input
                  value={newTeam.cor}
                  onChange={(e) => setNewTeam({ ...newTeam, cor: e.target.value })}
                  placeholder='#3b82f6'
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={!newTeam.nome.trim() || createTeam.isPending}
            >
              {createTeam.isPending ? 'Criando...' : 'Criar time'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar time</DialogTitle>
            <DialogDescription>
              Atualize as informações do time.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='edit-nome'>Nome do time</Label>
              <Input
                id='edit-nome'
                value={editTeam.nome}
                onChange={(e) => setEditTeam({ ...editTeam, nome: e.target.value })}
                placeholder='Ex: Minha Empresa'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-descricao'>Descrição (opcional)</Label>
              <Textarea
                id='edit-descricao'
                value={editTeam.descricao}
                onChange={(e) => setEditTeam({ ...editTeam, descricao: e.target.value })}
                placeholder='Descreva o time...'
                rows={3}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-cor'>Cor do time</Label>
              <div className='flex gap-2'>
                <Input
                  id='edit-cor'
                  type='color'
                  value={editTeam.cor}
                  onChange={(e) => setEditTeam({ ...editTeam, cor: e.target.value })}
                  className='w-20 h-10'
                />
                <Input
                  value={editTeam.cor}
                  onChange={(e) => setEditTeam({ ...editTeam, cor: e.target.value })}
                  placeholder='#3b82f6'
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateTeam}
              disabled={!editTeam.nome.trim() || updateTeam.isPending}
            >
              {updateTeam.isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de exclusão */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o time
              "{selectedTeam?.nome}" e removerá todos os membros associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              className='bg-destructive text-destructive-foreground'
            >
              {deleteTeam.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de gerenciar membros */}
      {selectedTeam && !isEditOpen && !isDeleteOpen && (
        <TeamMembersDialog
          team={selectedTeam}
          isOpen={!!selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  )
}

function TeamMembersDialog({ team, isOpen, onClose }: any) {
  const { data: members, isLoading } = useTeamMembers(team.id)
  const addMember = useAddTeamMember()
  const removeMember = useRemoveTeamMember()
  const [newMemberEmail, setNewMemberEmail] = useState('')

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return
    // Aqui você precisaria buscar o userId pelo email
    // Por enquanto vou deixar comentado
    // await addMember.mutateAsync({ teamId: team.id, userId: '', role: 'member' })
    setNewMemberEmail('')
  }

  const handleRemoveMember = async (userId: string) => {
    await removeMember.mutateAsync({ teamId: team.id, userId })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Membros de {team.nome}</DialogTitle>
          <DialogDescription>
            Gerencie os membros deste time
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4'>
          <div className='flex gap-2'>
            <Input
              placeholder='Email do novo membro'
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
            <Button
              onClick={handleAddMember}
              disabled={!newMemberEmail.trim() || addMember.isPending}
            >
              <UserPlus className='mr-2 h-4 w-4' />
              Adicionar
            </Button>
          </div>

          {isLoading ? (
            <div className='space-y-2'>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className='h-12' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Entrou em</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      {member.os_users?.email || member.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge>{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {member.role !== 'owner' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}