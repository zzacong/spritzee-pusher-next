import type { GetServerSidePropsContext } from 'next'
import type { inferAsyncReturnType } from '@trpc/server'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { FaGithub, FaCopy, FaSignOutAlt } from 'react-icons/fa'
import { getProviders, signIn, signOut, useSession } from 'next-auth/react'
import copy from 'copy-to-clipboard'

import { getServerAuthSession } from '$server/auth'

const LazyQuestionsView = dynamic(() => import('$components/QuestionsView'), {
  ssr: false,
})
const LazyConnectedCounter = dynamic(
  () => import('$components/ConnectedCounter'),
  {
    ssr: false,
  }
)

const NavButtons = ({ userId }: { userId: string }) => {
  const { data: sess } = useSession()

  return (
    <div className="flex gap-4">
      <button
        onClick={() => copy(`${window.location.origin}/embed/${userId}`)}
        className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-100"
      >
        Copy embed url <FaCopy size={16} />
      </button>
      <button
        onClick={() =>
          sess?.user.name &&
          copy(`${window.location.origin}/ask/${sess.user.name.toLowerCase()}`)
        }
        className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-100"
      >
        Copy Q&A url <FaCopy size={16} />
      </button>
      <button
        onClick={() => void signOut()}
        className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-100"
      >
        Logout <FaSignOutAlt size={16} />
      </button>
    </div>
  )
}

const HomeContents = ({ providers }: Pick<HomePageProps, 'providers'>) => {
  const { data } = useSession()

  if (!data)
    return (
      <main className="flex grow flex-col items-center justify-center gap-6">
        <div className="font-mono text-2xl font-bold">Please log in below</div>
        {providers &&
          Object.values(providers).map(provider => (
            <button
              key={provider.name}
              onClick={() => void signIn(provider.id)}
              className="flex items-center gap-4 rounded bg-white px-6 py-2 text-black hover:bg-gray-100"
            >
              {provider.id === 'github' && <FaGithub size={24} />}
              <span className="text-xl">Continue with {provider.name}</span>
            </button>
          ))}
      </main>
    )

  return (
    <main className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-800 px-8 py-4 shadow">
        <div className="flex items-center gap-8">
          <h1 className="flex items-center gap-4 text-2xl font-bold">
            {data.user?.image && (
              <Image
                src={data.user.image}
                alt="pro pic"
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            {data.user?.name}
          </h1>
          <LazyConnectedCounter />
        </div>
        <NavButtons userId={data.user.uid} />
      </div>
      <LazyQuestionsView />
    </main>
  )
}

export default function HomePage({ providers }: HomePageProps) {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <HomeContents providers={providers} />

      <div className="flex justify-between bg-black/40 px-8 py-4 font-mono">
        <span>
          Quickly created by{' '}
          <a
            href="https://github.com/zzacong"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-100"
          >
            Zac
          </a>{' '}
          <span className="text-sm">
            (Forked from{' '}
            <a
              href="https://github.com/theobr/zapdos"
              className="text-blue-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              Theo&apos;s repo
            </a>
            )
          </span>
        </span>

        <a
          href="https://github.com/zzacong/spritzee-pusher-nextjs"
          title="GitHub repository"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">GitHub</span>
          <FaGithub size={24} />
        </a>
      </div>
    </div>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {
      session: await getServerAuthSession(ctx),
      providers: await getProviders(),
    },
  }
}

type HomePageProps = {
  providers: inferAsyncReturnType<typeof getProviders>
}
