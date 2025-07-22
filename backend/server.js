const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const uploadRoutes = require('./routes/upload');
const violationsRoutes = require('./routes/violations');
const analyticsRoutes = require('./routes/analytics');
const boundariesRoutes = require('./routes/boundaries');
const { seedDatabase } = require('./utils/seedData');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

app.use('/api/upload', uploadRoutes);
app.use('/api/violations', violationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/boundaries', boundariesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/seed', async (req, res) => {
  try {
    const success = await seedDatabase();
    if (success) {
      res.json({ success: true, message: 'Database seeded successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to seed database' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    const ViolationModel = require('./models/Violation');
    const reportCount = await ViolationModel.getReportCount();
    if (reportCount === 0) {
      console.log('Seeding database with sample data...');
      await seedDatabase();
    } else {
      console.log(`Database already contains ${reportCount} reports`);
    }
  } catch (error) {
    console.error('Error checking/seeding database:', error.message);
  }
}); 