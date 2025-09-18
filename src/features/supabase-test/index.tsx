import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { testConnection, getTables, type DatabaseTable } from '@/lib/supabase'

export default function SupabaseTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean
    message?: string
    error?: string
  } | null>(null)
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [tablesError, setTablesError] = useState<string | null>(null)

  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      const result = await testConnection()
      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }, [])

  const handleLoadTables = useCallback(async () => {
    setIsLoadingTables(true)
    setTablesError(null)
    setTables([])

    try {
      const result = await getTables()
      if (result.success && result.data) {
        setTables(result.data)
      } else {
        setTablesError(result.error || 'Erro ao carregar tabelas')
      }
    } catch (error) {
      setTablesError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsLoadingTables(false)
    }
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Database className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Teste de Conexão Supabase</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Teste de Conexão</span>
            </CardTitle>
            <CardDescription>
              Verifique se a conexão com o Supabase está funcionando corretamente
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
              <Alert variant={connectionResult.success ? 'default' : 'destructive'}>
                <div className="flex items-center space-x-2">
                  {connectionResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={connectionResult.success ? 'default' : 'destructive'}>
                    {connectionResult.success ? 'Sucesso' : 'Erro'}
                  </Badge>
                </div>
                <AlertDescription className="mt-2">
                  {connectionResult.message || connectionResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Tabelas do Banco</span>
            </CardTitle>
            <CardDescription>
              Visualize todas as tabelas disponíveis no banco de dados
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

            {tablesError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{tablesError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tabelas Encontradas ({tables.length})</CardTitle>
            <CardDescription>
              Lista de todas as tabelas no banco de dados
            </CardDescription>
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
                {tables.map((table, index) => (
                  <TableRow key={`${table.table_schema}.${table.table_name}`}>
                    <TableCell className="font-medium">{table.table_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{table.table_schema}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={table.table_type === 'BASE TABLE' ? 'default' : 'secondary'}>
                        {table.table_type}
                      </Badge>
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
          <CardTitle>Configuração Atual</CardTitle>
          <CardDescription>
            Status das variáveis de ambiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>VITE_SUPABASE_URL:</strong>
                <code className="block bg-muted p-2 rounded mt-1 text-xs">
                  {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}
                </code>
              </div>
              <div>
                <strong>VITE_SUPABASE_ANON_KEY:</strong>
                <code className="block bg-muted p-2 rounded mt-1 text-xs">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY
                    ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...`
                    : 'Não configurado'}
                </code>
              </div>
            </div>
            <Alert>
              <AlertDescription>
                {import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
                  ? '✅ Variáveis de ambiente configuradas'
                  : '❌ Variáveis de ambiente não encontradas - reinicie o servidor'
                }
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}