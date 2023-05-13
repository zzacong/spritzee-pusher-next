import type { FormEventHandler } from 'react'
import type { GetStaticProps } from 'next'
import type { User } from '@prisma/client'

import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'

import { prisma } from '$server/db'
import { api } from '$lib/trpc'

export default function AskForm(props: { user: User }) {
  if (!props.user) throw new Error('user exists Next, sorry')
  const { mutate } = api.question.submit.useMutation()
  const [question, setQuestion] = useState('')

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault()
    if (!question) return
    mutate({ userId: props.user.id, question })
    setQuestion('')
  }

  return (
    <>
      <Head>
        <title>{`Ask ${props.user.name ?? '<no name>'} a question!`}</title>
      </Head>

      <div className="flex flex-col items-center pt-28 text-center">
        <div className="relative flex w-full max-w-lg flex-col items-center rounded border border-gray-500 bg-gray-600 p-8 pt-20">
          {props.user.image && (
            <Image
              src={props.user.image}
              alt="User profile pic"
              width={112}
              height={112}
              className="absolute -top-14 rounded-full border-4 border-gray-500"
            />
          )}

          <h1 className="mb-8 text-2xl font-bold">
            Ask {props.user?.name} a question!
          </h1>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
            <input
              placeholder="Type something..."
              className="w-full rounded px-4 py-2 text-start text-lg text-gray-800"
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <button
              type="submit"
              className="rounded bg-white px-4 py-2 text-center font-bold text-gray-800 hover:bg-gray-100"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.username || typeof params.username !== 'string') {
    return {
      notFound: true,
    }
  }

  const userInfo = await prisma.user.findFirst({
    where: {
      name: {
        equals: params.username.toLowerCase(),
        mode: 'insensitive',
      },
    },
  })

  if (!userInfo) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      user: userInfo,
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  return Promise.resolve({ paths: [], fallback: 'blocking' })
}
