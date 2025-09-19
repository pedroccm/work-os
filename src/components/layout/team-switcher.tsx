import * as React from 'react'
import { ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useTeams } from '@/hooks/use-teams'
import { useActiveTeam } from '@/context/team-context'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCreateTeam } from '@/hooks/use-teams'

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { data: teams, isLoading, error } = useTeams()
  const { activeTeamId, setActiveTeamId, activeTeam } = useActiveTeam()
  const createTeam = useCreateTeam()
  const [isAddTeamOpen, setIsAddTeamOpen] = React.useState(false)
  const [newTeam, setNewTeam] = React.useState({
    nome: '',
    descricao: '',
    cor: '#3b82f6'
  })


  const handleCreateTeam = async () => {
    if (!newTeam.nome.trim()) return

    await createTeam.mutateAsync(newTeam)
    setIsAddTeamOpen(false)
    setNewTeam({ nome: '', descricao: '', cor: '#3b82f6' })
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-4 w-24' />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (error) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <Building2 className='size-4' />
            <span className='text-sm text-muted-foreground'>Erro ao carregar times</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!teams || teams.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' onClick={() => setIsAddTeamOpen(true)}>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Plus className='size-4' />
            </div>
            <span className='truncate font-semibold'>Criar primeiro time</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
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
              <Button variant='outline' onClick={() => setIsAddTeamOpen(false)}>
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
      </SidebarMenu>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div
                  className='flex aspect-square size-8 items-center justify-center rounded-lg text-white font-bold'
                  style={{ backgroundColor: activeTeam?.cor || '#3b82f6' }}
                >
                  {activeTeam?.nome?.charAt(0).toUpperCase() || 'T'}
                </div>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {activeTeam?.nome || 'Selecione um time'}
                  </span>
                  <span className='truncate text-xs'>
                    {activeTeam?.os_team_members?.[0]?.role || 'member'}
                  </span>
                </div>
                <ChevronsUpDown className='ms-auto' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              align='start'
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className='text-muted-foreground text-xs'>
                Times
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => setActiveTeamId(team.id)}
                  className='gap-2 p-2'
                >
                  <div
                    className='flex size-6 items-center justify-center rounded-sm text-white font-bold text-xs'
                    style={{ backgroundColor: team.cor || '#3b82f6' }}
                  >
                    {team.nome?.charAt(0).toUpperCase()}
                  </div>
                  {team.nome}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='gap-2 p-2'
                onClick={() => setIsAddTeamOpen(true)}
              >
                <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                  <Plus className='size-4' />
                </div>
                <div className='text-muted-foreground font-medium'>Adicionar time</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='gap-2 p-2'
                onClick={() => navigate({ to: '/teams' })}
              >
                <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                  <Building2 className='size-4' />
                </div>
                <div className='text-muted-foreground font-medium'>Gerenciar times</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
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
            <Button variant='outline' onClick={() => setIsAddTeamOpen(false)}>
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
    </>
  )
}