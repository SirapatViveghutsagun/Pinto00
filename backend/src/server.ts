import { Hono } from 'hono'
import { apiReference } from '@scalar/hono-api-reference'
import { generateSpecs as openAPISpecs } from 'hono-openapi'
import { createContainer } from './di/container'
import { mountRouters } from './routers'

type Env = {
  DB: D1Database
  KV: KVNamespace
  ENVIRONMENT?: string
}

const app = new Hono<{ Bindings: Env }>()

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// OpenAPI docs
app.get(
  '/openapi.json',
  openAPISpecs(app, {
    info: {
      title: 'Pinto00 API',
      version: '0.1.0',
      description: 'Personal finance tracker API — income & expense management',
    },
  })
)

app.get(
  '/docs',
  apiReference({
    spec: { url: '/openapi.json' },
  })
)

// Mount routes with DI container
app.use('*', async (c, next) => {
  const container = createContainer(c.env as Env)
  c.set('container', container)
  await next()
})

mountRouters(app, {} as any)

export default app
