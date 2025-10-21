import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { getTeams } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface UserData {
  id: string
  nome: string
  email: string
  avatar_url?: string
}

interface Team {
  id: string
  name: string
  description?: string
  logo?: string
  plan?: string
}

interface UserContextType {
  user: UserData | null
  teams: Team[]
  loading: boolean
  refreshTeams: () => Promise<void>
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const { auth } = useAuthStore()

  const fetchUserData = async () => {
    if (!auth.user?.accountNo) return

    try {
      // Buscar dados do usuário na tabela os_users
      const { data: userData, error: userError } = await supabase
        .from('os_users')
        .select('*')
        .eq('id', auth.user.accountNo)
        .single()

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError)
        return
      }

      setUser(userData)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
    }
  }

  const fetchTeams = async () => {
    if (!auth.user?.accountNo) return

    const result = await getTeams(auth.user.accountNo)
    if (result.success) {
      // Transformar dados para o formato esperado
      const transformedTeams = result.data?.map(team => ({
        id: team.id,
        name: team.nome,
        description: team.descricao,
        logo: 'Command', // Ícone padrão
        plan: 'Team'
      })) || []

      setTeams(transformedTeams)
    }
  }

  const refreshTeams = async () => {
    await fetchTeams()
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      if (auth.user) {
        await Promise.all([fetchUserData(), fetchTeams()])
      }
      setLoading(false)
    }

    loadData()
  }, [auth.user])

  return (
    <UserContext.Provider value={{ user, teams, loading, refreshTeams }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}