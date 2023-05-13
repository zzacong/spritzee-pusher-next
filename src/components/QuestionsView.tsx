import type { PropsWithChildren } from 'react'

import { FaArchive } from 'react-icons/fa'
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs'
import { useSession } from 'next-auth/react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { formatDistanceToNow } from 'date-fns'

import { PusherProvider, useSubscribeToEvent } from '$lib/pusher'
import { api } from '$lib/trpc'

const QuestionsView = () => {
  const { data, isLoading, refetch } = api.question.getAll.useQuery()

  // Refetch when new questions come through
  useSubscribeToEvent('new-question', () => void refetch())

  // Question pinning mutation
  const {
    mutate: pinQuestion,
    variables: currentlyPinned, // The "variables" passed are the currently pinned Q
    reset: resetPinnedQuestionMutation, // The reset allows for "unpinning" on client
  } = api.question.pin.useMutation()
  const pinnedId = currentlyPinned?.questionId

  const { mutate: unpinQuestion } = api.question.unpin.useMutation({
    onMutate: () => {
      resetPinnedQuestionMutation() // Reset variables from mutation to "unpin"
    },
  })

  const tctx = api.useContext()
  const { mutate: removeQuestion } = api.question.archive.useMutation({
    onMutate: ({ questionId }) => {
      // Optimistic update
      tctx.question.getAll.setData(
        undefined,
        data?.filter(q => q.id !== questionId)
      )
      // Unpin if this one was pinned
      if (questionId === pinnedId) unpinQuestion()
    },
  })

  if (isLoading)
    return (
      <div className="animate-fade-in-delay flex justify-center p-8">
        <div role="status">
          <svg
            aria-hidden="true"
            className="mr-2 inline h-52 w-52 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )

  return (
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
                <button title="Unpin question" onClick={() => unpinQuestion()}>
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
