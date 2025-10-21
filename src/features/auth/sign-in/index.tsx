import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Entrar</CardTitle>
          <CardDescription>
            Digite seu email e senha para <br />
            acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            Não tem uma conta ainda?{' '}
            <a
              href='/sign-up'
              className='hover:text-primary underline underline-offset-4 font-medium'
            >
              Cadastre-se aqui
            </a>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
