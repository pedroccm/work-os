import { createFileRoute } from '@tanstack/react-router'
import DocsVersionTest from '@/features/supabase-test/docs-version'

export const Route = createFileRoute('/_authenticated/supabase-test/')({
  component: DocsVersionTest,
})