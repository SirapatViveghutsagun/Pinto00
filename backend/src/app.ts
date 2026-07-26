import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { createContainer } from './di/container'
import { createUserRouter } from './routers/user-router'
import { createTransactionRouter } from './routers/transaction-router'
import { AppError } from './domain/errors'

type Env = {
  DB: D1Database
  KV: KVNamespace
  ENVIRONMENT?: string
}

export function createApp() {
  const app = new Hono<{ Bindings: Env }>()

  // Global middleware
  app.use('*', logger())
  app.use('*', cors({
    origin: ['https://pinto00.pages.dev', 'https://*.pinto00.pages.dev', 'http://localhost:5173', 'http://localhost:4173'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
  }))

  // Inject DI container into context
  app.use('*', async (c, next) => {
    const container = createContainer(c.env as Env)
    c.set('container', container)
    await next()
  })

  // Health check
  app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

  // API routes
  app.route('/api/v1/users', createUserRouter())
  app.route('/api/v1/transactions', createTransactionRouter())

  // OpenAPI docs placeholder
  app.get('/openapi.json', (c) => c.json({
    openapi: '3.0.3',
    info: { title: 'Pinto00 API', version: '1.0.0', description: 'Personal finance tracker API' },
    paths: {}
  }))

  // Error handler
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ error: { code: err.code, message: err.message } }, err.status as 400)
    }
    console.error('Unhandled error:', err)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500)
  })

  return app
}

export default createApp()
