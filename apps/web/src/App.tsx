import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import Login from './pages/Login';
import Calendar from './pages/Calendar';
import './App.css';

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Calendar />} />
        <Route path="/auth/callback" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;