import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ConsultarDados from "./pages/ConsultarDados";
import AdminPanel from "./pages/AdminPanel";
import Admin from "./pages/Admin";
import Historico from "./pages/Historico";
import Perfil from "./pages/Perfil";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={() => <DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path={"/consultar-dados"} component={() => <DashboardLayout><ConsultarDados /></DashboardLayout>} />
      <Route path={"/consultar-fotos"} component={() => <DashboardLayout><ConsultarDados /></DashboardLayout>} />
      <Route path={"/historico"} component={() => <DashboardLayout><Historico /></DashboardLayout>} />
      <Route path={"/perfil"} component={() => <DashboardLayout><Perfil /></DashboardLayout>} />
      <Route path={"/admin"} component={() => <Admin />} />
      <Route path={""} component={Login} />
      <Route path={"/"} component={Login} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
