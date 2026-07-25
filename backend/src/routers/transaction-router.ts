import { z } from 'zod'
import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import { createTransactionSchema, idParamSchema, transactionResponseSchema, updateTransactionSchema } from '../schemas/transaction-schemas'
import { errorResponseSchema } from '../schemas/user-schemas'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createTransactionRouter(): Hono {
  const router = new Hono()

  // GET /transactions?userId=xxx
  router.get(
    '/',
    describeRoute({
      tags: ['Transactions'],
      summary: 'List all transactions for a user',
      responses: {
        200: {
          description: 'List of transactions',
          content: jsonContent(z.object({ data: z.array(transactionResponseSchema) })),
        },
      },
    }),
    (c) => c.get('container').transactionHandler.list(c)
  )

  // GET /transactions/:id
  router.get(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Get a transaction by ID',
      responses: {
        200: { description: 'Transaction found', content: jsonContent(z.object({ data: transactionResponseSchema })) },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.get(c)
  )

  // POST /transactions
  router.post(
    '/',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Create a new transaction',
      responses: {
        201: { description: 'Transaction created', content: jsonContent(z.object({ data: transactionResponseSchema })) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createTransactionSchema),
    (c) => c.get('container').transactionHandler.create(c)
  )

  // PATCH /transactions/:id
  router.patch(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Update a transaction',
      responses: {
        200: { description: 'Transaction updated', content: jsonContent(z.object({ data: transactionResponseSchema })) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateTransactionSchema),
    (c) => c.get('container').transactionHandler.update(c)
  )

  // DELETE /transactions/:id
  router.delete(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Delete a transaction',
      responses: {
        204: { description: 'Transaction deleted' },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.delete(c)
  )

  return router
}
