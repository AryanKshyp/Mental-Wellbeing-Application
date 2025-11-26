import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MainNav } from "@/components/navigation/main-nav";
import { UserNav } from "@/components/navigation/user-nav";
import { Badge } from "@/components/ui/badge";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardShell>
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/80 px-6 py-4 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-slate-900">
              Campus Connect
            </span>
            <Badge variant="outline" className="text-xs">
              Beta
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            One calm space for mentoring, journaling, and AI support.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <MainNav />
          <UserNav />
        </div>
      </header>
      {children}
    </DashboardShell>
  );
}

