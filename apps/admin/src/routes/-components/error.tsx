import { ErrorComponentProps } from "@tanstack/react-router";

export function ErrorLayout({ error, reset }: ErrorComponentProps) {
  return (
    <div className="hero min-h-96">
      <div className="hero-content flex flex-col items-start justify-center">
        <span className="font-bold text-6xl">{error.name}</span>
        <span className="text-error opacity-lg">{error.message}</span>
        <button className="btn" onClick={() => reset()} type="button">
          Try Again
        </button>
      </div>
    </div>
  );
}
