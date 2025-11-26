import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-gradient-to-b from-sky-50 to-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-xl">{children}</div>
      </section>
      <aside className="hidden flex-col justify-between bg-gradient-to-br from-teal-500 via-sky-500 to-indigo-500 p-12 text-white lg:flex">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] opacity-80">
            Campus Connect
          </p>
          <h2 className="mt-6 text-4xl font-semibold leading-tight">
            Your safe bridge between wellness, mentors, and AI support.
          </h2>
        </div>
        <div className="rounded-3xl bg-white/15 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-widest opacity-70">
            What students love
          </p>
          <ul className="mt-4 space-y-3 text-lg font-medium">
            <li>• Anonymous TalkSpace rooms</li>
            <li>• Habit loops & streaks</li>
            <li>• Personalized mentor matching</li>
            <li>• AI Buddy that remembers your story</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

