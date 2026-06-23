export function mockQueryChain(returnValue: unknown) {
  const chain = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };

  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);

  return chain;
}
