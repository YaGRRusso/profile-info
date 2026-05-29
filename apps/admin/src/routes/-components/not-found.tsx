import { Link } from "@tanstack/react-router";

export function NotFoundLayout() {
  return (
    <div className="hero min-h-96">
      <div className="hero-content flex flex-col items-start justify-center">
        <span className="font-bold text-6xl">Not Found</span>
        <span className="opacity-lg">
          The page you are looking for does not exist.
        </span>
        <Link className="btn" to="/" type="button">
          Go Home
        </Link>
      </div>
    </div>
  );
}
