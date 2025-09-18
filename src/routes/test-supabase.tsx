import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

// Cliente Supabase criado localmente, sem importar nada
function TestSupabasePage() {
  const [status, setStatus] = useState<string>("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Função principal de teste
  const testSupabaseConnection = async () => {
    setLoading(true)
    setStatus("Testando conexão...")
    setUsers([])

    try {
      // Importar dinamicamente para evitar problemas
      const { createClient } = await import('@supabase/supabase-js')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { data, error } = await supabase
        .from('os_users')
        .select('*')
        .limit(10)

      if (error) {
        setStatus(`Erro: ${error.message}`)
        return
      }

      setUsers(data || [])
      setStatus(`Conexão bem-sucedida! Encontrados ${data?.length || 0} usuários.`)
    } catch (err) {
      setStatus(`Erro de conexão: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  // Testador básico (apenas conexão)
  const testBasicConnection = async () => {
    setLoading(true)
    try {
      const { createClient } = await import('@supabase/supabase-js')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error } = await supabase
        .from('os_users')
        .select('id')
        .limit(1)

      if (error) {
        setStatus(`Erro: ${error.message}`)
      } else {
        setStatus('Conexão bem-sucedida!')
      }
    } catch (err) {
      setStatus(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        🧪 Teste Supabase Isolado
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '15px' }}>Informações de Debug:</h2>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <p>URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}</p>
          <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado'}</p>
          <p>Tabela testada: os_users</p>
          <p>Sem importações globais - tudo local</p>
        </div>
      </div>

      {/* Botões de teste */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#93c5fd' : '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? "Testando..." : "Testar Conexão Completa"}
        </button>

        <button
          onClick={testBasicConnection}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#86efac' : '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? "Testando..." : "Teste Básico"}
        </button>
      </div>

      {/* Área de status */}
      {status && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: status.includes('Erro') ? '#fecaca' : '#d1fae5',
          color: status.includes('Erro') ? '#b91c1c' : '#065f46',
          border: `1px solid ${status.includes('Erro') ? '#f87171' : '#6ee7b7'}`
        }}>
          {status}
        </div>
      )}

      {/* Tabela de resultados */}
      {users.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#374151'
          }}>
            Tabela os_users:
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #d1d5db'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  {Object.keys(users[0]).map((key) => (
                    <th key={key} style={{
                      border: '1px solid #d1d5db',
                      padding: '8px 16px',
                      textAlign: 'left',
                      fontWeight: '600'
                    }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} style={{
                    ':hover': { backgroundColor: '#f9fafb' }
                  }}>
                    {Object.values(user).map((value, idx) => (
                      <td key={idx} style={{
                        border: '1px solid #d1d5db',
                        padding: '8px 16px'
                      }}>
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        Página totalmente isolada - sem componentes compartilhados
      </div>
    </div>
  )
}

export const Route = createFileRoute('/test-supabase')({
  component: TestSupabasePage,
})