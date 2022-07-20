import superjson from 'superjson'

import { createRouter } from './context'
import { exampleRouter } from './example'
import { authRouter } from './auth'

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('example.', exampleRouter)
  .merge('auth.', authRouter)

// export type definition of API
export type AppRouter = typeof appRouter
