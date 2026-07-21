import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Container } from "react-bootstrap";
import PropTypes from "prop-types";
import AppNavbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientDetail from "./pages/ClientDetail";
import ClientForm from "./pages/ClientForm";
import AccountDetail from "./pages/AccountDetail";
import AccountForm from "./pages/AccountForm";
import RmdRecordForm from "./pages/RmdRecordForm";
import AccountsByCompany from "./pages/AccountsByCompany";

/*
 * FIXME: Delete this, handle redirects using middleware.
 */
function ProtectedLayout({ user, onLogout }) {
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <AppNavbar onLogout={onLogout} />
      <Outlet />
    </>
  );
}

ProtectedLayout.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
};

function App() {
  // undefined = still checking session, null = logged out, object = logged in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => setUser(null));
  };

  if (user === undefined) {
    return (
      <Container className="mt-5">
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />
          }
        />
        <Route
          element={<ProtectedLayout user={user} onLogout={handleLogout} />}
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts/byCompany" element={<AccountsByCompany />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />
          <Route path="/accounts/new" element={<AccountForm />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          <Route path="/accounts/:id/edit" element={<AccountForm />} />
          <Route path="/rmdRecords/new" element={<RmdRecordForm />} />
          <Route path="/rmdRecords/:id/edit" element={<RmdRecordForm />} />
          //add login page route
          //add 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
