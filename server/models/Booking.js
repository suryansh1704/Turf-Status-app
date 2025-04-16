const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  turfType: {
    type: String,
    enum: ['padel', 'futsal', 'cricket'],
    required: true
  },
  status: {
    type: String,
    enum: ['vacant', 'booked', 'maintenance'],
    default: 'vacant'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema); 