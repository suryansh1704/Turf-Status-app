# Turf Booking System

A full-stack web application for managing sports turf bookings. Built with React.js, Node.js, Express, and MongoDB.

## Features

- User authentication (Login/Register)
- Turf booking system
- Admin dashboard for managing bookings
- Real-time booking status updates
- Responsive design

## Tech Stack

- Frontend: React.js, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/namandhoot/turf-booking.git
cd turf-booking
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory with the following variables:
```
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

4. Start the application
```bash
# Start backend server
cd server
npm start

# Start frontend development server
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 