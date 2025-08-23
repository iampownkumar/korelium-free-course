import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  Award, 
  Shield, 
  BookOpen,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Globe,
  Heart,
  Share2,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:9000/api';

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

// Generate slug from category name
const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// API Functions
const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/course-categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const result = await response.json();
    
    const data = result.success ? result.data : (Array.isArray(result) ? result : []);
    
    // Add "All Categories" option and transform categories
    return [
      { id: 'all', name: 'All Categories', slug: 'all', courseCount: 0 },
      ...data.map((cat, index) => ({
        id: cat.id || index + 1,
        name: cat.name,
        slug: generateSlug(cat.name),
        courseCount: cat.courseCount || 0
      }))
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [
      { id: 'all', name: 'All Categories', slug: 'all', courseCount: 0 },
      { id: 1, name: 'Web Development', slug: 'web-development', courseCount: 0 },
      { id: 2, name: 'Backend Development', slug: 'backend-development', courseCount: 0 }
    ];
  }
};

const fetchCourses = async (categorySlug = 'all', page = 1, limit = 12) => {
  try {
    let url = `${API_BASE_URL}/courses/category/${categorySlug}?page=${page}&limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch courses');
    
    const result = await response.json();
    if (result.success) {
      return {
        courses: result.data.courses || [],
        category: result.data.category || null,
        pagination: result.data.pagination || null
      };
    } else {
      throw new Error(result.message || 'Failed to fetch courses');
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { courses: [], category: null, pagination: null };
  }
};

const CourseHome = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [itemsPerPage] = useState(9);
  const [pageTransitioning, setPageTransitioning] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Restore state from URL parameters only after categories are loaded
  useEffect(() => {
    if (categoriesLoading) return; // Wait for categories to load
    
    const categoryFromUrl = searchParams.get('category') || 'all';
    const searchFromUrl = searchParams.get('search') || '';
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    
    // Validate category exists
    const validCategory = categories.find(cat => cat.slug === categoryFromUrl);
    const finalCategory = validCategory ? categoryFromUrl : 'all';
    
    setSelectedCategory(finalCategory);
    setSearchTerm(searchFromUrl);
    setCurrentPage(pageFromUrl);
  }, [searchParams, categories, categoriesLoading]);

  // Fetch courses when category or page changes
  useEffect(() => {
    if (categoriesLoading) return; // Don't fetch courses until categories are loaded

    const loadCourses = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchCourses(selectedCategory, currentPage, itemsPerPage);
        setAllCourses(result.courses);
        setCategoryInfo(result.category);
        setPagination(result.pagination);
      } catch (err) {
        setError('Failed to load courses');
        setAllCourses([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
        setPageTransitioning(false);
      }
    };

    loadCourses();
  }, [selectedCategory, currentPage, itemsPerPage, categoriesLoading]);

  // Frontend search filtering and URL parameter management
  useEffect(() => {
    let filtered = allCourses;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = allCourses.filter(course => {
        const tags = safeParse(course.tags);
        const learningOutcomes = safeParse(course.whatYoullLearn);
        
        return (
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.fullDescription?.toLowerCase().includes(searchLower) ||
          course.instructor?.toLowerCase().includes(searchLower) ||
          course.category?.toLowerCase().includes(searchLower) ||
          tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          learningOutcomes.some(outcome => outcome.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredCourses(filtered);

    // Update URL parameters
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchTerm.trim()) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', currentPage);
    
    const newParams = params.toString();
    const currentParams = searchParams.toString();
    if (newParams !== currentParams) {
      setSearchParams(params);
    }
  }, [allCourses, searchTerm, selectedCategory, currentPage, searchParams, setSearchParams]);

  // Event handlers
  const handlePageChange = useCallback((page) => {
    if (page === currentPage || pageTransitioning) return;
    
    setPageTransitioning(true);
    setCurrentPage(page);
    
    // Smooth scroll to top with transition
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  }, [currentPage, pageTransitioning]);

  const handleCategoryChange = useCallback((categorySlug) => {
    if (categorySlug === selectedCategory) return;
    
    setSelectedCategory(categorySlug);
    setSearchTerm('');
    setCurrentPage(1);
    setPageTransitioning(true);
  }, [selectedCategory]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSearchTerm('');
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams]);

  // Navigate to course detail page using slug
  const handleCourseClick = useCallback((course) => {
    const slug = course.slug || course.id;
    navigate(`/course/${encodeURIComponent(slug)}`);
  }, [navigate]);

  // Get level styling
  const getLevelStyling = (level) => {
    const levelLower = (level || 'beginner').toLowerCase();
    switch (levelLower) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Enhanced Pagination Component
  const PaginationComponent = ({ pagination, currentPage, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { totalPages, hasNextPage, hasPrevPage, totalCourses } = pagination;
    
    // Generate page numbers array
    const generatePageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 7;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        
        if (currentPage > 4) {
          pages.push('...');
        }
        
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
          pages.push(i);
        }
        
        if (currentPage < totalPages - 3) {
          pages.push('...');
        }
        
        pages.push(totalPages);
      }
      
      return pages;
    };

    const pageNumbers = generatePageNumbers();

    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 mt-12 border border-gray-100">
        <div className="text-sm text-gray-600 mb-8 text-center">
          Showing page <span className="font-bold text-blue-600">{currentPage}</span> of{' '}
          <span className="font-bold text-blue-600">{totalPages}</span>{' '}
          <span className="text-gray-500">({totalCourses.toLocaleString()} total courses)</span>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage || pageTransitioning}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              hasPrevPage && !pageTransitioning
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-2">
            {pageNumbers.map((page, index) => (
              <button
                key={index}
                onClick={() => page !== '...' && onPageChange(page)}
                disabled={page === '...' || pageTransitioning}
                className={`min-w-[44px] h-11 rounded-xl font-bold text-sm transition-all duration-300 ${
                  page === currentPage
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-110 ring-4 ring-blue-200'
                    : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-105 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage || pageTransitioning}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              hasNextPage && !pageTransitioning
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Quick jump controls */}
        <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || pageTransitioning}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              currentPage === 1 || pageTransitioning
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            First Page
          </button>
          
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || pageTransitioning}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              currentPage === totalPages || pageTransitioning
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            Last Page
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Course Card Component
  const CourseCard = ({ course }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const tags = safeParse(course.tags);
    const imageUrl = course.image 
      ? (course.image.startsWith('http') ? course.image : `http://localhost:9000/${course.image}`)
      : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop';

    return (
      <article className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-3 hover:scale-[1.02] relative">
        {/* Course Image */}
        <div className="relative overflow-hidden">
          <div className={`w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 ${!imageLoaded ? 'animate-pulse' : ''}`}>
            <img
              src={imageUrl}
              alt={course.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
          
          {/* Enhanced overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
                  isLiked ? 'bg-red-500 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-red-500'
                }`}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Add share functionality
                }}
                className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-blue-500 transition-all duration-300 transform hover:scale-110"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
          
          {/* Enhanced badges */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <Shield size={12} />
              Verified
            </div>
          </div>
          
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-lg backdrop-blur-sm ${getLevelStyling(course.level)}`}>
              {course.level || 'Beginner'}
            </span>
          </div>
        </div>

        {/* Enhanced Course Content */}
        <div className="p-7 space-y-5">
          {/* Category with enhanced styling */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"></div>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">{course.category}</span>
          </div>

          {/* Enhanced title */}
          <h2 className="font-black text-xl text-gray-900 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 cursor-pointer leading-tight"
              onClick={() => handleCourseClick(course)}>
            {course.title}
          </h2>

          {/* Enhanced description */}
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {course.description}
          </p>

          {/* Enhanced course stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="text-blue-600" size={16} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Students</div>
                <div className="font-bold text-sm text-gray-900">{course.students?.toLocaleString() || '1K+'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center shadow-sm">
                <Star className="text-yellow-600 fill-current" size={16} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Rating</div>
                <div className="font-bold text-sm text-gray-900">{course.rating || '4.5'}</div>
              </div>
            </div>
          </div>

          {/* Enhanced instructor and duration */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">{course.instructor?.charAt(0) || 'I'}</span>
              </div>
              <span className="truncate font-medium text-gray-700">{course.instructor || 'Expert Instructor'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={14} />
              <span className="font-medium">{course.duration || '10h'}</span>
            </div>
          </div>

          {/* Enhanced tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 hover:shadow-sm transition-shadow duration-200"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1.5 font-medium">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Enhanced action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleCourseClick(course)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%]"></div>
              <BookOpen size={16} />
              View Course
            </button>
            {course.udemyLink && (
              <a
                href={course.udemyLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          {/* Enhanced trust indicators */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="flex items-center gap-4 text-xs">
              {course.certificate && (
                <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                  <Award size={12} />
                  <span>Certificate</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <Globe size={12} />
                <span>{course.language || 'English'}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Updated {new Date(course.lastUpdated || Date.now()).getFullYear()}
            </div>
          </div>
        </div>
      </article>
    );
  };

  // Show loading state until both categories and initial course data are loaded
  const isInitialLoading = categoriesLoading || (isLoading && !allCourses.length && !error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
              Free <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Premium</span> Courses
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Unlock your potential with verified courses from top instructors. Learn at your own pace and earn certificates that matter.
            </p>
            
            {/* Enhanced trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <CheckCircle className="text-white" size={28} />
                </div>
                <div className="text-center">
                  <div className="font-black text-3xl mb-2">1000+</div>
                  <div className="text-sm text-gray-300 font-medium">Free Courses</div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Users className="text-white" size={28} />
                </div>
                <div className="text-center">
                  <div className="font-black text-3xl mb-2">50K+</div>
                  <div className="text-sm text-gray-300 font-medium">Happy Students</div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Award className="text-white" size={28} />
                </div>
                <div className="text-center">
                  <div className="font-black text-3xl mb-2">100%</div>
                  <div className="text-sm text-gray-300 font-medium">Free & Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section - Fixed Layout */}
      <div className="top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar - Full Width Top Row */}
          <div className="mb-6">
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={22} />
              </div>
              <input
                type="text"
                placeholder="Search courses, instructors, topics..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-lg text-lg placeholder-gray-400 font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Categories Filter - Separate Row */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Filter className="text-gray-600" size={20} />
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Categories</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {categoriesLoading ? (
                // Loading skeleton for categories
                <div className="flex gap-3">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.slug)}
                    disabled={pageTransitioning}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 border-2 ${
                      selectedCategory === category.slug
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-transparent ring-4 ring-blue-200'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {category.name}
                    {category.courseCount > 0 && (
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        selectedCategory === category.slug
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {category.courseCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Clear Filters Button */}
            {(selectedCategory !== 'all' || searchTerm) && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 font-medium">
              {isInitialLoading ? (
                <div className="animate-pulse">Loading courses...</div>
              ) : (
                <>
                  {pagination && !searchTerm ? (
                    <>
                      Showing <span className="font-bold text-blue-600">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                      <span className="font-bold text-blue-600">
                        {Math.min(currentPage * itemsPerPage, pagination.totalCourses)}
                      </span> of{' '}
                      <span className="font-bold text-blue-600">{pagination.totalCourses.toLocaleString()}</span> courses
                    </>
                  ) : (
                    <>
                      Found <span className="font-bold text-blue-600">{filteredCourses.length}</span> courses
                    </>
                  )}
                  {categoryInfo?.name && categoryInfo.name !== 'All Categories' && (
                    <> in <span className="font-bold text-purple-600">{categoryInfo.name}</span></>
                  )}
                  {searchTerm && (
                    <> matching "<span className="font-bold text-green-600">{searchTerm}</span>"</>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <ExternalLink className="text-red-600" size={40} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Enhanced Loading State */}
        {isInitialLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                <div className="p-7 space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-300 rounded-xl"></div>
                    <div className="h-10 bg-gray-300 rounded-xl"></div>
                  </div>
                  <div className="h-12 bg-gray-300 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced No Results */}
        {!isInitialLoading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="text-blue-600" size={48} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">No courses found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              We couldn't find any courses matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All Courses
            </button>
          </div>
        )}

        {/* Enhanced Course Grid */}
        {!isInitialLoading && !error && filteredCourses.length > 0 && (
          <div className={`transition-opacity duration-500 ${pageTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            
            {/* Enhanced Pagination Component - Only show when not searching */}
            {!searchTerm && (
              <PaginationComponent 
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Enhanced Trust Section */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-6">Why Choose Our Platform?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              We're committed to providing you with the best learning experience through verified courses and trusted instructors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">100% Verified</h3>
              <p className="text-gray-600 leading-relaxed">All courses are verified and from legitimate sources</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Award className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Certificates Included</h3>
              <p className="text-gray-600 leading-relaxed">Earn certificates upon course completion</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Sparkles className="text-purple-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Always Updated</h3>
              <p className="text-gray-600 leading-relaxed">Fresh courses added daily from top platforms</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Users className="text-orange-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Community Support</h3>
              <p className="text-gray-600 leading-relaxed">Join our active community of learners</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHome;
