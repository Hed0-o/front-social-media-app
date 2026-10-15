import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function NotFound() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("NotFound must be used within AuthProvider");
  }

  const { isLoggedIn } = auth;

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-3xl font-black text-primary">
          404
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-default-500">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={isLoggedIn ? "/social/feed" : "/auth/signin"}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Go to Home
          </Link>

          {!isLoggedIn && (
            <Link
              to="/auth/signup"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-default-200 bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
