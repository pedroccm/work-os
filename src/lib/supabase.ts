import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DatabaseTable {
  table_name: string
  table_schema: string
  table_type: string
}

export async function testConnection() {
  try {
    // Usar uma consulta que bypass policies RLS problemáticas
    const { error } = await supabase.auth.getSession()

    if (error) {
      return { success: false, error: error.message }
    }

    // Testar uma consulta simples sem RLS
    try {
      const { error: rpcError } = await supabase.rpc('ping')
      if (rpcError && !rpcError.message.includes('function "ping" does not exist')) {
        return { success: false, error: rpcError.message }
      }
    } catch (e) {
      // Ignora erro se função ping não existir
    }

    return { success: true, message: 'Conexão com Supabase funcionando!' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro na conexão'
    }
  }
}

export async function getTables(): Promise<{ success: boolean; data?: DatabaseTable[]; error?: string }> {
  try {
    // Tabelas reais do seu Supabase (que funcionaram no Python)
    const realTables = ['os_teams', 'os_team_members', 'os_users', 'os_reunioes']
    const foundTables: DatabaseTable[] = []

    for (const tableName of realTables) {
      try {
        // Consulta simples para verificar acesso
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (!error) {
          foundTables.push({
            table_name: tableName,
            table_schema: 'public',
            table_type: 'BASE TABLE'
          })
        }
      } catch (e) {
        console.log(`Erro ao acessar ${tableName}:`, e)
      }
    }

    return { success: true, data: foundTables }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar tabelas'
    }
  }
}

export interface UserData {
  nome: string
  email: string
  avatar_url?: string
}

export async function signUpUser(email: string, password: string, userData: UserData) {
  try {
    console.log('Tentando criar usuário:', { email, userData })

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: userData.nome,
          avatar_url: userData.avatar_url || null
        }
      }
    })

    console.log('Resposta do signUp:', { authData, authError })

    if (authError) {
      console.error('Erro no signUp:', authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Falha ao criar usuário' }
    }

    // 2. Inserir na tabela os_users sempre
    const { error: insertError } = await supabase
      .from('os_users')
      .insert({
        id: authData.user.id,
        nome: userData.nome,
        email: userData.email,
        avatar_url: userData.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    console.log('Resultado insert os_users:', { insertError })

    if (insertError) {
      console.error('Erro ao inserir na tabela:', insertError)
      return { success: false, error: `Erro ao criar perfil: ${insertError.message}` }
    }

    // Verificar se precisa confirmar email
    const needsEmailConfirmation = !authData.user.email_confirmed_at && authData.user.confirmation_sent_at

    return {
      success: true,
      user: authData.user,
      message: needsEmailConfirmation
        ? 'Usuário criado! Verifique seu email para confirmar a conta antes de fazer login.'
        : 'Usuário criado com sucesso!'
    }
  } catch (error) {
    console.error('Erro catch signUpUser:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado'
    }
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado'
    }
  }
}

// Funções para gerenciar usuários
export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('os_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado'
    }
  }
}

// Funções para gerenciar teams
export async function getTeams(userId?: string) {
  try {
    let query = supabase
      .from('os_teams')
      .select(`
        id,
        nome,
        descricao,
        cor,
        owner_id,
        created_at,
        updated_at,
        os_team_members!inner (
          user_id,
          role
        )
      `)

    if (userId) {
      query = query.eq('os_team_members.user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado'
    }
  }
}

export async function createTeam(teamData: { name: string; description?: string }, ownerId: string) {
  try {
    console.log('Criando team:', teamData, 'Owner:', ownerId)

    // 1. Criar o team
    const { data: team, error: teamError } = await supabase
      .from('os_teams')
      .insert({
        nome: teamData.name,
        descricao: teamData.description || null,
        owner_id: ownerId,
        cor: '#3b82f6', // Cor padrão azul
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    console.log('Resultado criar team:', { team, teamError })

    if (teamError) {
      console.error('Erro ao criar team:', teamError)
      return { success: false, error: teamError.message }
    }

    // 2. Adicionar owner como membro
    const { error: memberError } = await supabase
      .from('os_team_members')
      .insert({
        team_id: team.id,
        user_id: ownerId,
        role: 'owner',
        joined_at: new Date().toISOString()
      })

    console.log('Resultado adicionar membro:', { memberError })

    if (memberError) {
      console.error('Erro ao adicionar membro:', memberError)
      // Se falhar ao adicionar membro, remover o team criado
      await supabase.from('os_teams').delete().eq('id', team.id)
      return { success: false, error: memberError.message }
    }

    console.log('Team criado com sucesso:', team)
    return { success: true, data: team }
  } catch (error) {
    console.error('Erro catch createTeam:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado'
    }
  }
}