import { createContext, type ReactNode, useContext } from "react";

interface DataStateContextValue {
  isEmpty?: boolean;
  isFetching?: boolean;
  isLoading?: boolean;
}

const DataStateContext = createContext<DataStateContextValue | null>(null);

function useDataStateContext() {
  const ctx = useContext(DataStateContext);
  if (!ctx) throw new Error("DataState slots must be used inside <DataState>");
  return ctx;
}

interface DataStateProps extends DataStateContextValue {
  children: ReactNode;
}

export function DataState({
  isLoading,
  isFetching,
  isEmpty,
  children,
}: DataStateProps) {
  return (
    <DataStateContext.Provider value={{ isLoading, isFetching, isEmpty }}>
      {children}
    </DataStateContext.Provider>
  );
}

DataState.Loading = function DataStateLoading({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoading } = useDataStateContext();
  if (isLoading) return <>{children}</>;
};

DataState.Fetching = function DataStateFetching({
  children,
}: {
  children: ReactNode;
}) {
  const { isFetching } = useDataStateContext();
  if (isFetching) return <>{children}</>;
};

DataState.Empty = function DataStateEmpty({
  children,
}: {
  children: ReactNode;
}) {
  const { isEmpty, isLoading } = useDataStateContext();
  if (isEmpty && !isLoading) return <>{children}</>;
};

DataState.Content = function DataStateContent({
  children,
}: {
  children: ReactNode;
}) {
  const { isEmpty, isLoading } = useDataStateContext();
  if (!isEmpty && !isLoading) return <>{children}</>;
};
