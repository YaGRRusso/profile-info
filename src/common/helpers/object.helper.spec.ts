import { removeObjectKey, removeObjectsKey } from './object.helper'

describe('exclude helper', () => {
  it('should remove password from object', () => {
    const user = { name: 'xxx', password: '123' }
    const result = removeObjectKey(user, 'password')
    expect(result).toStrictEqual({ name: 'xxx' })
  })

  it('should remove password from array of object', () => {
    const users = [
      { name: 'xxx', password: '123' },
      { name: 'yyy', password: '456' },
      { name: 'zzz', password: '789' },
    ]
    const result = removeObjectsKey(users, 'password')
    expect(result).toStrictEqual([
      { name: 'xxx' },
      { name: 'yyy' },
      { name: 'zzz' },
    ])
  })
})
