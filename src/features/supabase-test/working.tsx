import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { testConnection, getTables, type DatabaseTable } from '@/lib/supabase'

export default function WorkingSupabaseTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [connectionResult, setConnectionResult] = useState<string>('')
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [tablesResult, setTablesResult] = useState<string>('')

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult('')

    try {
      const result = await testConnection()
      if (result.success) {
        setConnectionResult('✅ Conexão funcionando!')
      } else {
        setConnectionResult(`❌ Erro: ${result.error}`)
      }
    } catch (error) {
      setConnectionResult(`❌ Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleLoadTables = async () => {
    setIsLoadingTables(true)
    setTablesResult('')
    setTables([])

    try {
      const result = await getTables()
      if (result.success && result.data) {
        setTables(result.data)
        setTablesResult(`✅ ${result.data.length} tabelas encontradas`)
      } else {
        setTablesResult(`❌ Erro: ${result.error || 'Falha ao carregar'}`)
      }
    } catch (error) {
      setTablesResult(`❌ Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`)
    } finally {
      setIsLoadingTables(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Database className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Teste Supabase - Funcionando</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Teste de Conexão</span>
            </CardTitle>
            <CardDescription>
              Verificar se a conexão com o Supabase está funcionando
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="w-full"
            >
              {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
            </Button>

            {connectionResult && (
              <Alert>
                <AlertDescription>{connectionResult}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Tabelas</span>
            </CardTitle>
            <CardDescription>
              Listar tabelas disponíveis: os_teams, os_team_members, os_users, os_reunioes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLoadTables}
              disabled={isLoadingTables}
              variant="outline"
              className="w-full"
            >
              {isLoadingTables && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <RefreshCw className="mr-2 h-4 w-4" />
              {isLoadingTables ? 'Carregando...' : 'Listar Tabelas'}
            </Button>

            {tablesResult && (
              <Alert>
                <AlertDescription>{tablesResult}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tabelas Encontradas ({tables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Tabela</TableHead>
                  <TableHead>Schema</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.table_name}>
                    <TableCell className="font-medium">{table.table_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{table.table_schema}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{table.table_type}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Status das Variáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>URL:</strong>
              <code className="block bg-muted p-2 rounded mt-1 text-xs">
                {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}
              </code>
            </div>
            <div>
              <strong>Key:</strong>
              <code className="block bg-muted p-2 rounded mt-1 text-xs">
                {import.meta.env.VITE_SUPABASE_ANON_KEY
                  ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...`
                  : 'Não configurado'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}