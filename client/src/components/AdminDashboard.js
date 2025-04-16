import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Alert,
  Chip,
  useTheme,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import axios from 'axios';
import { format, isBefore, set, isToday } from 'date-fns';

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
];

const statusOptions = ['vacant', 'booked', 'maintenance'];

const turfTypes = [
  { id: 'padel', label: 'Padel Court', icon: <SportsTennisIcon /> },
  { id: 'futsal', label: 'Futsal Court', icon: <SportsSoccerIcon /> },
  { id: 'cricket', label: 'Cricket Net', icon: <SportsCricketIcon /> }
];

const AdminDashboard = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('vacant');
  const [notes, setNotes] = useState('');
  const [selectedTurf, setSelectedTurf] = useState('padel');

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedTurf]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/bookings', {
        params: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          turfType: selectedTurf
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings');
    }
  };

  const getSlotStatus = (time) => {
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

    const booking = bookings.find(b => 
      b.startTime === time && 
      b.turfType === selectedTurf
    );

    return booking ? booking.status : 'vacant';
  };

  const handleUpdateBooking = async () => {
    try {
      if (!selectedSlot) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      // Get current time
      const now = new Date();
      const currentHour = now.getHours();
      
      // Get slot time
      const slotHour = parseInt(selectedSlot.split(':')[0]);
      
      // Check if the slot is in the past
      if (isToday(selectedDate) && currentHour > slotHour) {
        setError('Cannot update past time slots');
        return;
      }

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      await axios.post(
        'http://localhost:5001/api/bookings',
        {
          date: formattedDate,
          startTime: selectedSlot,
          endTime: timeSlots[timeSlots.indexOf(selectedSlot) + 1] || '23:00',
          status: selectedStatus,
          notes,
          turfType: selectedTurf
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      // Clear form and show success message
      setSuccess('Booking updated successfully');
      setSelectedSlot(null);
      setSelectedStatus('vacant');
      setNotes('');

      // Immediately fetch updated bookings
      const response = await axios.get('http://localhost:5001/api/bookings', {
        params: {
          date: formattedDate,
          turfType: selectedTurf
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return theme.palette.error.light;
      case 'maintenance':
        return theme.palette.warning.light;
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
      default:
        return <AccessTimeIcon />;
    }
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
            Admin Dashboard
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
            const isSelected = selectedSlot === time;

            return (
              <Grid item xs={12} key={time}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    backgroundColor: isSelected ? theme.palette.primary.light : getStatusColor(status),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 2,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedSlot(time)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(status)}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        ml: 2,
                        color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary
                      }}
                    >
                      {time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={status.toUpperCase()}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        fontWeight: 'bold',
                        color: theme.palette.text.primary
                      }}
                    />
                    <Tooltip title="Edit Slot">
                      <IconButton 
                        size="small" 
                        onClick={() => setSelectedSlot(time)}
                        sx={{ 
                          backgroundColor: theme.palette.background.paper,
                          ml: 1
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {selectedSlot && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ color: theme.palette.primary.main }}
            >
              Update Slot: {selectedSlot}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ backgroundColor: theme.palette.background.paper }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ backgroundColor: theme.palette.background.paper }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleUpdateBooking}
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  Update Booking
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 