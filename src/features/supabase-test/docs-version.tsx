import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DocsVersionTest() {
  const [status, setStatus] = useState<string>("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Função principal de teste (copiada exatamente do documento)
  const testSupabaseConnection = async () => {
    setLoading(true)
    setStatus("Testando conexão...")
    setUsers([])

    try {
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

  // Testador com contagem
  const testWithCount = async () => {
    setLoading(true)
    try {
      const { count, error } = await supabase
        .from('os_users')
        .select('*', { count: 'exact', head: true })

      if (error) {
        setStatus(`Erro: ${error.message}`)
      } else {
        setStatus(`Conexão OK! Total de registros: ${count}`)
      }
    } catch (err) {
      setStatus(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Teste Supabase - Seguindo Documentação
      </h1>

      {/* Botões de teste */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {loading ? "Testando..." : "Testar Conexão Completa"}
        </button>

        <button
          onClick={testBasicConnection}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {loading ? "Testando..." : "Teste Básico"}
        </button>

        <button
          onClick={testWithCount}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {loading ? "Testando..." : "Teste com Contagem"}
        </button>
      </div>

      {/* Área de status (copiada do documento) */}
      {status && (
        <div className={`p-4 rounded-lg mb-4 ${
          status.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {status}
        </div>
      )}

      {/* Tabela de resultados (copiada do documento) */}
      {users.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Tabela os_users:
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  {Object.keys(users[0]).map((key) => (
                    <th key={key} className="border border-gray-300 px-4 py-2 text-left">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(user).map((value, idx) => (
                      <td key={idx} className="border border-gray-300 px-4 py-2">
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

      {/* Informações de debug */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
        <div className="text-sm space-y-1">
          <p>URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}</p>
          <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado'}</p>
          <p>Tabela testada: os_users</p>
        </div>
      </div>
    </div>
  )
}