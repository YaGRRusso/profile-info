import { manyIds } from './prisma.helper'

describe('Prisma Helper', () => {
  it('should be return connection with many ids', () => {
    const res = { connect: manyIds(['123', '456', '789']) }
    expect(res).toStrictEqual({
      connect: [{ id: '123' }, { id: '456' }, { id: '789' }],
    })
  })

  it('should be return disconnection with many ids', () => {
    const res = { disconnect: manyIds(['123', '456', '789']) }
    expect(res).toStrictEqual({
      disconnect: [{ id: '123' }, { id: '456' }, { id: '789' }],
    })
  })
})
