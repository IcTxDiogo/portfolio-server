import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
        memoryDate: memory.memoryDate,
      }
    })
  })

  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
    if (!memory.isPublic && memory.userId !== request.user.sub) {
      reply.status(403).send()
      return
    }

    return {
      id: memory.id,
      content: memory.content,
      coverUrl: memory.coverUrl,
      memoryDate: memory.memoryDate,
    }
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      memoryDate: z.string(),
    })
    const { content, coverUrl, isPublic, memoryDate } = bodySchema.parse(
      request.body,
    )

    let memory
    try {
      memory = await prisma.memory.create({
        data: {
          content,
          coverUrl,
          isPublic,
          memoryDate,
          userId: request.user.sub,
        },
      })
    } catch (error) {
      console.log(error)
    }
    return memory
  })

  app.put('/memories/:id', async (request, reply) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      memoryDate: z.date(),
    })
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    const { content, coverUrl, isPublic, memoryDate } = bodySchema.parse(
      request.body,
    )
    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
    if (memory.userId !== request.user.sub) {
      reply.status(403).send()
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
        memoryDate,
      },
    })
    return memory
  })

  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
    if (memory.userId !== request.user.sub) {
      reply.status(403).send()
    }
    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
