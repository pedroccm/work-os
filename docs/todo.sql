-- =========================================
-- CRIAÇÃO DA TABELA OS_TASKS (TO-DO)
-- =========================================

-- Criação da tabela os_tasks
CREATE TABLE os_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo character varying NOT NULL,
  descricao text,
  status character varying DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  prioridade character varying DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
  team_id uuid NOT NULL REFERENCES os_teams(id) ON DELETE CASCADE,
  criado_por uuid NOT NULL REFERENCES os_users(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES os_users(id) ON DELETE SET NULL,
  data_vencimento date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================

-- Índices principais
CREATE INDEX idx_tasks_team_id ON os_tasks(team_id);
CREATE INDEX idx_tasks_criado_por ON os_tasks(criado_por);
CREATE INDEX idx_tasks_assignee_id ON os_tasks(assignee_id);

-- Índices para filtros
CREATE INDEX idx_tasks_status ON os_tasks(status);
CREATE INDEX idx_tasks_prioridade ON os_tasks(prioridade);
CREATE INDEX idx_tasks_data_vencimento ON os_tasks(data_vencimento);

-- Índice composto para consultas por time e status (otimização Kanban)
CREATE INDEX idx_tasks_team_status ON os_tasks(team_id, status);

-- Índice para ordenação por data de criação
CREATE INDEX idx_tasks_created_at ON os_tasks(created_at DESC);

-- =========================================
-- TRIGGERS PARA UPDATED_AT
-- =========================================

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_os_tasks_updated_at
    BEFORE UPDATE ON os_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =========================================

-- Comentários na tabela
COMMENT ON TABLE os_tasks IS 'Tabela de tarefas/to-dos dos times';

-- Comentários nas colunas
COMMENT ON COLUMN os_tasks.id IS 'Identificador único da tarefa';
COMMENT ON COLUMN os_tasks.titulo IS 'Título da tarefa (obrigatório)';
COMMENT ON COLUMN os_tasks.descricao IS 'Descrição detalhada da tarefa (opcional)';
COMMENT ON COLUMN os_tasks.status IS 'Status da tarefa: todo (a fazer), doing (fazendo), done (concluído)';
COMMENT ON COLUMN os_tasks.prioridade IS 'Prioridade da tarefa: baixa, media (padrão), alta';
COMMENT ON COLUMN os_tasks.team_id IS 'ID do time responsável pela tarefa';
COMMENT ON COLUMN os_tasks.criado_por IS 'ID do usuário que criou a tarefa';
COMMENT ON COLUMN os_tasks.assignee_id IS 'ID do usuário responsável pela tarefa (opcional)';
COMMENT ON COLUMN os_tasks.data_vencimento IS 'Data de vencimento da tarefa (opcional)';
COMMENT ON COLUMN os_tasks.created_at IS 'Data e hora de criação da tarefa';
COMMENT ON COLUMN os_tasks.updated_at IS 'Data e hora da última atualização da tarefa';

-- =========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =========================================

-- Inserir algumas tarefas de exemplo (descomente se necessário)
/*
-- Exemplo de tarefas para teste
INSERT INTO os_tasks (titulo, descricao, status, prioridade, team_id, criado_por) VALUES
('Configurar ambiente de desenvolvimento', 'Instalar todas as dependências e configurar o ambiente local', 'todo', 'alta', 'UUID_DO_TEAM', 'UUID_DO_USER'),
('Revisar código da feature X', 'Fazer code review da nova funcionalidade', 'doing', 'media', 'UUID_DO_TEAM', 'UUID_DO_USER'),
('Atualizar documentação', 'Documentar as novas APIs criadas', 'done', 'baixa', 'UUID_DO_TEAM', 'UUID_DO_USER');
*/

-- =========================================
-- CONSULTAS ÚTEIS PARA VERIFICAÇÃO
-- =========================================

-- Verificar se a tabela foi criada corretamente
-- SELECT table_name, column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'os_tasks'
-- ORDER BY ordinal_position;

-- Verificar constraints
-- SELECT conname, contype, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'os_tasks'::regclass;

-- Verificar índices
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'os_tasks';

-- Verificar triggers
-- SELECT tgname, tgtype, tgenabled
-- FROM pg_trigger
-- WHERE tgrelid = 'os_tasks'::regclass;

-- =========================================
-- POLÍTICAS RLS (PARA IMPLEMENTAR)
-- =========================================

-- Habilitar RLS na tabela
-- ALTER TABLE os_tasks ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários podem ver tarefas dos times que pertencem
/*
CREATE POLICY "Users can view tasks from their teams" ON os_tasks
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM os_team_members
            WHERE user_id = auth.uid()
        )
    );
*/

-- Política para INSERT: usuários podem criar tarefas nos times que pertencem
/*
CREATE POLICY "Users can create tasks in their teams" ON os_tasks
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM os_team_members
            WHERE user_id = auth.uid()
        )
    );
*/

-- Política para UPDATE: criador, responsável ou admins podem atualizar
/*
CREATE POLICY "Users can update their tasks or assigned tasks" ON os_tasks
    FOR UPDATE USING (
        criado_por = auth.uid() OR
        assignee_id = auth.uid() OR
        team_id IN (
            SELECT team_id FROM os_team_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
*/

-- Política para DELETE: apenas criador ou admins podem deletar
/*
CREATE POLICY "Users can delete their tasks or admins can delete" ON os_tasks
    FOR DELETE USING (
        criado_por = auth.uid() OR
        team_id IN (
            SELECT team_id FROM os_team_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
*/

-- =========================================
-- FINALIZAÇÃO
-- =========================================

-- Verificação final
SELECT 'Tabela os_tasks criada com sucesso!' as status;