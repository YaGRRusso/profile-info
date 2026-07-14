export function createMockCrud() {
  const mock = {
    createMany: jest.fn(),
    createOne: jest.fn(),
    deleteMany: jest.fn(),
    deleteManyById: jest.fn(),
    deleteOne: jest.fn(),
    deleteOneById: jest.fn(),
    findMany: jest.fn(),
    findManyById: jest.fn(),
    findOne: jest.fn(),
    findOneById: jest.fn(),
    global: jest.fn(),
    scoped: jest.fn(),
    updateMany: jest.fn(),
    updateManyById: jest.fn(),
    updateOne: jest.fn(),
    updateOneById: jest.fn(),
  };

  mock.scoped.mockReturnValue(mock);
  mock.global.mockReturnValue(mock);

  return mock;
}

export function createMockStats() {
  const mock = {
    count: jest.fn(),
    countByField: jest.fn(),
    countByOwnerIds: jest.fn(),
    findRecentlyUpdated: jest.fn(),
    global: jest.fn(),
    scoped: jest.fn(),
  };

  mock.scoped.mockReturnValue(mock);
  mock.global.mockReturnValue(mock);

  return mock;
}
