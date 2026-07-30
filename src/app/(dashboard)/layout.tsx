import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider user={user}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
