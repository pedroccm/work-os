# Guia Completo: Supabase para Scripts Automatizados

## 📖 Índice

1. [Configuração do Supabase](#1-configuração-do-supabase)
2. [Implementação de Testadores](#2-implementação-de-testadores)
3. [Troubleshooting](#3-troubleshooting)
4. [Templates Reutilizáveis](#4-templates-reutilizáveis)
5. [Debugging Avançado](#5-debugging-avançado)

---

## 1. Configuração do Supabase

### Dependência Principal

```bash
npm install @supabase/supabase-js
```

### Obter Credenciais do Supabase

**No painel do Supabase:**
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **Settings** → **API**
4. Copie as informações:
   - **Project URL**
   - **anon/public key**

### Configurar Variáveis de Ambiente

**Arquivo `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

**⚠️ Importante:**
- Variáveis devem começar com `NEXT_PUBLIC_` para acesso client-side
- Nunca versionar este arquivo
- Manter backup seguro das credenciais

### Cliente Supabase

**Arquivo `src/lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Operações Básicas do Supabase

#### Select (Buscar dados)
```typescript
const { data, error } = await supabase
  .from('os_users')
  .select('*')
  .limit(10)
```

#### Select com filtros
```typescript
const { data, error } = await supabase
  .from('os_users')
  .select('id, name, email')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
```

#### Insert (Inserir dados)
```typescript
const { data, error } = await supabase
  .from('os_users')
  .insert([
    { name: 'João', email: 'joao@email.com' }
  ])
```

#### Update (Atualizar dados)
```typescript
const { data, error } = await supabase
  .from('os_users')
  .update({ name: 'João Silva' })
  .eq('id', 1)
```

#### Delete (Deletar dados)
```typescript
const { data, error } = await supabase
  .from('os_users')
  .delete()
  .eq('id', 1)
```

#### Count (Contar registros)
```typescript
const { count, error } = await supabase
  .from('os_users')
  .select('*', { count: 'exact', head: true })
```

### Configuração da Tabela de Teste

#### Estrutura Básica
```sql
CREATE TABLE os_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Configurar Políticas RLS

**Habilitar Row Level Security:**
```sql
ALTER TABLE os_users ENABLE ROW LEVEL SECURITY;
```

**Política de leitura pública (apenas para testes):**
```sql
CREATE POLICY "Allow public read access" ON os_users
FOR SELECT USING (true);
```

**⚠️ Atenção:** Esta política permite leitura pública. Para produção, implemente políticas mais restritivas.

---

## 2. Implementação de Testadores

### Estados Necessários
```typescript
const [status, setStatus] = useState<string>("")
const [users, setUsers] = useState<any[]>([])
const [loading, setLoading] = useState(false)
```

### Função Principal de Teste
```typescript
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
```

### Interface do Testador

#### Botão de Teste
```jsx
<button
  onClick={testSupabaseConnection}
  disabled={loading}
  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
>
  {loading ? "Testando..." : "Testar Conexão Supabase"}
</button>
```

#### Área de Status
```jsx
{status && (
  <div className={`p-4 rounded-lg mb-4 ${
    status.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
  }`}>
    {status}
  </div>
)}
```

#### Tabela de Resultados
```jsx
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
```

### Personalizações do Testador

#### Mudando a Tabela Testada
```typescript
const { data, error } = await supabase
  .from('sua_tabela')  // ← Altere aqui
  .select('*')
  .limit(10)
```

#### Testando Campos Específicos
```typescript
const { data, error } = await supabase
  .from('os_users')
  .select('id, name, email')  // ← Campos específicos
  .limit(10)
```

#### Ajustando Limite de Registros
```typescript
const { data, error } = await supabase
  .from('os_users')
  .select('*')
  .limit(50)  // ← Altere o número
```

### Versões de Testador

#### Testador Básico (Apenas Conexão)
```typescript
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
```

#### Testador com Contagem
```typescript
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
```

#### Testador com Múltiplas Operações
```typescript
const testAllOperations = async () => {
  setLoading(true)
  const results = []

  try {
    // 1. Teste de conexão
    results.push('🔌 Testando conexão...')
    const { error: connectionError } = await supabase
      .from('os_users')
      .select('id')
      .limit(1)

    if (connectionError) {
      results.push(`❌ Conexão falhou: ${connectionError.message}`)
      setStatus(results.join('\n'))
      return
    }
    results.push('✅ Conexão OK')

    // 2. Teste de contagem
    results.push('📊 Contando registros...')
    const { count, error: countError } = await supabase
      .from('os_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      results.push(`❌ Contagem falhou: ${countError.message}`)
    } else {
      results.push(`✅ Total de registros: ${count}`)
    }

    // 3. Teste de busca
    results.push('🔍 Buscando dados...')
    const { data, error: selectError } = await supabase
      .from('os_users')
      .select('*')
      .limit(5)

    if (selectError) {
      results.push(`❌ Busca falhou: ${selectError.message}`)
    } else {
      results.push(`✅ Buscou ${data?.length || 0} registros`)
      setUsers(data || [])
    }

    setStatus(results.join('\n'))
  } catch (err) {
    results.push(`❌ Erro geral: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    setStatus(results.join('\n'))
  } finally {
    setLoading(false)
  }
}
```

---

## 3. Troubleshooting

### Problemas de Conexão

#### Erro: "Invalid API key"
**Possíveis causas:**
- Chave API incorreta ou inválida
- Usando service key em vez de anon key
- Chave revogada ou expirada

**Soluções:**
```typescript
// Verificar se as variáveis estão corretas
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key presente:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Confirmar no painel Supabase:
// Settings → API → Project URL e anon/public key
```

#### Erro: "Could not find the table 'table_name'"
**Possíveis causas:**
- Nome da tabela incorreto
- Tabela não existe
- Problema de case sensitivity

**Soluções:**
```typescript
// Verificar nome exato da tabela
const { data, error } = await supabase
  .from('nome_exato_da_tabela')  // Verificar underscores vs hífens
  .select('*')

// Listar todas as tabelas (apenas para debug)
const { data: tables } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')

console.log('Tabelas disponíveis:', tables)
```

#### Erro: "Row Level Security policy violation"
**Possíveis causas:**
- RLS habilitado sem políticas
- Políticas muito restritivas
- Falta de autenticação

**Soluções:**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'sua_tabela';

-- Criar política de leitura pública (apenas para testes)
CREATE POLICY "Allow public read" ON sua_tabela
FOR SELECT USING (true);

-- Desabilitar RLS temporariamente (não recomendado para produção)
ALTER TABLE sua_tabela DISABLE ROW LEVEL SECURITY;
```

### Problemas de Rede

#### Erro: "Network request failed"
**Soluções:**
```typescript
// Testar conexão básica
const testConnection = async () => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/')
    console.log('Status:', response.status)
  } catch (err) {
    console.log('Erro de rede:', err)
  }
}

// Configurar timeout customizado
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10 segundos
      })
    }
  }
})
```

### Tratamento de Erros Específicos

```typescript
const handleSupabaseError = (error: any) => {
  switch (error.code) {
    case 'PGRST116':
      return 'Tabela não encontrada. Verifique o nome da tabela.'
    case '42P01':
      return 'Tabela não existe no banco de dados.'
    case '42501':
      return 'Sem permissão para acessar esta tabela.'
    case 'PGRST301':
      return 'Política RLS bloqueou o acesso.'
    default:
      return `Erro: ${error.message}`
  }
}

