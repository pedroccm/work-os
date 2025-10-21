-- Adiciona coluna 'resumo' na tabela os_meetings
-- Migration: Add resumo field to meetings table

ALTER TABLE os_meetings
ADD COLUMN resumo text;

-- Comentário na coluna
COMMENT ON COLUMN os_meetings.resumo IS 'Resumo da reunião';
