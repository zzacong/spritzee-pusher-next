import { useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { PusherProvider, useSubscribeToEvent } from '$lib/pusher'

const useLatestPusherMessage = () => {
  const [latestMessage, setLatestMessage] = useState<string | null>(null)

  useSubscribeToEvent('question-pinned', (data: { question: string }) =>
    setLatestMessage(data.question)
  )
  useSubscribeToEvent('question-unpinned', () => setLatestMessage(null))

  return latestMessage
}

const BrowserEmbedViewCore = () => {
  const latestMessage = useLatestPusherMessage()

  if (!latestMessage) return null

  return (
    <div className="flex h-screen items-center justify-center p-8">
      <div className="w-full max-w-4xl rounded border-2 bg-gray-900/70 p-8 text-center text-2xl text-white shadow">
        {latestMessage}
      </div>
    </div>
  )
}

const BrowserEmbedView = ({ userId }: { userId: string }) => {
  return (
    <PusherProvider slug={`user-${userId}`}>
      <BrowserEmbedViewCore />
    </PusherProvider>
  )
}

const LazyEmbedView = dynamic(() => Promise.resolve(BrowserEmbedView), {
  ssr: false,
})

export default function BrowserEmbedQuestionView() {
  const { query } = useRouter()
  if (!query.uid || typeof query.uid !== 'string') {
    return null
  }

  return <LazyEmbedView userId={query.uid} />
}
