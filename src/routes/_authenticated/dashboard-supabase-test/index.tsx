import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Database, CheckCircle, XCircle, RefreshCw, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function DashboardSupabaseTest() {
  const [status, setStatus] = useState<string>("")
  const [users, setUsers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTest, setActiveTest] = useState<string>("")

  // Teste de conexão básica
  const testConnection = async () => {
    setLoading(true)
    setActiveTest("connection")
    setStatus("Testando conexão...")

    try {
      const { error } = await supabase
        .from('os_users')
        .select('id')
        .limit(1)

      if (error) {
        setStatus(`❌ Erro de conexão: ${error.message}`)
      } else {
        setStatus('✅ Conexão com Supabase bem-sucedida!')
      }
    } catch (err) {
      setStatus(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
      setActiveTest("")
    }
  }

  // Teste com dados dos usuários
  const testUsers = async () => {
    setLoading(true)
    setActiveTest("users")
    setStatus("Buscando usuários...")
    setUsers([])

    try {
      const { data, error } = await supabase
        .from('os_users')
        .select('*')
        .limit(10)

      if (error) {
        setStatus(`❌ Erro ao buscar usuários: ${error.message}`)
      } else {
        setUsers(data || [])
        setStatus(`✅ Encontrados ${data?.length || 0} usuários na tabela os_users`)
      }
    } catch (err) {
      setStatus(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
      setActiveTest("")
    }
  }

  // Teste com dados dos teams
  const testTeams = async () => {
    setLoading(true)
    setActiveTest("teams")
    setStatus("Buscando teams...")
    setTeams([])

    try {
      const { data, error } = await supabase
        .from('os_teams')
        .select('*')
        .limit(10)

      if (error) {
        setStatus(`❌ Erro ao buscar teams: ${error.message}`)
      } else {
        setTeams(data || [])
        setStatus(`✅ Encontrados ${data?.length || 0} teams na tabela os_teams`)
      }
    } catch (err) {
      setStatus(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
      setActiveTest("")
    }
  }

  // Teste completo de todas as tabelas
  const testAllTables = async () => {
    setLoading(true)
    setActiveTest("all")
    setStatus("Testando todas as tabelas...")

    const results = []
    const tables = ['os_users', 'os_teams', 'os_team_members', 'os_reunioes']

    try {
      for (const tableName of tables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })

          if (error) {
            results.push(`❌ ${tableName}: ${error.message}`)
          } else {
            results.push(`✅ ${tableName}: ${data?.length || 0} registros`)
          }
        } catch (e) {
          results.push(`❌ ${tableName}: Erro de acesso`)
        }
      }

      setStatus(results.join('\n'))
    } catch (err) {
      setStatus(`❌ Erro geral: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
      setActiveTest("")
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Activity className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Dashboard - Teste Supabase</h1>
          <p className="text-muted-foreground">Monitoramento e teste da conexão com o banco de dados</p>
        </div>
      </div>

      {/* Cards de ação */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teste Básico</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button
              onClick={testConnection}
              disabled={loading}
              className="w-full"
              variant={activeTest === "connection" ? "default" : "outline"}
            >
              {loading && activeTest === "connection" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Testar Conexão
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button
              onClick={testUsers}
              disabled={loading}
              className="w-full"
              variant={activeTest === "users" ? "default" : "outline"}
            >
              {loading && activeTest === "users" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buscar Usuários
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button
              onClick={testTeams}
              disabled={loading}
              className="w-full"
              variant={activeTest === "teams" ? "default" : "outline"}
            >
              {loading && activeTest === "teams" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buscar Teams
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diagnóstico</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button
              onClick={testAllTables}
              disabled={loading}
              className="w-full"
              variant={activeTest === "all" ? "default" : "outline"}
            >
              {loading && activeTest === "all" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Teste Completo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      {status && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {status}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela de usuários */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários Encontrados ({users.length})</CardTitle>
            <CardDescription>Dados da tabela os_users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(users[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    {Object.values(user).map((value, idx) => (
                      <TableCell key={idx}>
                        {value ? String(value) : <Badge variant="secondary">null</Badge>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabela de teams */}
      {teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teams Encontrados ({teams.length})</CardTitle>
            <CardDescription>Dados da tabela os_teams</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(teams[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team, index) => (
                  <TableRow key={index}>
                    {Object.values(team).map((value, idx) => (
                      <TableCell key={idx}>
                        {value ? String(value) : <Badge variant="secondary">null</Badge>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Info técnica */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>URL Supabase:</strong>
              <Badge variant="outline" className="ml-2">
                {import.meta.env.VITE_SUPABASE_URL ? 'Configurado' : 'Não configurado'}
              </Badge>
            </div>
            <div>
              <strong>Chave API:</strong>
              <Badge variant="outline" className="ml-2">
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'}
              </Badge>
            </div>
            <div>
              <strong>Ambiente:</strong>
              <Badge variant="outline" className="ml-2">
                {import.meta.env.MODE}
              </Badge>
            </div>
            <div>
              <strong>Code Splitting:</strong>
              <Badge variant="outline" className="ml-2">
                {import.meta.env.NODE_ENV === 'production' ? 'Habilitado' : 'Desabilitado'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard-supabase-test/')({
  component: DashboardSupabaseTest,
})