import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import ClientApp from '../client-app'
import { auth } from '../../src/lib/auth'
import { loadCoreData } from '../../src/lib/actions/core'

const PUBLIC_PATHS = new Set(['/', '/login', '/sign-up'])

export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  const pathname = `/${path.join('/')}`

  let initialData = null
  if (!PUBLIC_PATHS.has(pathname)) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) redirect('/login')
    initialData = await loadCoreData()
  }

  return <ClientApp initialData={initialData} />
}