// Uso na função de teste
if (error) {
  setStatus(handleSupabaseError(error))
  return
}
```

### Códigos de Erro Principais

#### Erros de Tabela:
- `PGRST116` - Tabela não encontrada
- `42P01` - Tabela não existe
- `42501` - Sem permissão

#### Erros de Política:
- `PGRST301` - RLS bloqueou acesso
- `42501` - Política não permite operação

#### Erros de Rede:
- `Network request failed` - Problema de conectividade
- `Invalid API key` - Credenciais incorretas

---

## 4. Templates Reutilizáveis

### Template de Testador Customizável

```typescript
const createSupabaseTest = (tableName: string, operations: string[] = ['select']) => {
  return async () => {
    setLoading(true)
    const results = []

    try {
      for (const operation of operations) {
        switch (operation) {
          case 'select':
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(10)

            if (error) {
              results.push(`❌ Select falhou: ${error.message}`)
            } else {
              results.push(`✅ Select OK: ${data?.length || 0} registros`)
              setUsers(data || [])
            }
            break

          case 'count':
            const { count, error: countError } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })

            if (countError) {
              results.push(`❌ Count falhou: ${countError.message}`)
            } else {
              results.push(`✅ Count OK: ${count} registros`)
            }
            break
        }
      }

      setStatus(results.join('\n'))
    } catch (err) {
      setStatus(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }
}

