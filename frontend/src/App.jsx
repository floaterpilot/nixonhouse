import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Links from './pages/Links';
import Media from './pages/Media';
import Cubs from './pages/Cubs';
import Sports from './pages/Sports';
import News from './pages/News';
import BottomNav from './components/BottomNav';

function PrivateLayout({ children }) {
  const token = localStorage.getItem('nh_token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-20 overflow-y-auto">{children}</div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateLayout><Home /></PrivateLayout>} />
        <Route path="/links" element={<PrivateLayout><Links /></PrivateLayout>} />
        <Route path="/media" element={<PrivateLayout><Media /></PrivateLayout>} />
        <Route path="/cubs" element={<PrivateLayout><Cubs /></PrivateLayout>} />
        <Route path="/sports" element={<PrivateLayout><Sports /></PrivateLayout>} />
        <Route path="/news" element={<PrivateLayout><News /></PrivateLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
