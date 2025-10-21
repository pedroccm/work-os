import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { UsersDialogs } from '@/features/users/components/users-dialogs'
import { UsersPrimaryButtons } from '@/features/users/components/users-primary-buttons'
import { UsersProvider } from '@/features/users/components/users-provider'
import { UsersTable } from '@/features/users/components/users-table'
import { getUsers } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

const searchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  username: z.string().optional(),
  status: z.array(z.string()).optional(),
  role: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/users')({
  component: UsersPage,
  validateSearch: searchSchema,
})

function UsersPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      const result = await getUsers()

      if (result.success) {
        // Transformar dados do Supabase para o formato esperado pela tabela
        const transformedUsers = result.data?.map(user => ({
          id: user.id,
          firstName: user.nome?.split(' ')[0] || '',
          lastName: user.nome?.split(' ').slice(1).join(' ') || '',
          username: user.nome?.toLowerCase().replace(/\s+/g, '') || user.email.split('@')[0],
          email: user.email,
          phoneNumber: '', // Não temos telefone na tabela os_users
          status: 'active', // Assumir ativo por padrão
          role: 'user', // Assumir user por padrão
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
        })) || []

        setUsers(transformedUsers)
      } else {
        setError(result.error || 'Erro ao carregar usuários')
      }
      setLoading(false)
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Erro ao carregar usuários</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema aqui.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <UsersTable data={users} navigate={navigate} search={search} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}