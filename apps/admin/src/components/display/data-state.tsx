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
  children?: ReactNode;
}) {
  const { isLoading } = useDataStateContext();
  if (isLoading) {
    if (children) return <>{children}</>;
    return <div className="loading loading-dots mx-auto my-16 block" />;
  }
};

DataState.Fetching = function DataStateFetching({
  children,
}: {
  children?: ReactNode;
}) {
  const { isFetching } = useDataStateContext();
  if (isFetching) {
    if (children) return <>{children}</>;
    return <div className="loading loading-dots mx-auto my-16 block" />;
  }
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
