import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { createRouter } from '$server/router/context'
import { pusherServerClient } from '$server/helpers/pusher'

export const questionRouter = createRouter()
  .mutation('submit', {
    input: z.object({
      userId: z.string(),
      question: z.string().min(0).max(400),
    }),
    resolve: async ({ ctx, input }) => {
      const question = await ctx.prisma.question.create({
        data: {
          userId: input.userId,
          body: input.question,
        },
      })

      await pusherServerClient.trigger(
        `user-${input.userId}`,
        'new-question',
        {}
      )

      return question
    },
  })
  .middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({
      ctx: {
        ...ctx,
        // infers that `session` is non-nullable to downstream resolvers
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })
  .query('getAll', {
    resolve: async ({ ctx }) => {
      const questions = await ctx.prisma.question.findMany({
        where: {
          userId: ctx.session.user.id,
          status: 'PENDING',
        },
        orderBy: { id: 'desc' },
      })

      return questions
    },
  })
  .mutation('pin', {
    input: z.object({ questionId: z.string() }),
    resolve: async ({ ctx, input }) => {
      const question = await ctx.prisma.question.findFirst({
        where: { id: input.questionId },
      })
      if (!question || question.userId !== ctx.session.user.id) {
        throw new TRPCError({
          message: 'NOT YOUR QUESTION',
          code: 'UNAUTHORIZED',
        })
      }

      await pusherServerClient.trigger(
        `user-${question.userId}`,
        'question-pinned',
        {
          question: question.body,
        }
      )
      return question
    },
  })
  .mutation('archive', {
    input: z.object({ questionId: z.string() }),

    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.question.updateMany({
        where: { id: input.questionId, userId: ctx.session.user.id },
        data: {
          status: 'ANSWERED',
        },
      })
    },
  })
  .mutation('unpin', {
    resolve: async ({ ctx }) => {
      await pusherServerClient.trigger(
        `user-${ctx.session.user?.id}`,
        'question-unpinned',
        {}
      )
    },
  })
