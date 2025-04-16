import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Box,
  Alert,
  TextField,
  Chip,
  useTheme,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import axios from 'axios';
import { format, isBefore, set, isToday } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
];

const turfTypes = [
  { id: 'padel', label: 'Padel Court', icon: <SportsTennisIcon /> },
  { id: 'futsal', label: 'Futsal Court', icon: <SportsSoccerIcon /> },
  { id: 'cricket', label: 'Cricket Net', icon: <SportsCricketIcon /> }
];

const BookingSchedule = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTurf, setSelectedTurf] = useState('padel');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchBookings = async () => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await axios.get('http://localhost:5001/api/bookings', {
        params: {
          date: formattedDate,
          turfType: selectedTurf
        },
      });

      console.log('Fetched bookings:', response.data);
      setBookings(response.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to fetch bookings');
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedTurf]);

  // Add periodic refresh
  useEffect(() => {
    const intervalId = setInterval(fetchBookings, 5000); // Refresh every 5 seconds
    return () => clearInterval(intervalId);
  }, [selectedDate, selectedTurf]);

  const getSlotStatus = (time) => {
    try {
      // Get current time
      const now = new Date();
      const currentHour = now.getHours();
      
      // Get slot time
      const slotHour = parseInt(time.split(':')[0]);
      
      // Check if the slot is in the past
      if (isToday(selectedDate)) {
        // Only mark as past if current hour is greater than slot hour
        // This means 11:00 slot remains active until 12:00
        if (currentHour > slotHour) {
          return 'past';
        }
      } else if (isBefore(selectedDate, new Date().setHours(0,0,0,0))) {
        return 'past';
      }

      if (!Array.isArray(bookings)) {
        console.error('Bookings is not an array:', bookings);
        return 'vacant';
      }

      const booking = bookings.find(b => 
        b.startTime === time && 
        b.turfType === selectedTurf
      );

      if (booking) {
        console.log(`Found booking for ${time}:`, booking);
        return booking.status;
      }

      return 'vacant';
    } catch (error) {
      console.error('Error in getSlotStatus:', error);
      return 'vacant';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return theme.palette.error.light;
      case 'maintenance':
        return theme.palette.warning.light;
      case 'past':
        return theme.palette.grey[300];
      default:
        return theme.palette.success.light;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'booked':
        return <EventBusyIcon />;
      case 'maintenance':
        return <BuildIcon />;
      case 'past':
        return <AccessTimeIcon color="disabled" />;
      default:
        return <AccessTimeIcon />;
    }
  };

  const getTurfIcon = (turfType) => {
    switch (turfType) {
      case 'padel':
        return <SportsTennisIcon />;
      case 'futsal':
        return <SportsSoccerIcon />;
      case 'cricket':
        return <SportsCricketIcon />;
      default:
        return null;
    }
  };

  const handleMarkAsAvailable = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedSlot) return;

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      await axios.post(
        'http://localhost:5001/api/bookings',
        {
          date: formattedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          status: 'vacant',
          turfType: selectedTurf,
          notes: 'Marked as available by student'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      setSuccess('Slot marked as available successfully');
      setOpenDialog(false);
      fetchBookings();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update booking');
    }
  };

  const handleSlotClick = (time, status) => {
    if (status === 'booked' && user?.role === 'student') {
      setSelectedSlot({
        startTime: time,
        endTime: timeSlots[timeSlots.indexOf(time) + 1] || '23:00'
      });
      setOpenDialog(true);
    }
  };

  const isSlotVisible = (time) => {
    if (!isToday(selectedDate)) {
      return true;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const slotHour = parseInt(time.split(':')[0]);
    
    return currentHour <= slotHour;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f4f4f4 100%)',
          borderRadius: 2
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 3
            }}
          >
            Turf Booking Schedule
          </Typography>

          <Box sx={{ width: '100%', mb: 3 }}>
            <Tabs
              value={selectedTurf}
              onChange={(e, newValue) => setSelectedTurf(newValue)}
              centered
              sx={{
                '& .MuiTab-root': {
                  minHeight: '72px',
                  fontSize: '1rem',
                }
              }}
            >
              {turfTypes.map((turf) => (
                <Tab
                  key={turf.id}
                  value={turf.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1 }}>
                      {turf.icon}
                      <span>{turf.label}</span>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
                sx={{ width: 250 }}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={2}>
          {timeSlots.map((time) => {
            const status = getSlotStatus(time);
            const isPast = status === 'past';
            
            // Only render if the slot should be visible
            if (!isSlotVisible(time)) {
              return null;
            }

            return (
              <Grid item xs={12} key={time}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    backgroundColor: getStatusColor(status),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: isPast ? 'none' : 'translateY(-2px)',
                      boxShadow: isPast ? 1 : 3,
                      cursor: status === 'booked' && user?.role === 'student' ? 'pointer' : 'default'
                    },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 2,
                    opacity: isPast ? 0.7 : 1
                  }}
                  onClick={() => handleSlotClick(time, status)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(status)}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        ml: 2,
                        color: isPast ? theme.palette.text.disabled : theme.palette.text.primary
                      }}
                    >
                      {time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTurfIcon(selectedTurf)}
                    <Chip
                      label={status.toUpperCase()}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        fontWeight: 'bold',
                        color: isPast ? theme.palette.text.disabled : theme.palette.text.primary
                      }}
                    />
                    {status === 'booked' && user?.role === 'student' && (
                      <Tooltip title="Mark as Available">
                        <IconButton 
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Mark Slot as Available</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to mark this slot as available for others?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleMarkAsAvailable} variant="contained" color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default BookingSchedule; 