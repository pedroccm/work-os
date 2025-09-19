-- ================================================================
-- TABELA OS_LOGS - Sistema de Logs/Diário dos Times
-- ================================================================
--
-- Esta tabela armazena os registros de logs/diário das atividades
-- dos times, funcionando como um histórico cronológico de eventos,
-- decisões, problemas e soluções.
--
-- Autor: Sistema Work OS
-- Data: 2025-01-19
-- ================================================================

-- Criar tabela os_logs
CREATE TABLE os_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo character varying NOT NULL,
    conteudo text NOT NULL,
    data_log date NOT NULL,
    hora_log time without time zone NOT NULL,
    tags text,
    team_id uuid NOT NULL REFERENCES os_teams(id) ON DELETE CASCADE,
    criado_por uuid NOT NULL REFERENCES os_users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ================================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================================

-- Índice para busca por time
CREATE INDEX idx_logs_team_id ON os_logs(team_id);

-- Índice para busca por autor
CREATE INDEX idx_logs_criado_por ON os_logs(criado_por);

-- Índice para busca por data (ordenação cronológica)
CREATE INDEX idx_logs_data_log ON os_logs(data_log);

-- Índice para busca por data e hora combinadas
CREATE INDEX idx_logs_data_hora ON os_logs(data_log, hora_log);

-- Índices de busca textual (full-text search)
CREATE INDEX idx_logs_tags_fts ON os_logs USING gin(to_tsvector('portuguese', tags));
CREATE INDEX idx_logs_titulo_fts ON os_logs USING gin(to_tsvector('portuguese', titulo));
CREATE INDEX idx_logs_conteudo_fts ON os_logs USING gin(to_tsvector('portuguese', conteudo));

-- Índice composto para busca completa
CREATE INDEX idx_logs_search_composite ON os_logs USING gin(
    to_tsvector('portuguese', titulo || ' ' || conteudo || ' ' || COALESCE(tags, ''))
);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Trigger para atualizar updated_at automaticamente
-- (Assume que a função update_updated_at_column() já existe)
CREATE TRIGGER update_os_logs_updated_at
    BEFORE UPDATE ON os_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- CONSTRAINTS E VALIDAÇÕES
-- ================================================================

-- Constraint para garantir que data_log não seja futura demais (opcional)
-- ALTER TABLE os_logs ADD CONSTRAINT chk_logs_data_reasonable
--     CHECK (data_log <= CURRENT_DATE + INTERVAL '1 day');

-- Constraint para garantir que titulo não seja vazio
ALTER TABLE os_logs ADD CONSTRAINT chk_logs_titulo_not_empty
    CHECK (length(trim(titulo)) > 0);

-- Constraint para garantir que conteudo não seja vazio
ALTER TABLE os_logs ADD CONSTRAINT chk_logs_conteudo_not_empty
    CHECK (length(trim(conteudo)) > 0);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) - Descomente se necessário
-- ================================================================

-- Habilitar RLS na tabela
-- ALTER TABLE os_logs ENABLE ROW LEVEL SECURITY;

-- Política: Membros do time podem ver logs do time
-- CREATE POLICY "Membros podem ver logs do time" ON os_logs
--     FOR SELECT USING (
--         team_id IN (
--             SELECT team_id FROM os_team_members
--             WHERE user_id = auth.uid()
--         )
--     );

-- Política: Membros do time podem criar logs
-- CREATE POLICY "Membros podem criar logs" ON os_logs
--     FOR INSERT WITH CHECK (
--         team_id IN (
--             SELECT team_id FROM os_team_members
--             WHERE user_id = auth.uid()
--         )
--         AND criado_por = auth.uid()
--     );

-- Política: Criador pode atualizar seus próprios logs
-- CREATE POLICY "Criador pode atualizar logs" ON os_logs
--     FOR UPDATE USING (criado_por = auth.uid());

