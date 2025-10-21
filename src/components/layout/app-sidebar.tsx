import { useLayout } from '@/context/layout-provider'
import { useUser } from '@/context/user-provider'
import { Command } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user, teams } = useUser()

  // Preparar dados dos teams com ícone padrão
  const teamsWithIcons = teams.map(team => ({
    name: team.name,
    logo: Command, // Ícone padrão
    plan: team.plan || 'Team'
  }))

  // Se não há teams, usar um team padrão
  const finalTeams = teamsWithIcons.length > 0 ? teamsWithIcons : [{
    name: 'Meu Workspace',
    logo: Command,
    plan: 'Personal'
  }]

  // Preparar dados do usuário
  const userData = user ? {
    name: user.nome,
    email: user.email,
    avatar: user.avatar_url || '/avatars/shadcn.jpg'
  } : sidebarData.user

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={finalTeams} />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
