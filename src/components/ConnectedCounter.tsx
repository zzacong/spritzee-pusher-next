import { PusherProvider, useCurrentMemberCount } from '$lib/pusher'
import { useSession } from 'next-auth/react'

const ConnectedCounter = () => {
  const connectionCount = useCurrentMemberCount() - 1

  if (connectionCount <= 0) return null
  return (
    <span className="rounded bg-green-500 py-1 px-3 font-mono text-xs text-gray-900">
      <span className="font-bold">{connectionCount}</span> connected
    </span>
  )
}

export default function ConnectedCounterWrapper() {
  const { data: sess } = useSession()

  if (!sess || !sess.user?.uid) return null

  return (
    <PusherProvider slug={`user-${sess.user?.uid}`}>
      <ConnectedCounter />
    </PusherProvider>
  )
}
