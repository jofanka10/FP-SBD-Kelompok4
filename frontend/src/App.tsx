import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Donations from './pages/Donations';
import Transactions from './pages/Transactions';
import AidRecipients from './pages/AidRecipients';
import Aid from './pages/Aid';
import AidCategories from './pages/AidCategories';
import Trash from './pages/Trash';
import { ToastProvider } from './contexts/ToastContext';
import Toast from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/aid-recipients" element={<AidRecipients />} />
              <Route path="/aid" element={<Aid />} />
              <Route path="/aid-categories" element={<AidCategories />} />
              <Route path="/trash" element={<Trash />} />
            </Routes>
          </Layout>
          <Toast />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;