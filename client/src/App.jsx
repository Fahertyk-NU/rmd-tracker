import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNavbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ClientDetail from "./pages/ClientDetail";
import AccountDetail from "./pages/AccountDetail";
import AccountForm from "./pages/AccountForm";
import RmdRecordForm from "./pages/RmdRecordForm";

function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/accounts/new" element={<AccountForm />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/accounts/:id/edit" element={<AccountForm />} />
        <Route path="/rmdRecords/new" element={<RmdRecordForm />} />
        <Route path="/rmdRecords/:id/edit" element={<RmdRecordForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;