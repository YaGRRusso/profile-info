import type { InfiniteData } from "@tanstack/react-query";

export interface PaginatedList<TNode = unknown> {
  found: number;
  nodes: TNode[];
}

export interface PaginatedData<TNode> {
  found: number;
  nodes: TNode[];
}

type PaginatedField<TPage> = {
  [Key in keyof TPage]: TPage[Key] extends PaginatedList<unknown> ? Key : never;
}[keyof TPage] &
  string;

type PaginatedNode<TPage> =
  TPage[PaginatedField<TPage>] extends PaginatedList<infer TNode>
    ? TNode
    : never;

const PAGINATED_PAGE_SIZE = 50;

function paginatedListFromPage<TPage>(
  page: TPage,
  field: PaginatedField<TPage>
): PaginatedList<PaginatedNode<TPage>> {
  return page[field as keyof TPage] as PaginatedList<PaginatedNode<TPage>>;
}

export function withPagination<TVariables extends Record<string, unknown>>(
  paginationKey: keyof TVariables & string,
  pageParam: number,
  variables?: Record<string, unknown>
): TVariables {
  return {
    ...variables,
    [paginationKey]: { skip: pageParam, limit: PAGINATED_PAGE_SIZE },
  } as TVariables;
}

export function paginatedNextPageParam<TPage>(
  field: PaginatedField<TPage>
): (lastPage: TPage, allPages: TPage[]) => number | undefined {
  return (lastPage, allPages) => {
    const totalFetched = allPages.reduce(
      (sum, page) => sum + paginatedListFromPage(page, field).nodes.length,
      0
    );
    const { found } = paginatedListFromPage(lastPage, field);
    return totalFetched < found ? totalFetched : undefined;
  };
}

export function paginatedSelect<TPage>(
  field: PaginatedField<TPage>
): (data: InfiniteData<TPage>) => PaginatedData<PaginatedNode<TPage>> {
  return (data) => ({
    found: data.pages[0]
      ? paginatedListFromPage(data.pages[0], field).found
      : 0,
    nodes: data.pages.flatMap(
      (page) => paginatedListFromPage(page, field).nodes
    ),
  });
}
