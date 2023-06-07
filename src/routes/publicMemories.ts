import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function publicMemories(app: FastifyInstance) {
  app.get('/memories/public', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    const publicMemory = memories.map(async (memory) => {
      const autor = await prisma.user.findUnique({
        where: {
          id: memory.userId,
        },
      })

      let autorName

      if (!autor) {
        autorName = {
          name: 'Anônimo',
          autorUrl: '',
        }
      } else
        autorName = {
          name: autor.name,
          html_url: autor.html_url,
        }

      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
        memoryDate: memory.memoryDate,
        autor: autorName,
      }
    })
    return Promise.all(publicMemory)
  })
}
