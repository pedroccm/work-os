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

-- Índices para performance
CREATE INDEX idx_tasks_team_id ON os_tasks(team_id);
CREATE INDEX idx_tasks_criado_por ON os_tasks(criado_por);
CREATE INDEX idx_tasks_assignee_id ON os_tasks(assignee_id);
CREATE INDEX idx_tasks_status ON os_tasks(status);
CREATE INDEX idx_tasks_prioridade ON os_tasks(prioridade);
CREATE INDEX idx_tasks_data_vencimento ON os_tasks(data_vencimento);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_os_tasks_updated_at
    BEFORE UPDATE ON os_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE os_tasks IS 'Tabela de tarefas/to-dos dos times';
COMMENT ON COLUMN os_tasks.titulo IS 'Título da tarefa';
COMMENT ON COLUMN os_tasks.descricao IS 'Descrição detalhada da tarefa';
COMMENT ON COLUMN os_tasks.status IS 'Status da tarefa: todo, doing ou done';
COMMENT ON COLUMN os_tasks.prioridade IS 'Prioridade da tarefa: baixa, media ou alta';
COMMENT ON COLUMN os_tasks.team_id IS 'ID do time responsável pela tarefa';
COMMENT ON COLUMN os_tasks.criado_por IS 'ID do usuário que criou a tarefa';
COMMENT ON COLUMN os_tasks.assignee_id IS 'ID do usuário responsável pela tarefa';
COMMENT ON COLUMN os_tasks.data_vencimento IS 'Data de vencimento da tarefa';