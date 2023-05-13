import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '$server/api/trpc'
import { pusherServerClient } from '$server/pusher'

export const questionRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        question: z.string().min(0).max(400),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const questions = await ctx.prisma.question.findMany({
      where: {
        userId: ctx.session.user.uid,
        status: 'PENDING',
      },
      orderBy: { id: 'desc' },
    })

    return questions
  }),

  pin: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.prisma.question.findFirst({
        where: { id: input.questionId },
      })
      if (!question || question.userId !== ctx.session.user.uid) {
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
    }),

  archive: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.question.updateMany({
        where: { id: input.questionId, userId: ctx.session.user.uid },
        data: {
          status: 'ANSWERED',
        },
      })
    }),

  unpin: protectedProcedure.mutation(async ({ ctx }) => {
    await pusherServerClient.trigger(
      `user-${ctx.session.user.uid}`,
      'question-unpinned',
      {}
    )
  }),
})
