import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface SpeechToTextProps {
  onTranscript: (text: string) => void
  placeholder?: string
  language?: string
  continuous?: boolean
  autoStart?: boolean
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function SpeechToText({
  onTranscript,
  language = 'pt-BR',
  continuous = true,
  autoStart = false
}: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Verificar se o navegador suporta Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)

      recognitionRef.current = new SpeechRecognition()
      const recognition = recognitionRef.current

      recognition.continuous = continuous
      recognition.interimResults = true
      recognition.lang = language

      recognition.onstart = () => {
        setIsListening(true)
        toast.success('Começando a escutar... Pode falar!')
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript

          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setInterimTranscript(interimTranscript)

        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript + ' '
            onTranscript(newTranscript)
            return newTranscript
          })
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)

        switch (event.error) {
          case 'no-speech':
            toast.error('Nenhuma fala detectada. Tente novamente.')
            break
          case 'audio-capture':
            toast.error('Erro no microfone. Verifique as permissões.')
            break
          case 'not-allowed':
            toast.error('Permissão de microfone negada. Ative nas configurações do navegador.')
            break
          case 'network':
            toast.error('Erro de rede. Verifique sua conexão.')
            break
          default:
            toast.error(`Erro no reconhecimento de voz: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimTranscript('')

        if (continuous && isListening) {
          // Reiniciar automaticamente se estava escutando e é contínuo
          setTimeout(() => {
            try {
              recognition.start()
            } catch (e) {
              // Ignorar erro se já estava iniciado
            }
          }, 100)
        }
      }

      // Auto start se solicitado
      if (autoStart) {
        startListening()
      }
    } else {
      toast.error('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language, continuous, autoStart, onTranscript])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Erro ao iniciar reconhecimento:', error)
        toast.error('Erro ao iniciar microfone')
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    onTranscript('')
  }

  if (!isSupported) {
    return (
      <div className='flex items-center gap-2 p-3 bg-muted rounded-lg'>
        <VolumeX className='h-4 w-4 text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>
          Reconhecimento de voz não suportado neste navegador
        </span>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant={isListening ? 'destructive' : 'default'}
          size='sm'
          onClick={isListening ? stopListening : startListening}
          className='flex items-center gap-2'
        >
          {isListening ? (
            <>
              <MicOff className='h-4 w-4' />
              Parar
            </>
          ) : (
            <>
              <Mic className='h-4 w-4' />
              Falar
            </>
          )}
        </Button>

        {isListening && (
          <Badge variant='secondary' className='animate-pulse'>
            <Volume2 className='h-3 w-3 mr-1' />
            Escutando...
          </Badge>
        )}

        {transcript && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={clearTranscript}
          >
            Limpar
          </Button>
        )}
      </div>

    </div>
  )
}