import { getPages, getPagination } from './pagination.helper'

describe('getPages', () => {
  it('should calculate the number of items to take and the number of items to skip', () => {
    const result1 = getPages({ page: 1, limit: 10, max: 20 })
    expect(result1).toEqual({ take: 10, skip: 0 })

    const result2 = getPages({ page: 2, limit: 5, max: 10 })
    expect(result2).toEqual({ take: 5, skip: 5 })

    const result3 = getPages({ page: 3, limit: 15, max: 30 })
    expect(result3).toEqual({ take: 15, skip: 30 })

    const result4 = getPages({ page: 0, limit: 10, max: 20 })
    expect(result4).toEqual({ take: 10, skip: 0 })
  })
})

describe('getPagination', () => {
  it('should calculate the pagination details', () => {
    const result1 = getPagination({ page: 1, count: 100, take: 10 })
    expect(result1).toEqual({
      totalRecords: 100,
      currentPage: 1,
      perPage: 10,
      nextPage: 2,
      prevPage: null,
      totalPages: 10,
    })

    const result2 = getPagination({ page: 3, count: 50, take: 20 })
    expect(result2).toEqual({
      totalRecords: 50,
      currentPage: 3,
      perPage: 20,
      nextPage: null,
      prevPage: 2,
      totalPages: 3,
    })

    const result3 = getPagination({ page: 2, count: 15, take: 5 })
    expect(result3).toEqual({
      totalRecords: 15,
      currentPage: 2,
      perPage: 5,
      nextPage: 3,
      prevPage: 1,
      totalPages: 3,
    })
  })
})
