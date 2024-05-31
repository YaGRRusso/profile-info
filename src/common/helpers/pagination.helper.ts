import { PaginationDto } from '../dto/input.dto'
import { PaginationOutputDto } from '../dto/output.dto'

/**
 * Calculates the number of items to take and the number of items to skip based on the provided pagination parameters.
 * @param {Object} options - The pagination options.
 * @returns {Object} - The number of items to take and the number of items to skip.
 */
export const getPages = ({
  page = 1,
  limit = 5,
  max = 10,
}: PaginationDto & { max?: number }) => {
  page = +page
  limit = +limit

  const take = limit && limit <= max ? limit : max
  const skip = page >= 0 ? (page - 1) * take : 0
  return { take, skip }
}

/**
 * Calculates the pagination details based on the provided count and take parameters.
 * @param {Object} options - The pagination options.
 * @returns {Object} - The pagination details.
 */
export const getPagination = ({
  page = 1,
  count,
  take,
}: {
  page?: number | string
  count: number | string
  take: number | string
}): PaginationOutputDto => {
  page = +page
  count = +count
  take = +take

  const totalPages = Math.ceil(count / take)
  return {
    totalRecords: count,
    currentPage: page,
    perPage: take,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
    totalPages,
  }
}
