/**
 * AdminLayout — shell + access gate for the internal /admin vendor console.
 *
 * Defense-in-depth: the real guard is the server-side `adminProcedure` (every
 * admin tRPC call returns FORBIDDEN for non-admins). This layout just avoids
 * flashing data and gives a clean message:
 *   - loading            -> spinner
 *   - not signed in      -> sign-in prompt (OAuth)
 *   - signed in non-admin-> "Admin access required"
 *   - admin              -> the console chrome + content
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Loader2, LogOut, Users } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [{ icon: Users, label: "Vendors", path: "/admin/vendors" }];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4EE]">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A65FF]" />
      </div>
    );
  }

  if (!user) {
    return (
      <Gate
        title="Sign in to continue"
        body="The vendor admin console requires authentication. Continue to launch the secure login flow."
        action={
          <Button onClick={() => (window.location.href = getLoginUrl())} size="lg" className="w-full">
            Sign in
          </Button>
        }
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Gate
        title="Admin access required"
        body={`You're signed in as ${user.email ?? user.name ?? "an unauthorized account"}, which doesn't have admin access to the vendor console. Contact the Digital Therapy owner if you believe this is a mistake.`}
        action={
          <Button onClick={logout} variant="outline" size="lg" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F4EE] text-[#111111]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin/vendors" className="font-display text-lg tracking-[-0.04em] text-[#111111]">
              Digital Therapy <span className="text-[#0A65FF]">· Vendor Admin</span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => {
                const active = location.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-[#0A65FF] text-white" : "text-black/70 hover:bg-black/5"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-black/60 sm:inline">{user.email ?? user.name}</span>
            <Button onClick={logout} variant="ghost" size="sm" className="text-black/70">
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function Gate({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F4EE] p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-2xl tracking-[-0.04em]">{title}</h1>
        <p className="text-sm leading-6 text-black/65">{body}</p>
        <div className="w-full">{action}</div>
      </div>
    </div>
  );
}
