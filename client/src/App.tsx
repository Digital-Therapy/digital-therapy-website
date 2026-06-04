import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { ChatWidget } from "./components/ChatWidget";
import { RouteSeo } from "./components/RouteSeo";
import ErrorBoundary from "./components/ErrorBoundary";
import SiteFooter from "./components/SiteFooter";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DTBrain from "./pages/DTBrain";
import Team from "./pages/Team";
import Thesis from "./pages/Thesis";
import Capabilities from "./pages/Capabilities";
import OurApproach from "./pages/OurApproach";
import Accessibility from "./pages/Accessibility";
import Partners from "./pages/Partners";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Vendors from "./pages/Vendors";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminVendorDetail from "./pages/admin/AdminVendorDetail";
import AdminClients from "./pages/admin/AdminClients";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dt-brain"} component={DTBrain} />
      <Route path={"/thesis"} component={Thesis} />
      <Route path={"/capabilities"} component={Capabilities} />
      <Route path={"/process"} component={OurApproach} />
      <Route path={"/partners"} component={Partners} />
      <Route path={"/vendors"} component={Vendors} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/accessibility"} component={Accessibility} />
      <Route path={"/team"} component={Team} />
      {/* Protected admin console — auth/role-gated in AdminLayout, guarded
          server-side by adminProcedure. Intentionally excluded from
          scripts/prerender.mjs ROUTES (auth-gated, not for the sitemap). */}
      <Route path={"/vendorlists"} component={AdminVendors} />
      <Route path={"/vendorlists/:id"} component={AdminVendorDetail} />
      <Route path={"/admin/clients"} component={AdminClients} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // The admin console is an app shell, not a marketing page — suppress the
  // public footer and chat widget on /admin/* routes.
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <RouteSeo />
          <Toaster />
          <Router />
          {!isAdmin && <SiteFooter />}
          {!isAdmin && <ChatWidget />}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
