import type { GetServerSidePropsContext } from 'next'
import type { inferAsyncReturnType } from '@trpc/server'

import Image from 'next/future/image'
import { FaGithub } from 'react-icons/fa'
import { getProviders, signIn, useSession } from 'next-auth/react'

import { getServerSession } from '$server/helpers/get-server-session'

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
              onClick={() => signIn(provider.id)}
              className="flex items-center gap-4 rounded bg-gray-200 px-6 py-2 text-xl text-black"
            >
              {provider.id === 'github' && <FaGithub />}
              <span>Continue with {provider.name}</span>
            </button>
          ))}
      </main>
    )

  return (
    <main className="flex flex-col">
      <div className="flex items-center justify-between bg-gray-800 py-4 px-8 shadow">
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
        {/* <NavButtons userId={data.user?.id!} /> */}
      </div>
      {/* <LazyQuestionsView /> */}
    </main>
  )
}

export default function HomePage({ providers }: HomePageProps) {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <HomeContents providers={providers} />

      <div className="flex justify-between bg-black/40 py-4 px-8 font-mono">
        <span>
          Quickly created by{' '}
          <a href="https://github.com/zzacong" className="text-blue-100">
            Zac
          </a>{' '}
          <span className="text-sm">
            (Forked from{' '}
            <a
              href="https://github.com/theobr/zapdos"
              className="text-blue-100"
            >
              Theo&apos;s repo
            </a>
            )
          </span>
        </span>

        <a
          href="https://github.com/zzacong/spritzee-pusher-nextjs"
          title="GitHub repository"
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
      session: await getServerSession(ctx),
      providers: await getProviders(),
    },
  }
}

type HomePageProps = {
  providers: inferAsyncReturnType<typeof getProviders>
}
