import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { UIProvider } from "@/components/layout/ui-context";
import { CommandPalette } from "@/components/command-palette";
import { AlertBanner } from "@/components/alert-banner";
import { ExitGuard } from "@/components/exit-guard";
import { DataProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider user={user}>
      <DataProvider>
        <ToastProvider>
          <UIProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 lg:ml-64 overflow-y-auto">
                <AlertBanner />
                {children}
              </main>
            </div>
            <CommandPalette />
            <ExitGuard />
          </UIProvider>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
