import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-default-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-default-200/70 bg-background/95 p-6 shadow-xl shadow-default-200/20 backdrop-blur-xl sm:p-8">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
