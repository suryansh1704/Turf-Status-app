import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import BookingSchedule from './components/BookingSchedule';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import Box from '@mui/material/Box';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#9a0036',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const CollegeHeader = () => (
  <Box className="college-header">
    <img 
      src="/rcoem-logo.png" 
      alt="RCOEM Logo" 
      className="college-logo"
    />
    <h1 className="college-name">Ramdeobaba University, Nagpur</h1>
    <p style={{ margin: '5px 0 0', color: '#666' }}>Sports Complex Booking System</p>
  </Box>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  return user && isAdmin() ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <Box className="app-background">
      <Navbar />
      <CollegeHeader />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<BookingSchedule />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 