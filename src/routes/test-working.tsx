import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"

function WorkingPage() {
  const [status, setStatus] = useState<string>("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testSupabaseConnection = async () => {
    setLoading(true)
    setStatus("Testando conexão...")
    setUsers([])

    try {
      // Importar e criar cliente localmente (igual ao seu código que funciona)
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

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        maxWidth: '64rem',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1f2937'
        }}>
          Testador de Supabase - Código que Funciona
        </h1>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={testSupabaseConnection}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#93c5fd' : '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2563eb'
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6'
              }}
            >
              {loading ? "Testando..." : "Testar Conexão Supabase"}
            </button>
          </div>

          {status && (
            <div style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              backgroundColor: status.includes('Erro') ? '#fef2f2' : '#f0fdf4',
              color: status.includes('Erro') ? '#b91c1c' : '#166534',
              border: `1px solid ${status.includes('Erro') ? '#fecaca' : '#bbf7d0'}`
            }}>
              {status}
            </div>
          )}

          {users.length > 0 && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1f2937'
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
                          padding: '0.5rem 1rem',
                          textAlign: 'left'
                        }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={index} style={{
                        backgroundColor: 'transparent'
                      }}>
                        {Object.values(user).map((value, idx) => (
                          <td key={idx} style={{
                            border: '1px solid #d1d5db',
                            padding: '0.5rem 1rem'
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
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p>✅ URL: {import.meta.env.VITE_SUPABASE_URL ? 'Configurado' : 'Não configurado'}</p>
          <p>✅ Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'}</p>
          <p>🔄 Cliente criado localmente (sem importação global)</p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/test-working')({
  component: WorkingPage,
})