// Uso
const testMyTable = createSupabaseTest('os_users', ['select', 'count'])
```

### Testador Básico Simples

```typescript
const testConnection = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    return { success: !error, data, error }
  } catch (err) {
    return { success: false, error: err }
  }
}
```

### Testador com Contagem

```typescript
const testWithCount = async (tableName: string) => {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })

  return { success: !error, count, error }
}
```

---

## 5. Debugging Avançado

### Verificação de Variáveis

```typescript
console.log('URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### Teste de Conectividade

```typescript
const testBasic = async () => {
  const response = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/')
  return response.status === 200
}
```

### Testador de Diagnóstico Completo

```typescript
const fullDiagnostic = async () => {
  const results = []

  // 1. Teste de variáveis
  results.push('=== VARIÁVEIS ===')
  results.push(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`)
  results.push(`Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}`)

  // 2. Teste de conectividade
  results.push('\n=== CONECTIVIDADE ===')
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/')
    results.push(`Status HTTP: ${response.status} ${response.status === 200 ? '✅' : '❌'}`)
  } catch (err) {
    results.push(`Rede: ❌ ${err}`)
  }

  // 3. Teste de autenticação
  results.push('\n=== AUTENTICAÇÃO ===')
  try {
    const { data, error } = await supabase.from('_realtime').select('*').limit(1)
    results.push(`Auth: ${error ? '❌ ' + error.message : '✅'}`)
  } catch (err) {
    results.push(`Auth: ❌ ${err}`)
  }

  // 4. Teste de tabela específica
  results.push('\n=== TABELA ===')
  try {
    const { data, error, count } = await supabase
      .from('os_users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      results.push(`Tabela: ❌ ${error.message}`)
    } else {
      results.push(`Tabela: ✅ (${count} registros)`)
    }
  } catch (err) {
    results.push(`Tabela: ❌ ${err}`)
  }

  console.log(results.join('\n'))
  return results.join('\n')
}
```

### Habilitar Logs Detalhados

```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => {
      console.log('Requisição:', url, options)
      return fetch(url, options).then(response => {
        console.log('Resposta:', response.status, response.statusText)
        return response
      })
    }
  }
})
```

### Verificação de Permissões (SQL)

```sql
-- Executar no painel SQL do Supabase para verificar permissões

-- 1. Verificar RLS
SELECT schemaname, tablename, rowsecurity, enablerls
FROM pg_tables
WHERE tablename = 'sua_tabela';

-- 2. Listar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'sua_tabela';

-- 3. Verificar se consegue acessar dados
SELECT COUNT(*) FROM sua_tabela;

-- 4. Testar como usuário anônimo
SET ROLE anon;
SELECT COUNT(*) FROM sua_tabela;
RESET ROLE;
```

---

## 🎯 Para Scripts Automatizados

### Dependência Mínima:
```bash
npm install @supabase/supabase-js
```

### Configuração Básica:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Cliente Base:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Teste Mínimo:
```typescript
const { data, error } = await supabase
  .from('sua_tabela')
  .select('*')
  .limit(10)
```

**🎯 Objetivo:** Este documento fornece tudo necessário para integrar com Supabase, criar testadores de conexão e diagnosticar problemas, ideal para uso por scripts automatizados.