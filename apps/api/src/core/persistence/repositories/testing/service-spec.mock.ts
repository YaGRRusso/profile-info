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
    updateMany: jest.fn(),
    updateManyById: jest.fn(),
    updateOne: jest.fn(),
    updateOneById: jest.fn(),
    scoped: jest.fn(),
    global: jest.fn(),
  };

  mock.scoped.mockReturnValue(mock);
  mock.global.mockReturnValue(mock);

  return mock;
}

export function createMockStats() {
  const mock = {
    count: jest.fn(),
    countByField: jest.fn(),
    findRecentlyUpdated: jest.fn(),
    scoped: jest.fn(),
    global: jest.fn(),
  };

  mock.scoped.mockReturnValue(mock);
  mock.global.mockReturnValue(mock);

  return mock;
}
