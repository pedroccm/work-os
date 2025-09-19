# 📊 Esquema do Banco de Dados

Este documento descreve a estrutura das tabelas utilizadas no sistema Work OS.

## 🗂️ Tabelas

### 1. `os_teams` - Times/Equipes
Armazena informações sobre os times/equipes da organização.

| Coluna | Tipo | Formato | Descrição |
|--------|------|---------|-----------|
| `id` | `uuid` | string | Identificador único do time (chave primária) |
| `nome` | `character varying` | string | Nome do time |
| `descricao` | `text` | string | Descrição detalhada do time |
| `cor` | `character varying` | string | Cor do time em formato hexadecimal (ex: #3b82f6) |
| `owner_id` | `uuid` | string | ID do usuário proprietário/criador do time |
| `created_at` | `timestamp with time zone` | string | Data e hora de criação do registro |
| `updated_at` | `timestamp with time zone` | string | Data e hora da última atualização |

**Índices:**
- Primary Key: `id`
- Foreign Key: `owner_id` → `os_users.id`

---

### 2. `os_team_members` - Membros dos Times
Tabela de relacionamento entre usuários e times, definindo os membros de cada time.

| Coluna | Tipo | Formato | Descrição |
|--------|------|---------|-----------|
| `id` | `uuid` | string | Identificador único do registro (chave primária) |
| `team_id` | `uuid` | string | ID do time (referência para os_teams) |
| `user_id` | `uuid` | string | ID do usuário membro (referência para os_users) |
| `role` | `character varying` | string | Papel do membro no time (owner, admin, member) |
| `joined_at` | `timestamp with time zone` | string | Data e hora que o usuário entrou no time |

**Índices:**
- Primary Key: `id`
- Foreign Key: `team_id` → `os_teams.id`
- Foreign Key: `user_id` → `os_users.id`
- Unique: `(team_id, user_id)` - Um usuário não pode estar duas vezes no mesmo time

**Papéis (Roles):**
- `owner` - Proprietário do time (criador original)
- `admin` - Administrador com permissões de gerenciamento
- `member` - Membro regular do time

---

### 3. `os_users` - Usuários
Tabela de usuários do sistema.

| Coluna | Tipo | Formato | Descrição |
|--------|------|---------|-----------|
| `id` | `uuid` | string | Identificador único do usuário (chave primária) |
| `email` | `character varying` | string | Email do usuário (único) |
| `nome` | `character varying` | string | Nome completo do usuário |
| `avatar_url` | `text` | string | URL da foto/avatar do usuário |
| `created_at` | `timestamp with time zone` | string | Data de criação do usuário |
| `updated_at` | `timestamp with time zone` | string | Data da última atualização |

**Índices:**
- Primary Key: `id`
- Unique: `email`

---

### 4. `os_reunioes` - Reuniões
Tabela para gerenciamento de reuniões.

| Coluna | Tipo | Formato | Descrição |
|--------|------|---------|-----------|
| `id` | `uuid` | string | Identificador único da reunião |
| `nome` | `character varying` | string | Nome da reunião |
| `descricao` | `text` | string | Descrição/pauta da reunião |
| `data_reuniao` | `date` | string | Data da reunião |
| `hora_inicio` | `time without time zone` | string | Hora de início da reunião |
| `hora_fim` | `time without time zone` | string | Hora de término da reunião |
| `video_youtube` | `character varying` | string | URL do vídeo da reunião no YouTube |
| `video_youtube_id` | `character varying` | string | ID do vídeo extraído da URL do YouTube |
| `transcript` | `text` | string | Transcrição da reunião |
| `status` | `character varying` | string | Status da reunião (agendada, em_andamento, concluida, cancelada) |
| `team_id` | `uuid` | string | ID do time responsável pela reunião |
| `criado_por` | `uuid` | string | ID do usuário que criou a reunião |
| `created_at` | `timestamp with time zone` | string | Data de criação do registro |
| `updated_at` | `timestamp with time zone` | string | Data da última atualização |

**Índices:**
- Primary Key: `id`
- Foreign Key: `team_id` → `os_teams.id`
- Foreign Key: `criado_por` → `os_users.id`

---

### 5. `os_tasks` - Tarefas/To-Do
Tabela para gerenciamento de tarefas e to-dos dos times.

| Coluna | Tipo | Formato | Descrição |
|--------|------|---------|-----------|
| `id` | `uuid` | string | Identificador único da tarefa |
| `titulo` | `character varying` | string | Título da tarefa |
| `descricao` | `text` | string | Descrição detalhada da tarefa |
| `status` | `character varying` | string | Status da tarefa (todo, doing, done) |
| `prioridade` | `character varying` | string | Prioridade da tarefa (baixa, media, alta) |
| `team_id` | `uuid` | string | ID do time responsável pela tarefa |
| `criado_por` | `uuid` | string | ID do usuário que criou a tarefa |
| `assignee_id` | `uuid` | string | ID do usuário responsável pela tarefa |
| `data_vencimento` | `date` | string | Data de vencimento da tarefa |
| `created_at` | `timestamp with time zone` | string | Data de criação do registro |
| `updated_at` | `timestamp with time zone` | string | Data da última atualização |

**Índices:**
- Primary Key: `id`
- Foreign Key: `team_id` → `os_teams.id`
- Foreign Key: `criado_por` → `os_users.id`
- Foreign Key: `assignee_id` → `os_users.id`

**Constraints:**
- `status` deve ser um dos valores: 'todo', 'doing', 'done'
- `prioridade` deve ser um dos valores: 'baixa', 'media', 'alta'

**Status das Tarefas:**
- `todo` - Tarefa a fazer
- `doing` - Tarefa em andamento
- `done` - Tarefa concluída

**Prioridades:**
- `baixa` - Prioridade baixa
- `media` - Prioridade média (padrão)
- `alta` - Prioridade alta

---

## 🔄 Relacionamentos

### Diagrama de Relacionamentos

```
os_users (1) ──────┬──── (N) os_team_members
                   │
                   ├──── (N) os_teams (owner_id)
                   │
                   ├──── (N) os_reunioes (criado_por)
                   │
                   ├──── (N) os_tasks (criado_por)
                   │
                   └──── (N) os_tasks (assignee_id)

os_teams (1) ──────┬──── (N) os_team_members
                   │
                   ├──── (N) os_reunioes
                   │
                   └──── (N) os_tasks

```

### Descrição dos Relacionamentos

1. **Usuários ↔ Times**
   - Um usuário pode ser membro de múltiplos times
   - Um time pode ter múltiplos membros
   - Relação N:N através da tabela `os_team_members`

2. **Usuários → Times (Ownership)**
   - Um usuário pode ser proprietário de múltiplos times
   - Cada time tem apenas um proprietário
   - Relação 1:N através de `os_teams.owner_id`

3. **Times → Reuniões**
   - Um time pode ter múltiplas reuniões
   - Cada reunião pertence a um time
   - Relação 1:N através de `os_reunioes.team_id`

4. **Usuários → Reuniões**
   - Um usuário pode criar múltiplas reuniões
   - Cada reunião tem um criador
   - Relação 1:N através de `os_reunioes.criado_por`

5. **Times → Tarefas**
   - Um time pode ter múltiplas tarefas
   - Cada tarefa pertence a um time
   - Relação 1:N através de `os_tasks.team_id`

6. **Usuários → Tarefas (Criador)**
   - Um usuário pode criar múltiplas tarefas
   - Cada tarefa tem um criador
   - Relação 1:N através de `os_tasks.criado_por`

7. **Usuários → Tarefas (Responsável)**
   - Um usuário pode ser responsável por múltiplas tarefas
   - Cada tarefa pode ter um responsável (opcional)
   - Relação 1:N através de `os_tasks.assignee_id`

---

## 🔐 Políticas de Segurança (RLS)

### Row Level Security (RLS)
As tabelas devem implementar políticas de segurança para garantir que:

1. **os_teams**
   - SELECT: Usuários podem ver apenas times dos quais são membros
   - INSERT: Qualquer usuário autenticado pode criar um time
   - UPDATE: Apenas owner e admins podem atualizar
   - DELETE: Apenas owner pode deletar

2. **os_team_members**
   - SELECT: Membros do time podem ver outros membros
   - INSERT: Owners e admins podem adicionar membros
   - UPDATE: Owners e admins podem atualizar roles
   - DELETE: Owners e admins podem remover membros

3. **os_users**
   - SELECT: Usuários podem ver informações básicas de outros usuários
   - UPDATE: Usuários podem atualizar apenas seu próprio perfil

4. **os_reunioes**
   - SELECT: Membros do time podem ver reuniões do time
   - INSERT: Membros do time podem criar reuniões
   - UPDATE: Criador e admins do time podem atualizar
   - DELETE: Criador e admins do time podem deletar

5. **os_tasks**
   - SELECT: Membros do time podem ver tarefas do time
   - INSERT: Membros do time podem criar tarefas
   - UPDATE: Criador, responsável e admins do time podem atualizar
   - DELETE: Criador e admins do time podem deletar

---

## 📝 Notas de Implementação

### Convenções
- Todos os IDs são UUIDs para garantir unicidade global
- Timestamps sempre incluem timezone
- Nomes de tabelas prefixados com `os_` para evitar conflitos
- Colunas em snake_case (padrão PostgreSQL)

### Índices Recomendados
```sql
-- Índices para performance
CREATE INDEX idx_team_members_team_id ON os_team_members(team_id);
CREATE INDEX idx_team_members_user_id ON os_team_members(user_id);
CREATE INDEX idx_teams_owner_id ON os_teams(owner_id);
CREATE INDEX idx_reunioes_team_id ON os_reunioes(team_id);
CREATE INDEX idx_reunioes_criado_por ON os_reunioes(criado_por);
CREATE INDEX idx_reunioes_data_reuniao ON os_reunioes(data_reuniao);
CREATE INDEX idx_tasks_team_id ON os_tasks(team_id);
CREATE INDEX idx_tasks_criado_por ON os_tasks(criado_por);
CREATE INDEX idx_tasks_assignee_id ON os_tasks(assignee_id);
CREATE INDEX idx_tasks_status ON os_tasks(status);
CREATE INDEX idx_tasks_prioridade ON os_tasks(prioridade);
CREATE INDEX idx_tasks_data_vencimento ON os_tasks(data_vencimento);
```

### Triggers Recomendados
```sql
-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_os_teams_updated_at BEFORE UPDATE ON os_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_os_users_updated_at BEFORE UPDATE ON os_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reunioes_updated_at BEFORE UPDATE ON os_reunioes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_os_tasks_updated_at BEFORE UPDATE ON os_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🚀 Expansões Futuras

### Possíveis Novas Tabelas
1. **os_projects** - Projetos dos times
2. **os_tasks** - Tarefas e atividades
3. **os_documents** - Documentos compartilhados
4. **os_comments** - Comentários em reuniões/projetos
5. **os_notifications** - Sistema de notificações
6. **os_audit_log** - Log de auditoria de ações

### Melhorias Sugeridas
1. Adicionar campo `avatar_color` em `os_teams` para personalização visual
2. Implementar soft delete com campo `deleted_at`
3. Adicionar campos de metadados JSON para extensibilidade
4. Implementar versionamento de documentos
5. Adicionar suporte a templates de reuniões

---

*Última atualização: Janeiro 2025*