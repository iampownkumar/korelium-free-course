// Sample API Server for Course Management
// Run this with: node server/api-server.js

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Sample courses data (replace with database)
let courses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and become a full-stack developer",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop",
    category: "Development",
    tags: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
    instructor: "John Smith",
    duration: "40 hours",
    students: 15420,
    rating: 4.8,
    udemyLink: "https://udemy.com/course/example-1",
    fullDescription: "Master web development with this comprehensive bootcamp. You'll learn everything from basic HTML and CSS to advanced React and Node.js concepts. Perfect for beginners who want to become professional developers.",
    prerequisites: "Basic computer skills",
    level: "Beginner",
    language: "English",
    lastUpdated: "2024",
    certificate: true,
    whatYoullLearn: [
      "Build responsive websites with HTML and CSS",
      "Create interactive web applications with JavaScript",
      "Develop modern frontends with React",
      "Build backend APIs with Node.js",
      "Deploy applications to production"
    ]
  },
  {
    id: 2,
    title: "Digital Marketing Masterclass",
    description: "Complete guide to SEO, social media marketing, and online advertising strategies",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
    category: "Marketing",
    tags: ["SEO", "Social Media", "Google Ads", "Content Marketing"],
    instructor: "Sarah Johnson",
    duration: "25 hours",
    students: 8930,
    rating: 4.7,
    udemyLink: "https://udemy.com/course/example-2",
    fullDescription: "Transform your business with proven digital marketing strategies. Learn SEO, social media marketing, Google Ads, and content marketing from industry experts.",
    prerequisites: "No prior experience needed",
    level: "Intermediate",
    language: "English",
    lastUpdated: "2024",
    certificate: true,
    whatYoullLearn: [
      "Master SEO techniques for better rankings",
      "Create effective social media campaigns",
      "Set up and optimize Google Ads",
      "Develop content marketing strategies",
      "Track and analyze marketing performance"
    ]
  },
  // Add more courses as needed...
];

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// API Routes

// Get all courses with filtering
app.get('/api/courses', (req, res) => {
  try {
    const { category, search, level, limit = 50, offset = 0 } = req.query;
    let filteredCourses = [...courses];

    // Filter by category
    if (category && category !== 'All') {
      filteredCourses = filteredCourses.filter(course => 
        course.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        course.instructor.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by level
    if (level) {
      filteredCourses = filteredCourses.filter(course => 
        course.level.toLowerCase() === level.toLowerCase()
      );
    }

    // Pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    // Get unique categories
    const categories = ['All', ...new Set(courses.map(course => course.category))];

    res.json({
      courses: paginatedCourses,
      total: filteredCourses.length,
      categories,
      hasMore: endIndex < filteredCourses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single course by ID
app.get('/api/courses/:id', (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = ['All', ...new Set(courses.map(course => course.category))];
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured courses
app.get('/api/courses/featured', (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const featuredCourses = courses
      .sort((a, b) => b.rating - a.rating)
      .slice(0, parseInt(limit));
    
    res.json(featuredCourses);
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search courses with suggestions
app.get('/api/courses/search', (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const searchTerm = q.toLowerCase();
    const suggestions = courses
      .filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        course.instructor.toLowerCase().includes(searchTerm)
      )
      .slice(0, parseInt(limit))
      .map(course => ({
        id: course.id,
        title: course.title,
        category: course.category,
        instructor: course.instructor
      }));
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get course statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalCourses: courses.length,
      totalStudents: courses.reduce((sum, course) => sum + course.students, 0),
      averageRating: courses.reduce((sum, course) => sum + course.rating, 0) / courses.length,
      categories: [...new Set(courses.map(course => course.category))].length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new course (for admin)
app.post('/api/courses', (req, res) => {
  try {
    const newCourse = {
      id: Math.max(...courses.map(c => c.id)) + 1,
      ...req.body,
      students: 0,
      rating: 0,
      lastUpdated: new Date().getFullYear().toString()
    };
    
    courses.push(newCourse);
    
    // Broadcast new course to all connected clients
    broadcast({
      type: 'newCourse',
      payload: newCourse
    });
    
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update course (for admin)
app.put('/api/courses/:id', (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    courses[courseIndex] = { ...courses[courseIndex], ...req.body };
    
    // Broadcast course update to all connected clients
    broadcast({
      type: 'courseUpdate',
      payload: courses[courseIndex]
    });
    
    res.json(courses[courseIndex]);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;