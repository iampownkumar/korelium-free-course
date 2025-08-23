const express = require('express');
const { sequelize } = require('./models'); // Import Sequelize instance

const app = express();
const PORT = process.env.PORT || 9000;

// const cors = require('cors');
// app.use(cors());
// Or for more restricted control:
// app.use(cors({
//   origin: 'http://192.168.10.13:3000', // Use your frontend origin here, change if needed!
//   credentials: true
// }));

const cors = require('cors');
app.use(cors({
   origin: ['http://localhost:5173', 'http://192.168.10.13:5500','http://localhost:5500','http://127.0.0.1:5500'],
  // origin: 'http://192.168.10.13:5500', // must exactly match your frontend
  // origin:'http://localhost:5500',
  credentials: true
}));


// Middleware to parse JSON bodies
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Root route to check server status
app.get('/', (req, res) => {
  res.send('Hello, server and database are working!');
});

// Import and use admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);


const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

const publicRoutes = require('./routes/publicRoutes');
app.use('/api', publicRoutes);



//localadmins
const localAdminRoutes = require('./routes/localAdminRoutes');
app.use('/api/localadmins',localAdminRoutes);


// Authenticate database and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection is working!');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
