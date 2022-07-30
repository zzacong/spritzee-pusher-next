import type { PropsWithChildren } from 'react'

import Image from 'next/future/image'
import { FaArchive } from 'react-icons/fa'
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs'
import { useSession } from 'next-auth/react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { formatDistanceToNow } from 'date-fns'

import { trpc } from '$lib/trpc'
import {
  PusherProvider,
  useCurrentMemberCount,
  useSubscribeToEvent,
} from '$lib/pusher'
import LoadingSVG from '$assets/puff.svg'

const QuestionsView = () => {
  const { data, isLoading, refetch } = trpc.useQuery(['questions.getAll'])

  // Refetch when new questions come through
  useSubscribeToEvent('new-question', () => refetch())

  const connectionCount = useCurrentMemberCount() - 1

  // Question pinning mutation
  const {
    mutate: pinQuestion,
    variables: currentlyPinned, // The "variables" passed are the currently pinned Q
    reset: resetPinnedQuestionMutation, // The reset allows for "unpinning" on client
  } = trpc.useMutation('questions.pin')
  const pinnedId = currentlyPinned?.questionId

  const { mutate: unpinQuestion } = trpc.useMutation('questions.unpin', {
    onMutate: () => {
      resetPinnedQuestionMutation() // Reset variables from mutation to "unpin"
    },
  })

  const tctx = trpc.useContext()
  const { mutate: removeQuestion } = trpc.useMutation('questions.archive', {
    onMutate: ({ questionId }) => {
      // Optimistic update
      tctx.queryClient.setQueryData(
        ['questions.getAll'],
        data?.filter(q => q.id !== questionId)
      )

      // Unpin if this one was pinned
      if (questionId === pinnedId) unpinQuestion()
    },
  })

  if (isLoading)
    return (
      <div className="animate-fade-in-delay flex justify-center p-8">
        <Image
          src={LoadingSVG}
          alt="loading..."
          width={200}
          height={200}
          priority
        />
      </div>
    )

  return (
    <>
      <div>
        {connectionCount > 0 && (
          <span>Currently connected: {connectionCount}</span>
        )}
      </div>

      <AnimatedQuestionsWrapper className="flex flex-wrap justify-center gap-4 p-8">
        {data?.map(q => (
          <div
            key={q.id}
            className="animate-fade-in-down flex h-52 w-96 flex-col rounded border border-gray-500 bg-gray-600 shadow-xl"
          >
            <div className="flex justify-between border-b border-gray-500 p-4">
              {formatDistanceToNow(q.createdAt, { addSuffix: true })}
              <div className="flex gap-4">
                {pinnedId === q.id && (
                  <button
                    title="Unpin question"
                    onClick={() => unpinQuestion()}
                  >
                    <BsPinAngleFill size={24} />
                  </button>
                )}
                {pinnedId !== q.id && (
                  <button
                    title="Pin question"
                    onClick={() => pinQuestion({ questionId: q.id })}
                  >
                    <BsPinAngle size={24} />
                  </button>
                )}
                <button
                  title="Archive question"
                  onClick={() => removeQuestion({ questionId: q.id })}
                >
                  <FaArchive size={24} />
                </button>
              </div>
            </div>
            <div className="p-4">{q.body}</div>
          </div>
        ))}
      </AnimatedQuestionsWrapper>
    </>
  )
}

export default function QuestionsViewWrapper() {
  const { data: sess } = useSession()

  if (!sess || !sess.user?.uid) return null

  return (
    <PusherProvider slug={`user-${sess.user?.uid}`}>
      <QuestionsView />
    </PusherProvider>
  )
}

const AnimatedQuestionsWrapper = (
  props: PropsWithChildren<{ className: string }>
) => {
  const [parent] = useAutoAnimate<HTMLDivElement>()

  return (
    <div ref={parent} className={props.className}>
      {props.children}
    </div>
  )
}
