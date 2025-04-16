import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        '& .MuiToolbar-root': {
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(13, 71, 161, 0.25))',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            py: 1.5,
            px: { xs: 2, sm: 3, md: 4 },
            borderRadius: '0 0 16px 16px',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.25), rgba(13, 71, 161, 0.35))',
              padding: '10px 20px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.35), rgba(13, 71, 161, 0.45))',
                transform: 'translateY(-2px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              },
            }}
            onClick={() => navigate('/')}
          >
            <SportsSoccerIcon 
              sx={{ 
                mr: 1.5, 
                fontSize: '2.2rem', 
                color: '#fff',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }} 
            />
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                fontWeight: 700,
                color: '#fff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '1.2px',
                fontSize: '1.5rem'
              }}
            >
              Turf Booking
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {user ? (
              <>
                {isAdmin() && (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin')}
                    sx={{ 
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.9))',
                      color: '#1a237e',
                      fontWeight: 600,
                      padding: '10px 24px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      textTransform: 'none',
                      '&:hover': {
                        background: '#fff',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.2)'
                      },
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button 
                  variant="contained"
                  onClick={handleLogout}
                  sx={{ 
                    background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                    color: '#fff',
                    fontWeight: 600,
                    padding: '10px 24px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #c62828, #d32f2f)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.2)'
                    },
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ 
                  background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                  color: '#fff',
                  fontWeight: 600,
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)'
                  },
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 