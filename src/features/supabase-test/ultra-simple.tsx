import { createClient } from '@supabase/supabase-js'

export default function UltraSimpleTest() {

  const testSupabaseTable = async () => {
    console.log('Testando consulta em tabela...')

    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      const supabaseLocal = createClient(url, key)
      console.log('Cliente criado:', supabaseLocal)

      console.log('Consultando tabela os_users...')
      const { data, error } = await supabaseLocal
        .from('os_users')
        .select('*')
        .limit(1)

      console.log('Resultado da consulta:', { data, error })
      alert('✅ Consulta funcionou! Dados: ' + JSON.stringify(data))

    } catch (e) {
      console.log('Erro na consulta:', e)
      alert('❌ Erro: ' + (e instanceof Error ? e.message : 'Desconhecido'))
    }
  }

  const testSupabaseImported = async () => {
    console.log('Testando cliente importado com auth...')

    try {
      const { supabase } = await import('@/lib/supabase')
      console.log('Cliente importado:', supabase)

      console.log('Chamando getSession no cliente importado...')
      const session = await supabase.auth.getSession()
      console.log('Sessão importada:', session)

      alert('✅ Cliente importado funcionou! Session: ' + (session.data.session ? 'Logado' : 'Não logado'))

    } catch (e) {
      console.log('Erro no cliente importado:', e)
      alert('❌ Erro: ' + (e instanceof Error ? e.message : 'Desconhecido'))
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Teste Supabase Gradual</h1>

      <div className="space-y-4">
        <div>
          <p>URL: {import.meta.env.VITE_SUPABASE_URL}</p>
        </div>

        <div>
          <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10)}...</p>
        </div>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={testSupabaseTable}
        >
          Testar Tabela
        </button>

        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={testSupabaseImported}
        >
          Cliente Importado
        </button>
      </div>
    </div>
  )
}