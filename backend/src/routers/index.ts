import { createUserRouter } from './user-router'
import { createTransactionRouter } from './transaction-router'
import type { Container } from '../di/container'

export function mountRouters(app: any, container: Container): void {
  app.use('*', (c: any, next: any) => {
    c.set('container', container)
    return next()
  })

  app.route('/api/v1/users', createUserRouter())
  app.route('/api/v1/transactions', createTransactionRouter())
}
