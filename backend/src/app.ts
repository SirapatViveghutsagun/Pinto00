import { Hono } from 'hono'
import { createContainer, type Container } from './di/container'
import { createUserRouter } from './routers/user-router'
import { createTransactionRouter } from './routers/transaction-router'

type Env = {
  DB: D1Database
  KV: KVNamespace
  ENVIRONMENT?: string
}

export function createApp() {
  const app = new Hono<{ Bindings: Env }>()

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

  return app
}

export default createApp()
