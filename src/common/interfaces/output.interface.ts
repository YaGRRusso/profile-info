export type CommonOutput<T = unknown> = Promise<T>

export type PaginatedOutput<T = unknown> = Promise<{
  data: T[]
  pagination: {
    totalRecords: number
    currentPage: number
    perPage: number
    nextPage?: number
    prevPage?: number
    totalPages: number
  }
}>