-- Política: Criador pode deletar seus próprios logs
-- CREATE POLICY "Criador pode deletar logs" ON os_logs
--     FOR DELETE USING (criado_por = auth.uid());

-- ================================================================
-- COMENTÁRIOS DA TABELA
-- ================================================================

COMMENT ON TABLE os_logs IS 'Registros de logs/diário das atividades dos times - Histórico cronológico de eventos, decisões e atividades';

COMMENT ON COLUMN os_logs.id IS 'Identificador único do log (UUID)';
COMMENT ON COLUMN os_logs.titulo IS 'Título descritivo e resumido do log';
COMMENT ON COLUMN os_logs.conteudo IS 'Conteúdo detalhado do que aconteceu - eventos, decisões, problemas, soluções';
COMMENT ON COLUMN os_logs.data_log IS 'Data em que o evento/atividade ocorreu';
COMMENT ON COLUMN os_logs.hora_log IS 'Hora em que o evento/atividade ocorreu';
COMMENT ON COLUMN os_logs.tags IS 'Tags para categorização e busca, separadas por vírgula (ex: deploy, bug, reunião, planejamento)';
COMMENT ON COLUMN os_logs.team_id IS 'ID do time ao qual o log pertence (FK para os_teams)';
COMMENT ON COLUMN os_logs.criado_por IS 'ID do usuário que criou o log (FK para os_users)';
COMMENT ON COLUMN os_logs.created_at IS 'Timestamp de quando o registro foi criado no sistema';
COMMENT ON COLUMN os_logs.updated_at IS 'Timestamp da última atualização do registro';

-- ================================================================
-- DADOS DE EXEMPLO (Opcional - para testes)
-- ================================================================

-- Descomente as linhas abaixo se quiser inserir dados de exemplo
-- (Substitua os UUIDs pelos IDs reais do seu sistema)

/*
INSERT INTO os_logs (titulo, conteudo, data_log, hora_log, tags, team_id, criado_por) VALUES
(
    'Deploy da versão 2.1.0 em produção',
    'Realizado deploy da nova versão com sucesso. Incluídas as seguintes funcionalidades: sistema de logs, melhorias na interface de reuniões, correções de bugs no sistema de teams. Monitoramento ativo por 2 horas após deploy. Nenhum problema identificado.',
    CURRENT_DATE,
    '14:30:00',
    'deploy, produção, versão, sucesso',
    'seu-team-id-aqui',
    'seu-user-id-aqui'
),
(
    'Reunião de planejamento da Sprint 15',
    'Reunião realizada com toda a equipe para definir as tarefas da próxima sprint. Decidido focar em: implementação do sistema de notificações, melhorias de performance no dashboard, testes automatizados para o módulo de logs. Estimativa total: 40 story points.',
    CURRENT_DATE - 1,
    '09:00:00',
    'reunião, planejamento, sprint, estimativa',
    'seu-team-id-aqui',
    'seu-user-id-aqui'
),
(
    'Correção crítica no sistema de autenticação',
    'Identificado e corrigido bug crítico que impedia login de alguns usuários. Problema estava relacionado à validação de tokens JWT. Solução implementada e testada. Afetou aproximadamente 5% dos usuários por 2 horas.',
    CURRENT_DATE - 2,
    '16:45:00',
    'bug, crítico, autenticação, correção, jwt',
    'seu-team-id-aqui',
    'seu-user-id-aqui'
);
*/

-- ================================================================
-- VERIFICAÇÃO DE INSTALAÇÃO
-- ================================================================

-- Query para verificar se a tabela foi criada corretamente
-- SELECT
--     column_name,
--     data_type,
--     is_nullable,
--     column_default
-- FROM information_schema.columns
-- WHERE table_name = 'os_logs'
-- ORDER BY ordinal_position;

-- Query para verificar os índices criados
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'os_logs';

-- ================================================================
-- FIM DO ARQUIVO
-- ================================================================