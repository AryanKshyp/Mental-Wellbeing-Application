import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-screen w-full flex-col gap-6 bg-gradient-to-b from-sky-50/70 via-white to-white px-4 py-8 md:px-8 lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

