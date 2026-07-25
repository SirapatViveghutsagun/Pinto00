import { Hono } from 'hono'
import type { Container } from '../di/container'

declare module 'hono' {
  interface ContextVariableMap {
    container: Container
  }
}

export function createTransactionRouter(): Hono {
  const router = new Hono()

  router.get('/', (c) => c.get('container').transactionHandler.list(c))
  router.post('/', (c) => c.get('container').transactionHandler.create(c))
  router.get('/:id', (c) => c.get('container').transactionHandler.get(c))
  router.patch('/:id', (c) => c.get('container').transactionHandler.update(c))
  router.delete('/:id', (c) => c.get('container').transactionHandler.delete(c))

  return router
}
