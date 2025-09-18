export default function SimpleSupabaseTest() {
  return (
    <div className="p-6">
      <h1>Teste Simples Supabase</h1>

      <div className="mt-4">
        <h2>Variáveis de Ambiente:</h2>
        <p>URL: {import.meta.env.VITE_SUPABASE_URL}</p>
        <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
      </div>

      <div className="mt-4">
        <button
          onClick={() => alert('Clicou!')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Teste Simples
        </button>
      </div>
    </div>
  )
}