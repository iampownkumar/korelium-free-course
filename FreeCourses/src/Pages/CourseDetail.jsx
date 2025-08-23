import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  Share2,
  Heart,
  Play,
  Globe,
  Calendar,
  Bookmark,
  ChevronRight,
  Gift,
  Image as ImageIcon
} from 'lucide-react';

// API endpoint - Fixed to match your backend
const API_BASE_URL = 'http://localhost:9000/api';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Simplified state management
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Helper function to safely parse JSON strings
  const safeParse = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    try {
      return JSON.parse(str);
    } catch (error) {
      console.warn('Failed to parse JSON:', str);
      return [];
    }
  };

  // Helper function to get proper image URL
  const getImageUrl = (imageField) => {
    console.log('🖼️ Processing image field:', imageField);
    
    if (!imageField) {
      console.log('🖼️ No image field, using fallback');
      return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
    }

    // If it's already a full URL, use it
    if (imageField.startsWith('http://') || imageField.startsWith('https://')) {
      console.log('🖼️ Using full URL:', imageField);
      return imageField;
    }

    // If it starts with /, it's a relative path from server root
    if (imageField.startsWith('/')) {
      const fullUrl = `http://localhost:9000${imageField}`;
      console.log('🖼️ Constructed full URL:', fullUrl);
      return fullUrl;
    }

    // Otherwise, assume it's a filename in uploads directory
    const fullUrl = `http://localhost:9000/${imageField}`;
    console.log('🖼️ Constructed upload URL:', fullUrl);
    return fullUrl;
  };

  // Single useEffect for fetching course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!slug) {
        setError('No course slug provided');
        setLoading(false);
        return;
      }

      console.log('🚀 Starting fetch for slug:', slug);
      setLoading(true);
      setError(null);
      
      try {
        const url = `${API_BASE_URL}/course/${slug}`;
        console.log('📡 Fetching from:', url);
        
        const response = await fetch(url);
        console.log('📊 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Course not found`);
        }
        
        const result = await response.json();
        console.log('📦 Raw API response:', result);
        
        // Handle different response formats
        let courseData;
        if (result.success && result.data) {
          courseData = result.data;
        } else if (result.data) {
          courseData = result.data;
        } else {
          courseData = result;
        }
        
        console.log('🎯 Extracted course data:', courseData);
        console.log('🖼️ Raw image field:', courseData.image);
        
        if (!courseData || !courseData.title) {
          throw new Error('Invalid course data received');
        }
        
        // Parse JSON fields safely
        const processedCourse = {
          ...courseData,
          tags: safeParse(courseData.tags),
          whatYoullLearn: safeParse(courseData.whatYoullLearn)
        };
        
        console.log('✅ Final processed course:', processedCourse);
        setCourse(processedCourse);
        
        // Update page title
        document.title = `${processedCourse.title} - Free Course`;
        
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(err.message);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [slug]);

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: course.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link');
      }
    }
  };

  const handleImageError = () => {
    console.error('🖼️ Image failed to load:', getImageUrl(course?.image));
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('🖼️ Image loaded successfully:', getImageUrl(course?.image));
    setImageLoaded(true);
  };

  const generateSlug = (categoryName) => {
    return categoryName?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
  };

  // Debug current state
  console.log('🔍 Component state:', { 
    slug, 
    loading, 
    error, 
    hasCourse: !!course,
    courseTitle: course?.title,
    imageError,
    imageLoaded
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-6"></div>
            <p className="text-gray-600 text-xl">Loading course details...</p>
            <p className="text-gray-500 text-sm mt-2">Course: {slug}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-red-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Error: {error}
            </p>
            <p className="text-gray-500 mb-8 text-sm">
              Slug: {slug}
            </p>
            <div className="space-y-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <ArrowLeft size={18} />
                Browse All Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No course data state
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Course Data</h2>
            <p className="text-gray-600 mb-4">Course data is not available.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get the proper image URL
  const imageUrl = imageError 
    ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'
    : getImageUrl(course.image);

  // Main course display
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">Home</Link>
            <ChevronRight className="text-gray-400" size={16} />
            <Link 
              to={`/?category=${generateSlug(course.category)}`} 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {course.category || 'Courses'}
            </Link>
            <ChevronRight className="text-gray-400" size={16} />
            <span className="text-gray-600 truncate font-medium">{course.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="relative">
                {/* Image Container with Loading State */}
                <div className="relative w-full h-64 sm:h-96 bg-gradient-to-br from-gray-200 to-gray-300">
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                  )}
                  
                  <img 
                    src={imageUrl}
                    alt={course.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                  
                  {imageError && !imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <div className="text-center text-gray-500">
                        <ImageIcon size={48} className="mx-auto mb-2" />
                        <p className="text-sm">Image not available</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Floating Action Buttons */}
                <div className="absolute top-6 right-6 flex gap-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
                      isLiked 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-white/20 text-white hover:bg-red-500'
                    }`}
                  >
                    <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
                      isBookmarked 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-white/20 text-white hover:bg-blue-500'
                    }`}
                  >
                    <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-green-500 transition-all duration-300"
                  >
                    <Share2 size={20} />
                  </button>
                </div>

                {/* Course Badges */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 backdrop-blur-md ${getLevelColor(course.level || 'Beginner')}`}>
                      {course.level || 'Beginner'} Level
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold">
                      {course.category}
                    </span>
                    <span className="bg-green-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1">
                      <Gift size={14} />
                      100% Free
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Rest of your component remains the same... */}
              {/* Course Content */}
              <div className="p-8 lg:p-12">
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {course.fullDescription || course.description || 'Transform your skills with this comprehensive course'}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12 p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mx-auto mb-3 shadow-lg shadow-blue-500/25">
                      <Users className="text-white" size={24} />
                    </div>
                    <div className="text-3xl font-black text-gray-900">
                      {course.studentsCount ? course.studentsCount.toLocaleString() : '2,547'}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">Students Enrolled</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl mx-auto mb-3 shadow-lg shadow-yellow-500/25">
                      <Star className="text-white fill-current" size={24} />
                    </div>
                    <div className="text-3xl font-black text-gray-900">{course.rating || '4.8'}</div>
                    <div className="text-sm font-semibold text-gray-600">Course Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mx-auto mb-3 shadow-lg shadow-green-500/25">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div className="text-3xl font-black text-gray-900">{course.duration || '15h'}</div>
                    <div className="text-sm font-semibold text-gray-600">Total Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mx-auto mb-3 shadow-lg shadow-purple-500/25">
                      <Award className="text-white" size={24} />
                    </div>
                    <div className="text-3xl font-black text-gray-900">Yes</div>
                    <div className="text-sm font-semibold text-gray-600">Certificate</div>
                  </div>
                </div>
                
                {/* What you'll learn */}
                {course.whatYoullLearn && course.whatYoullLearn.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="text-white" size={24} />
                      </div>
                      What you'll master
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {course.whatYoullLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-md transition-all duration-300">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle className="text-white" size={16} />
                          </div>
                          <span className="text-gray-800 font-medium leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Prerequisites */}
                {course.prerequisites && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Shield className="text-white" size={20} />
                      </div>
                      Prerequisites
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
                      <p className="text-gray-800 leading-relaxed text-lg">
                        {course.prerequisites}
                      </p>
                    </div>
                  </div>
                )}

                {/* Debug Section - Remove this in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-bold mb-2">Debug Info:</h4>
                    <p className="text-sm">Raw image field: {JSON.stringify(course.image)}</p>
                    <p className="text-sm">Constructed URL: {imageUrl}</p>
                    <p className="text-sm">Image Error: {imageError ? 'Yes' : 'No'}</p>
                    <p className="text-sm">Image Loaded: {imageLoaded ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar - Keep the rest of your sidebar code the same */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24 border border-gray-100">
              {/* Price Section */}
              <div className="text-center mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <div className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  FREE
                </div>
                <div className="text-gray-500 text-lg line-through mb-2">
                  Usually ${course.originalPrice || '89.99'}
                </div>
                <div className="text-green-600 text-lg font-bold">
                  🎉 100% Off - Limited Time!
                </div>
              </div>
              
              {/* Course Details */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-3 font-medium">
                    <Users size={20} />
                    Instructor:
                  </span>
                  <span className="font-bold text-blue-600 text-right">
                    {course.instructor || 'Expert Instructor'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-3 font-medium">
                    <Clock size={20} />
                    Duration:
                  </span>
                  <span className="font-bold">{course.duration || '15 hours'}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-3 font-medium">
                    <TrendingUp size={20} />
                    Level:
                  </span>
                  <span className={`font-bold px-4 py-2 rounded-xl text-sm ${getLevelColor(course.level || 'Beginner')}`}>
                    {course.level || 'Beginner'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-3 font-medium">
                    <Globe size={20} />
                    Language:
                  </span>
                  <span className="font-bold">{course.language || 'English'}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="text-gray-600 flex items-center gap-3 font-medium">
                    <Calendar size={20} />
                    Updated:
                  </span>
                  <span className="font-bold">
                    {new Date(course.lastUpdated || Date.now()).getFullYear()}
                  </span>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="space-y-4 mb-8">
                <a
                  href={course.udemyLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black py-5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
                >
                  <Play size={24} />
                  Start Learning Now!
                </a>

                <Link
                  to="/"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <ArrowLeft size={20} />
                  Browse More Courses
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-3 text-green-700 font-bold mb-4 text-lg">
                  <Shield size={20} />
                  Why Trust This Course?
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-green-600 font-medium">
                    <CheckCircle size={16} />
                    <span>Verified instructor & content</span>
                  </li>
                  <li className="flex items-center gap-3 text-green-600 font-medium">
                    <CheckCircle size={16} />
                    <span>30-day money-back guarantee</span>
                  </li>
                  <li className="flex items-center gap-3 text-green-600 font-medium">
                    <CheckCircle size={16} />
                    <span>Lifetime access included</span>
                  </li>
                  <li className="flex items-center gap-3 text-green-600 font-medium">
                    <CheckCircle size={16} />
                    <span>Learn on any device</span>
                  </li>
                </ul>
              </div>
              
              {/* Course Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
                    <BookOpen size={20} />
                    Course Topics
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {course.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm px-4 py-2 rounded-full font-semibold hover:from-blue-200 hover:to-purple-200 transition-colors duration-200 cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
