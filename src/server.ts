import 'dotenv/config'

import fastify from 'fastify'

import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'

const app = fastify()

app.register(multipart)

app.register(cors, {
  origin: true,
})

const secret = process.env.JWT_SECRET ?? 'secret'

app.register(jwt, {
  secret,
})

app.register(authRoutes)
app.register(memoriesRoutes)

const port = process.env.PORT || 3333
const host = process.env.HOST || '0.0.0.0'

app
  .listen({
    port: Number(port),
    host,
  })
  .then(() => {
    console.log(`Server is running on http://${host}:${port}`)
  })
  .catch((error) => {
    console.error('Error starting the server:', error)
    process.exit(1)
  })
