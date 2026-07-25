import { Hono } from 'hono'
import type { Container } from '../di/container'

// Extend Hono context to include container
declare module 'hono' {
  interface ContextVariableMap {
    container: Container
  }
}

export function createUserRouter() {
  const router = new Hono()

  router.get('/', (c) => c.get('container').userHandler.list(c))
  router.post('/', (c) => c.get('container').userHandler.create(c))
  router.get('/:id', (c) => c.get('container').userHandler.get(c))
  router.patch('/:id', (c) => c.get('container').userHandler.update(c))
  router.delete('/:id', (c) => c.get('container').userHandler.delete(c))

  return router
}
