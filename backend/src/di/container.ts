import { D1TransactionRepository } from '../infrastructure/d1/d1-transaction-repository'
import { MemoryTransactionRepository } from '../infrastructure/memory/memory-transaction-repository'
import { TransactionHandler } from '../handlers/transaction-handler'
import { TransactionService } from '../services/transaction-service'
import { D1UserRepository } from '../infrastructure/d1/d1-user-repository'
import { KVCacheRepository } from '../infrastructure/kv/kv-cache-repository'
import { MemoryCacheRepository } from '../infrastructure/memory/memory-cache-repository'
import { MemoryUserRepository } from '../infrastructure/memory/memory-user-repository'
import { UserHandler } from '../handlers/user-handler'
import { UserService } from '../services/user-service'

export interface Container {
  userHandler: UserHandler
  transactionHandler: TransactionHandler
}

export function createContainer(env: Env): Container {
  // Choose repositories based on runtime
  const useD1 = typeof env.DB !== 'undefined'

  const userRepository = useD1 ? new D1UserRepository(env.DB) : new MemoryUserRepository()
  const cache = useD1 ? new KVCacheRepository(env.KV) : new MemoryCacheRepository()
  const transactionRepository = useD1 ? new D1TransactionRepository(env.DB) : new MemoryTransactionRepository()

  const userService = new UserService(userRepository, cache)
  const transactionService = new TransactionService(transactionRepository)

  return {
    userHandler: new UserHandler(userService),
    transactionHandler: new TransactionHandler(transactionService),
  }
}
