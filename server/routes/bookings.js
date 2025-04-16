const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Booking = require('../models/Booking');

// @route   GET /api/bookings
// @desc    Get all bookings (public)
router.get('/', async (req, res) => {
  try {
    const { date, turfType } = req.query;
    const query = {};
    
    if (date) {
      // Set the time to start of day for consistent date comparison
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }
    
    if (turfType) {
      query.turfType = turfType;
    }

    console.log('GET Bookings Query:', query);
    
    const bookings = await Booking.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate('updatedBy', 'username');

    console.log('Found Bookings:', JSON.stringify(bookings, null, 2));
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/bookings
// @desc    Create or update a booking (admin and student)
router.post('/', [auth], async (req, res) => {
  try {
    const { date, startTime, endTime, status, notes, turfType } = req.body;

    console.log('Received booking request:', {
      date,
      startTime,
      endTime,
      status,
      turfType,
      notes,
      userRole: req.user.role
    });

    if (!date || !startTime || !endTime || !status || !turfType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { date, startTime, endTime, status, turfType }
      });
    }

    // Set the time to start of day for consistent date comparison
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check if a booking already exists for this slot and turf
    let existingBooking = await Booking.findOne({
      date: bookingDate,
      startTime: startTime,
      turfType: turfType
    });

    console.log('Existing booking found:', existingBooking);

    // Only allow admin to create new bookings or students to mark slots as vacant
    if (req.user.role !== 'admin' && (!existingBooking || status !== 'vacant')) {
      return res.status(403).json({ error: 'Students can only mark booked slots as vacant' });
    }

    let booking;
    
    if (existingBooking) {
      // Update existing booking
      existingBooking.status = status;
      existingBooking.notes = notes;
      existingBooking.updatedBy = req.user._id;
      booking = await existingBooking.save();
      console.log('Updated booking:', booking);
    } else {
      // Create new booking (admin only)
      booking = new Booking({
        date: bookingDate,
        startTime,
        endTime,
        status,
        notes,
        turfType,
        updatedBy: req.user._id
      });
      booking = await booking.save();
      console.log('Created new booking:', booking);
    }

    // Fetch the updated booking with populated user
    booking = await Booking.findById(booking._id).populate('updatedBy', 'username');
    
    console.log('Final booking response:', booking);
    res.json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status (admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { status, notes } = req.body;
    booking.status = status || booking.status;
    booking.notes = notes || booking.notes;
    booking.updatedBy = req.user._id;

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking (admin only)
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await booking.remove();
    res.json({ message: 'Booking removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 