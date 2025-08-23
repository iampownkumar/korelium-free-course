import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  BarChart3, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Upload,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  Users,
  Star,
  Award,
  Calendar,
  XCircle,
  Image as ImageIcon
} from 'lucide-react';

// Auth Manager (same as before)
class AuthManager {
  static getToken() {
    return localStorage.getItem('adminToken');
  }

  static setToken(token) {
    localStorage.setItem('adminToken', token);
  }

  static removeToken() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static getUserInfo() {
    return localStorage.getItem('adminUsername') || 'Admin';
  }

  static getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static getFormDataHeaders() {
    const headers = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }
}

// API Service (same as before)
class APIService {
  static BASE_URL = 'http://localhost:9000';

  static async getAdminCourses() {
    try {
      const response = await fetch(`${this.BASE_URL}/api/courses`, {
        method: 'GET',
        headers: AuthManager.getHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          AuthManager.removeToken();
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching admin courses:', error);
      throw error;
    }
  }

  static async createCourse(courseData) {
    try {
      const formData = new FormData();
      
      Object.keys(courseData).forEach(key => {
        if (key === 'image' && courseData[key] instanceof File) {
          formData.append('image', courseData[key]);
        } else if (Array.isArray(courseData[key])) {
          formData.append(key, JSON.stringify(courseData[key]));
        } else if (courseData[key] !== null && courseData[key] !== undefined) {
          formData.append(key, courseData[key]);
        }
      });

      const response = await fetch(`${this.BASE_URL}/api/courses`, {
        method: 'POST',
        headers: AuthManager.getFormDataHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  static async updateCourse(courseId, courseData) {
    try {
      const formData = new FormData();
      
      Object.keys(courseData).forEach(key => {
        if (key === 'image' && courseData[key] instanceof File) {
          formData.append('image', courseData[key]);
        } else if (Array.isArray(courseData[key])) {
          formData.append(key, JSON.stringify(courseData[key]));
        } else if (courseData[key] !== null && courseData[key] !== undefined) {
          formData.append(key, courseData[key]);
        }
      });

      const response = await fetch(`${this.BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: AuthManager.getFormDataHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  static async deleteCourse(courseId) {
    try {
      const response = await fetch(`${this.BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: AuthManager.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
}

// CSV Export Utility
const exportToCSV = (courses) => {
  const headers = ['Title', 'Instructor', 'Category', 'Level', 'Duration', 'Rating', 'Students', 'Last Updated'];
  const csvContent = [
    headers.join(','),
    ...courses.map(course => [
      `"${course.title}"`,
      `"${course.instructor}"`,
      `"${course.category}"`,
      `"${course.level || 'N/A'}"`,
      `"${course.duration || 'N/A'}"`,
      course.rating || 0,
      course.studentsCount || 0,
      `"${course.lastUpdated ? new Date(course.lastUpdated).toLocaleDateString() : 'N/A'}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `courses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('stats');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    instructor: '',
    category: '',
    level: 'Beginner',
    language: 'English',
    duration: '',
    studentsCount: 0,
    rating: 4.5,
    lastUpdated: new Date().toISOString().split('T')[0],
    certificateAvailable: true,
    image: null,
    shortDescription: '',
    fullDescription: '',
    prerequisites: '',
    udemyLink: '',
    tags: '',
    whatYouLearn: ''
  });

  // Auto-dismiss messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check authentication on mount
  useEffect(() => {
    if (!AuthManager.isAuthenticated()) {
      navigate('/admin-login');
      return;
    }
    loadCourses();
  }, [navigate]);

  // Filter courses based on search and category
  useEffect(() => {
    let filtered = courses;
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [courses, searchTerm, selectedCategory]);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const coursesData = await APIService.getAdminCourses();
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Authentication failed')) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    AuthManager.removeToken();
    navigate('/admin-login');
  };

  const handleSectionChange = (section) => {
    setCurrentSection(section);
    // Clear messages when switching sections
    setError('');
    setSuccess('');
  };

  const dismissMessage = (type) => {
    if (type === 'success') setSuccess('');
    if (type === 'error') setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      // Image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Auto-generate slug from title
      if (name === 'title') {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Process form data
      const courseData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        whatYouLearn: formData.whatYouLearn.split('\n').map(item => item.trim()).filter(Boolean)
      };

      if (isEditing && editingCourseId) {
        await APIService.updateCourse(editingCourseId, courseData);
        setSuccess('Course updated successfully!');
      } else {
        await APIService.createCourse(courseData);
        setSuccess('Course created successfully!');
      }

      resetForm();
      await loadCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title,
      slug: course.slug,
      instructor: course.instructor,
      category: course.category,
      level: course.level || 'Beginner',
      language: course.language || 'English',
      duration: course.duration,
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 4.5,
      lastUpdated: course.lastUpdated ? course.lastUpdated.split('T')[0] : new Date().toISOString().split('T'),
      certificateAvailable: course.certificateAvailable !== false,
      image: null,
      shortDescription: course.shortDescription || '',
      fullDescription: course.fullDescription || '',
      prerequisites: course.prerequisites || '',
      udemyLink: course.udemyLink || '',
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
      whatYouLearn: Array.isArray(course.whatYouLearn) ? course.whatYouLearn.join('\n') : ''
    });
    setIsEditing(true);
    setEditingCourseId(course.id);
    setCurrentSection('add-course');
    setImagePreview(course.image);
    // Clear messages when editing
    setError('');
    setSuccess('');
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    setLoading(true);
    try {
      await APIService.deleteCourse(courseId);
      setSuccess('Course deleted successfully!');
      await loadCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      instructor: '',
      category: '',
      level: 'Beginner',
      language: 'English',
      duration: '',
      studentsCount: 0,
      rating: 4.5,
      lastUpdated: new Date().toISOString().split('T')[0],
      certificateAvailable: true,
      image: null,
      shortDescription: '',
      fullDescription: '',
      prerequisites: '',
      udemyLink: '',
      tags: '',
      whatYouLearn: ''
    });
    setIsEditing(false);
    setEditingCourseId(null);
    setImagePreview(null);
  };

  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 'Development',
    'Data Science', 'Web Development', 'Mobile Development'
  ];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Statistics calculations
  const stats = {
    totalCourses: courses.length,
    totalCategories: new Set(courses.map(c => c.category)).size,
    averageRating: courses.length > 0 ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(1) : '0',
    totalStudents: courses.reduce((acc, c) => acc + (c.studentsCount || 0), 0),
    categoryDistribution: categories.map(category => ({
      name: category,
      value: courses.filter(c => c.category === category).length
    })).filter(c => c.value > 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Admin Dashboard</h1>
                <p className="text-blue-200 text-sm">Welcome back, {AuthManager.getUserInfo()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <Eye size={16} />
                <span className="hidden sm:inline">View Website</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 text-red-300 hover:bg-red-500/30 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'stats', label: 'Analytics', icon: BarChart3 },
            { id: 'manage', label: 'Manage Courses', icon: BookOpen },
            { id: 'add-course', label: isEditing ? 'Edit Course' : 'Add Course', icon: isEditing ? Edit3 : Plus }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleSectionChange(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                currentSection === id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Enhanced Status Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="text-red-400 mr-3" size={20} />
                <p className="text-red-200">{error}</p>
              </div>
              <button
                onClick={() => dismissMessage('error')}
                className="text-red-300 hover:text-red-100 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6 animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="text-green-400 mr-3" size={20} />
                <p className="text-green-200">{success}</p>
              </div>
              <button
                onClick={() => dismissMessage('success')}
                className="text-green-300 hover:text-green-100 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Section */}
        {currentSection === 'stats' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/30 rounded-full">
                    <BookOpen className="text-blue-300" size={24} />
                  </div>
                  <TrendingUp className="text-blue-400" size={20} />
                </div>
                <div className="text-3xl font-bold text-blue-300 mb-2">{stats.totalCourses}</div>
                <div className="text-blue-200 text-sm">Total Courses</div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/30 rounded-full">
                    <Filter className="text-green-300" size={24} />
                  </div>
                  <TrendingUp className="text-green-400" size={20} />
                </div>
                <div className="text-3xl font-bold text-green-300 mb-2">{stats.totalCategories}</div>
                <div className="text-green-200 text-sm">Categories</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/30 rounded-full">
                    <Star className="text-yellow-300" size={24} />
                  </div>
                  <Award className="text-yellow-400" size={20} />
                </div>
                <div className="text-3xl font-bold text-yellow-300 mb-2">{stats.averageRating}</div>
                <div className="text-yellow-200 text-sm">Average Rating</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/30 rounded-full">
                    <Users className="text-purple-300" size={24} />
                  </div>
                  <TrendingUp className="text-purple-400" size={20} />
                </div>
                <div className="text-3xl font-bold text-purple-300 mb-2">{stats.totalStudents.toLocaleString()}</div>
                <div className="text-purple-200 text-sm">Total Students</div>
              </div>
            </div>

            {/* Charts and Export Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Category Distribution</h3>
                  <BarChart3 className="text-blue-400" size={24} />
                </div>
                <div className="space-y-3">
                  {stats.categoryDistribution.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-blue-200 flex-1">{category.name}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              index % 4 === 0 ? 'from-blue-500 to-blue-600' :
                              index % 4 === 1 ? 'from-green-500 to-green-600' :
                              index % 4 === 2 ? 'from-yellow-500 to-yellow-600' :
                              'from-purple-500 to-purple-600'
                            }`}
                            style={{ width: `${(category.value / stats.totalCourses) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-white font-semibold min-w-[2rem] text-right">{category.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Section */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Data Export</h3>
                  <Download className="text-green-400" size={24} />
                </div>
                <div className="space-y-4">
                  <p className="text-blue-200">Export your courses data for analysis or backup.</p>
                  <button
                    onClick={() => exportToCSV(courses)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Download size={16} />
                    Export Courses to CSV
                  </button>
                  <div className="text-sm text-blue-300 bg-blue-500/20 rounded-lg p-3">
                    <Calendar className="inline mr-2" size={16} />
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Manage Courses Section */}
        {currentSection === 'manage' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Courses</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportToCSV(courses)}
                  className="bg-green-500/20 text-green-300 hover:bg-green-500/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  onClick={loadCourses}
                  disabled={loading}
                  className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input
                  type="text"
                  placeholder="Search courses, instructors, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white"
              >
                <option value="" className="bg-gray-800">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <BookOpen size={48} className="mx-auto mb-4 text-blue-300" />
                <p>{courses.length === 0 ? 'No courses found. Add your first course!' : 'No courses match your search criteria.'}</p>
              </div>
            ) : (
              <>
                {/* Enhanced Course Table */}
                <div className="overflow-x-auto rounded-lg border border-white/20">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr className="border-b border-white/20">
                        <th className="text-left py-4 px-4 text-blue-200 font-medium">Image</th>
                        <th className="text-left py-4 px-4 text-blue-200 font-medium">Course Details</th>
                        <th className="text-left py-4 px-4 text-blue-200 font-medium">Instructor</th>
                        <th className="text-left py-4 px-4 text-blue-200 font-medium">Stats</th>
                        <th className="text-left py-4 px-4 text-blue-200 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCourses.map((course) => (
                        <tr key={course.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                              {course.image ? (
                                <img
                                  src={course.image}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`${course.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                                <ImageIcon className="text-blue-300" size={20} />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-white font-semibold mb-1">{course.title}</div>
                              <div className="text-sm text-blue-300 mb-1">{course.category} • {course.level}</div>
                              <div className="text-xs text-blue-400">{course.duration}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-blue-200">{course.instructor}</td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-yellow-300">
                                <Star size={14} className="mr-1" />
                                {course.rating || 'N/A'}
                              </div>
                              <div className="text-blue-200 text-sm">{(course.studentsCount || 0).toLocaleString()} students</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(course)}
                                className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 p-2 rounded-lg transition-colors transform hover:scale-110"
                                title="Edit course"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(course.id)}
                                className="bg-red-500/20 text-red-300 hover:bg-red-500/30 p-2 rounded-lg transition-colors transform hover:scale-110"
                                title="Delete course"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-blue-200 text-sm">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCourses.length)} of {filteredCourses.length} courses
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white/10 text-blue-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg text-sm transition-all ${
                              currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 text-blue-300 hover:bg-white/20'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-white/10 text-blue-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Enhanced Add/Edit Course Section */}
        {currentSection === 'add-course' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? 'Edit Course' : 'Add New Course'}
              </h2>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-blue-200 font-medium mb-2">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                    placeholder="course-slug"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Instructor *</label>
                  <input
                    type="text"
                    name="instructor"
                    required
                    value={formData.instructor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                    placeholder="Instructor name"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Category *</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white"
                  >
                    <option value="Beginner" className="bg-gray-800">Beginner</option>
                    <option value="Intermediate" className="bg-gray-800">Intermediate</option>
                    <option value="Advanced" className="bg-gray-800">Advanced</option>
                    <option value="All Levels" className="bg-gray-800">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                    placeholder="English"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                    placeholder="e.g., 4 hours"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Students Count</label>
                  <input
                    type="number"
                    name="studentsCount"
                    value={formData.studentsCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Rating</label>
                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 font-medium mb-2">Last Updated</label>
                  <input
                    type="date"
                    name="lastUpdated"
                    value={formData.lastUpdated}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white"
                  />
                </div>
              </div>

              {/* Certificate Available */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="certificateAvailable"
                  id="certificateAvailable"
                  checked={formData.certificateAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-400"
                />
                <label htmlFor="certificateAvailable" className="text-blue-200 font-medium">
                  Certificate Available
                </label>
              </div>

              {/* Enhanced Course Image */}
              <div>
                <label className="block text-blue-200 font-medium mb-2">Course Image</label>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30"
                    />
                    <p className="text-blue-300 text-sm mt-2">Recommended: 16:9 aspect ratio, max 2MB</p>
                  </div>
                  {imagePreview && (
                    <div className="lg:col-span-1">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white/10">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm">Preview</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-blue-200 font-medium mb-2">Short Description *</label>
                <textarea
                  name="shortDescription"
                  required
                  rows="3"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300 resize-vertical"
                  placeholder="Brief description of the course"
                />
              </div>

              <div>
                <label className="block text-blue-200 font-medium mb-2">Full Description</label>
                <textarea
                  name="fullDescription"
                  rows="5"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300 resize-vertical"
                  placeholder="Detailed description of the course"
                />
              </div>

              <div>
                <label className="block text-blue-200 font-medium mb-2">Prerequisites</label>
                <textarea
                  name="prerequisites"
                  rows="3"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300 resize-vertical"
                  placeholder="What students need to know before taking this course"
                />
              </div>

              <div>
                <label className="block text-blue-200 font-medium mb-2">Udemy Course Link *</label>
                <input
                  type="url"
                  name="udemyLink"
                  required
                  value={formData.udemyLink}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                  placeholder="https://udemy.com/course/..."
                />
              </div>

              <div>
                <label className="block text-blue-200 font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300"
                  placeholder="react, javascript, web development"
                />
              </div>

              <div>
                <label className="block text-blue-200 font-medium mb-2">What You'll Learn (one per line)</label>
                <textarea
                  name="whatYouLearn"
                  rows="5"
                  value={formData.whatYouLearn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-blue-300 resize-vertical"
                  placeholder="Build React applications&#10;Master JavaScript fundamentals&#10;Deploy web applications"
                />
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {isEditing ? 'Update Course' : 'Add Course'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
                >
                  <X size={16} />
                  {isEditing ? 'Cancel Edit' : 'Reset Form'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
