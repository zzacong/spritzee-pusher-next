import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from '$server/helpers/get-server-session'
import { trpc } from '$lib/trpc'

export default function HomePage() {
  return <div>Home</div>
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {
      session: await getServerSession(ctx),
    },
  }
}
