# 🤖 Configurações do Claude Code

## 🎯 Instruções Permanentes

### Servidor de Desenvolvimento
- **NUNCA** executar `npm run dev`, `pnpm run dev` ou similares
- **NUNCA** ativar servidores automaticamente
- **NUNCA** rodar comandos de desenvolvimento sem solicitação explícita
- O usuário sempre fará isso manualmente

### Comandos Permitidos
✅ Comandos de arquivo (ls, cat, mkdir, etc.)
✅ Comandos git (status, add, commit, etc.)
✅ Comandos de instalação (npm install, pnpm install)
✅ Comandos de build/production quando solicitado
❌ Comandos de servidor de desenvolvimento
❌ npm/pnpm run dev
❌ Inicialização automática de servidores

### Lembretes
- 🤖 Sempre usar o emoji do robô no final de todo prompt
- 🚫 Nunca rodar servidores automaticamente
- 👤 Deixar o controle total para o usuário
- Nunca criar soluções temporárias ou features apenas de debug

---
*Este arquivo garante que o Claude Code siga sempre estas regras importantes.*