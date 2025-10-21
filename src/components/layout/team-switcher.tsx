import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { useUser } from '@/context/user-provider'
import { useAuthStore } from '@/stores/auth-store'
import { createTeam } from '@/lib/supabase'
import { toast } from 'sonner'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [teamName, setTeamName] = React.useState('')
  const [teamDescription, setTeamDescription] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const { refreshTeams } = useUser()
  const { auth } = useAuthStore()

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !auth.user?.accountNo) return

    setLoading(true)
    const result = await createTeam(
      {
        name: teamName.trim(),
        description: teamDescription.trim() || undefined
      },
      auth.user.accountNo
    )

    if (result.success) {
      toast.success('Team criado com sucesso!')
      setDialogOpen(false)
      setTeamName('')
      setTeamDescription('')
      await refreshTeams()
    } else {
      toast.error('Erro ao criar team', {
        description: result.error
      })
    }
    setLoading(false)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <activeTeam.logo className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeTeam.name}
                </span>
                <span className='truncate text-xs'>{activeTeam.plan}</span>
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
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <team.logo className='size-4 shrink-0' />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className='gap-2 p-2'
                  onSelect={(e) => {
                    e.preventDefault()
                    setDialogOpen(true)
                  }}
                >
                  <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                    <Plus className='size-4' />
                  </div>
                  <div className='text-muted-foreground font-medium'>Add team</div>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Team</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='team-name'>Nome do Team</Label>
                    <Input
                      id='team-name'
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder='Digite o nome do team'
                    />
                  </div>
                  <div>
                    <Label htmlFor='team-description'>Descrição (opcional)</Label>
                    <Textarea
                      id='team-description'
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      placeholder='Descreva o propósito do team'
                    />
                  </div>
                  <div className='flex justify-end space-x-2'>
                    <Button
                      variant='outline'
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateTeam}
                      disabled={!teamName.trim() || loading}
                    >
                      {loading ? 'Criando...' : 'Criar Team'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
