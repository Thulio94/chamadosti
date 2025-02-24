import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewTicket } from './pages/NewTicket';
import { MyTickets } from './pages/MyTickets';
import { TicketDetail } from './pages/TicketDetail';
import { UserManagement } from './pages/UserManagement';
import { QueueTickets } from './pages/QueueTickets';
import { WhatsAppConnections } from './pages/WhatsAppConnections';
import { Reports } from './pages/Reports';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { NotificationListener } from './components/Notification';
import { NotificationSidebar } from './components/NotificationSidebar';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <NotificationListener />
      <BrowserRouter>
        <NotificationSidebar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="novo-chamado" element={<NewTicket />} />
            <Route path="meus-chamados" element={<MyTickets />} />
            <Route path="chamado/:id" element={<TicketDetail />} />
            <Route path="usuarios" element={<UserManagement />} />
            <Route path="fila" element={<QueueTickets />} />
            <Route path="conexoes-whatsapp" element={<WhatsAppConnections />} />
            <Route path="relatorios" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;