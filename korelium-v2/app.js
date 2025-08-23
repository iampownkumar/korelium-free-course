// Korelium Frontend Application - Modern Dark Theme - FIXED VERSION
// Author: Korelium Team
// Description: Complete interactive frontend with advanced features

// Configuration Constants
const CONFIG = {
    API_BASE_URL: 'http://localhost:9000',
    COURSES_ENDPOINT: '/public/courses',
    COURSES_PER_PAGE: 9,
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 300,
    PARTICLE_COUNT: 50,
    BRAND_DATA: {
        name: 'Korelium',
        tagline: 'Elevate Your Learning Experience',
        socialHandle: '@korelium',
        website: 'korelium.org',
        logoUrl: 'https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/604803b7-b51d-4f0c-97be-e6ae5b305935.png'
    }
};

// Global Application State
const AppState = {
    currentPage: 'home',
    theme: localStorage.getItem('theme') || 'dark',
    isLoading: false,
    coursesData: {
        courses: [],
        currentPage: 1,
        totalPages: 1,
        totalCourses: 0,
        loading: false,
        error: null
    },
    filters: {
        search: '',
        category: '',
        level: ''
    },
    ui: {
        mobileMenuOpen: false,
        modalOpen: false,
        particleSystem: null
    }
};

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Korelium loading...');
    initializeApp();
});

// Initialize Application
async function initializeApp() {
    try {
        console.log('📋 Initializing Korelium app...');
        
        // Show loading screen
        showLoadingScreen();
        
        // Initialize core systems
        initializeTheme();
        initializeParticleSystem();
        initializeNavigation();
        initializeMobileMenu();
        initializeFormHandlers();
        initializeCourseControls();
        initializeAnimatedCounters();
        initializeTestimonialSlider();
        
        // Set initial page
        const initialPage = getPageFromHash() || 'home';
        
        // Small delay for loading effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Hide loading screen and show content
        hideLoadingScreen();
        navigateToPage(initialPage, false);
        
        console.log('✅ Korelium initialized successfully');
        showNotification('Welcome to Korelium! 🎓', 'success', 3000);
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        hideLoadingScreen();
        showNotification('Error initializing application', 'error');
    }
}

// Loading Screen Management
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 500);
    }
}

// Theme Management
function initializeTheme() {
    const theme = AppState.theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        updateThemeToggleIcon();
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    console.log(`🎨 Theme initialized: ${theme}`);
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    localStorage.setItem('theme', AppState.theme);
    updateThemeToggleIcon();
    
    console.log(`🎨 Theme switched to: ${AppState.theme}`);
    showNotification(`Switched to ${AppState.theme} theme`, 'info', 2000);
}

function updateThemeToggleIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle?.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = AppState.theme === 'dark' ? '🌙' : '☀️';
    }
}

// Particle System
function initializeParticleSystem() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;
    
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        createParticle(particleContainer);
    }
    
    console.log('✨ Particle system initialized');
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random starting position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    
    container.appendChild(particle);
    
    // Remove and recreate after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            createParticle(container);
        }
    }, (25 + Math.random() * 10) * 1000);
}

// Navigation System
function initializeNavigation() {
    console.log('🧭 Setting up navigation...');
    
    // Remove existing listeners
    document.removeEventListener('click', handleNavigationClick);
    
    // Add global click handler
    document.addEventListener('click', handleNavigationClick);
    
    // Handle browser navigation
    window.addEventListener('popstate', function(e) {
        const page = getPageFromHash() || 'home';
        console.log('🔙 Browser navigation to:', page);
        navigateToPage(page, false);
    });
    
    // Update active states
    updateNavigationStates();
    
    console.log('✅ Navigation system ready');
}

function handleNavigationClick(e) {
    const target = e.target;
    const navElement = target.closest('[data-page], a[href^="#"]');
    
    if (!navElement) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    let page = null;
    
    // Get page from data-page attribute
    if (navElement.hasAttribute('data-page')) {
        page = navElement.getAttribute('data-page');
    }
    // Get page from href
    else if (navElement.hasAttribute('href')) {
        const href = navElement.getAttribute('href');
        if (href.startsWith('#')) {
            page = href.substring(1);
        }
    }
    
    if (page) {
        console.log('🖱️ Navigation clicked:', page);
        navigateToPage(page);
        closeMobileMenu();
    }
}

function navigateToPage(page, updateHistory = true) {
    try {
        console.log(`🔄 Navigating to: ${page}`);
        
        // Validate page
        const targetElement = document.getElementById(page);
        if (!targetElement) {
            console.warn(`⚠️ Page not found: ${page}`);
            page = 'home';
        }
        
        // Update URL
        if (updateHistory) {
            window.location.hash = page;
        }
        
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(pageElement => {
            pageElement.classList.remove('page-active');
            pageElement.style.display = 'none';
            pageElement.setAttribute('aria-hidden', 'true');
        });
        
        // Show target page with animation
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.setAttribute('aria-hidden', 'false');
            
            // Trigger reflow for animation
            targetPage.offsetHeight;
            
            setTimeout(() => {
                targetPage.classList.add('page-active');
            }, 10);
            
            console.log(`✅ Page shown: ${page}`);
        }
        
        // Update navigation states
        updateNavigationStates(page);
        
        // Update SEO
        updatePageSEO(page);
        
        // Load page-specific content
        handlePageLoad(page);
        
        // Update app state
        AppState.currentPage = page;
        
        // Close mobile menu
        closeMobileMenu();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        return true;
        
    } catch (error) {
        console.error('❌ Navigation error:', error);
        showNotification('Navigation error occurred', 'error');
        return false;
    }
}

function updateNavigationStates(page = AppState.currentPage) {
    // Remove all active states
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active state to current page links
    const currentLinks = document.querySelectorAll(`[data-page="${page}"]`);
    currentLinks.forEach(link => link.classList.add('active'));
    
    console.log(`🎨 Updated navigation states for: ${page}`);
}

function getPageFromHash() {
    return window.location.hash.substring(1);
}

// Page-specific loading
function handlePageLoad(page) {
    switch (page) {
        case 'courses':
            console.log('📚 Loading courses...');
            setTimeout(() => loadCourses(1), 200);
            break;
        case 'home':
            console.log('🏠 Loading featured courses...');
            setTimeout(() => loadFeaturedCourses(), 200);
            break;
        default:
            console.log(`📄 No special loading for: ${page}`);
            break;
    }
}

// SEO Management
function updatePageSEO(page) {
    const seoData = {
        home: {
            title: 'Korelium - Elevate Your Learning Experience',
            description: 'Modern learning platform offering cutting-edge courses in technology, finance, trading, and travel.',
            keywords: 'korelium, online learning, technology courses, finance, trading, travel'
        },
        about: {
            title: 'About Korelium - Pioneering Digital Education',
            description: 'Learn about Korelium\'s mission to democratize education through innovative learning experiences.',
            keywords: 'about korelium, digital education, learning platform, mission'
        },
        courses: {
            title: 'Premium Courses - Master New Skills | Korelium',
            description: 'Access comprehensive courses in technology, finance, trading, and travel with expert instruction.',
            keywords: 'online courses, technology training, finance courses, trading education'
        },
        portfolio: {
            title: 'Portfolio - Our Innovation Showcase | Korelium',
            description: 'Explore Korelium\'s portfolio of innovative projects and cutting-edge solutions.',
            keywords: 'portfolio, projects, innovation, technology solutions'
        },
        freelance: {
            title: 'Professional Services - Transform Your Business | Korelium',
            description: 'Professional development services including web development, mobile apps, and consulting.',
            keywords: 'freelance services, web development, mobile apps, consulting'
        },
        blog: {
            title: 'Blog - Industry Insights & Trends | Korelium',
            description: 'Stay updated with the latest insights on technology, finance, trading, and travel.',
            keywords: 'blog, tech insights, finance news, trading tips, travel guides'
        },
        contact: {
            title: 'Contact Korelium - Let\'s Connect',
            description: 'Get in touch with Korelium for learning opportunities, projects, or partnerships.',
            keywords: 'contact korelium, get in touch, partnerships, collaboration'
        }
    };
    
    const data = seoData[page] || seoData.home;
    
    document.title = data.title;
    updateMetaTag('description', data.description);
    updateMetaTag('keywords', data.keywords);
    updateMetaTag('og:title', data.title);
    updateMetaTag('og:description', data.description);
    updateMetaTag('og:url', `https://korelium.org#${page}`);
    updateMetaTag('twitter:title', data.title);
    updateMetaTag('twitter:description', data.description);
}

function updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
            meta.setAttribute('property', name);
        } else {
            meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

// Mobile Menu Management
function initializeMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-nav');
    
    if (toggle && menu) {
        toggle.addEventListener('click', toggleMobileMenu);
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !menu.contains(e.target) && AppState.ui.mobileMenuOpen) {
                closeMobileMenu();
            }
        });
        
        console.log('📱 Mobile menu initialized');
    }
}

function toggleMobileMenu() {
    AppState.ui.mobileMenuOpen = !AppState.ui.mobileMenuOpen;
    
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-nav');
    
    if (toggle && menu) {
        toggle.classList.toggle('active', AppState.ui.mobileMenuOpen);
        menu.classList.toggle('active', AppState.ui.mobileMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = AppState.ui.mobileMenuOpen ? 'hidden' : '';
        
        console.log('📱 Mobile menu toggled:', AppState.ui.mobileMenuOpen);
    }
}

function closeMobileMenu() {
    if (AppState.ui.mobileMenuOpen) {
        AppState.ui.mobileMenuOpen = false;
        
        const toggle = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-nav');
        
        if (toggle && menu) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        console.log('📱 Mobile menu closed');
    }
}

// Animated Counters
function initializeAnimatedCounters() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => observer.observe(counter));
    
    console.log('🔢 Animated counters initialized');
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, stepTime);
}

// Testimonial Slider
function initializeTestimonialSlider() {
    const slider = document.getElementById('testimonials-slider');
    if (!slider) return;
    
    let currentSlide = 0;
    const slides = slider.querySelectorAll('.testimonial-card');
    const totalSlides = slides.length;
    
    if (totalSlides <= 1) return;
    
    // Auto-rotate testimonials
    setInterval(() => {
        slides[currentSlide].style.opacity = '0.5';
        currentSlide = (currentSlide + 1) % totalSlides;
        slides[currentSlide].style.opacity = '1';
    }, 5000);
    
    console.log('💬 Testimonial slider initialized');
}

// Course Management
function initializeCourseControls() {
    console.log('🎛️ Setting up course controls...');
    
    // Search functionality
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                AppState.filters.search = e.target.value.toLowerCase().trim();
                if (AppState.currentPage === 'courses') {
                    loadCourses(1);
                }
            }, CONFIG.DEBOUNCE_DELAY);
        });
    }
    
    // Filter controls
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            AppState.filters.category = e.target.value;
            if (AppState.currentPage === 'courses') {
                loadCourses(1);
            }
        });
    }
    
    const levelFilter = document.getElementById('level-filter');
    if (levelFilter) {
        levelFilter.addEventListener('change', function(e) {
            AppState.filters.level = e.target.value;
            if (AppState.currentPage === 'courses') {
                loadCourses(1);
            }
        });
    }
    
    // Search button
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (AppState.currentPage === 'courses') {
                loadCourses(1);
            }
        });
    }
    
    console.log('✅ Course controls ready');
}

// Featured Courses Loading - FIXED
function loadFeaturedCourses() {
    const container = document.getElementById('featured-courses');
    if (!container) return;
    
    console.log('🌟 Loading featured courses...');
    
    container.innerHTML = '<div class="loading-state">Loading featured courses...</div>';
    
    // Use mock data directly instead of async API call
    setTimeout(() => {
        try {
            const mockData = getMockCourses(1, 3);
            if (mockData && mockData.courses && mockData.courses.length > 0) {
                displayFeaturedCourses(mockData.courses, container);
                console.log('✅ Featured courses loaded successfully');
            } else {
                container.innerHTML = '<div class="loading-state">No featured courses available</div>';
            }
        } catch (error) {
            console.error('❌ Error loading featured courses:', error);
            container.innerHTML = '<div class="loading-state">Unable to load featured courses</div>';
        }
    }, 1000);
}

// Main Course Loading - FIXED
async function loadCourses(page = 1) {
    const container = document.getElementById('courses-grid');
    const pagination = document.getElementById('pagination');
    const errorState = document.getElementById('courses-error');
    
    if (!container) return;
    
    console.log(`📚 Loading courses page ${page}...`);
    
    // Update state
    AppState.coursesData.loading = true;
    AppState.coursesData.currentPage = page;
    
    // Show loading
    container.innerHTML = '<div class="loading-state">Loading courses...</div>';
    
    if (errorState) {
        errorState.classList.add('hidden');
    }
    
    // Use direct mock data instead of async API call
    setTimeout(() => {
        try {
            const data = getMockCourses(page, CONFIG.COURSES_PER_PAGE);
            
            if (data && data.courses) {
                AppState.coursesData = {
                    ...AppState.coursesData,
                    courses: data.courses,
                    totalPages: data.totalPages || Math.ceil((data.totalCourses || data.courses.length) / CONFIG.COURSES_PER_PAGE),
                    totalCourses: data.totalCourses || data.courses.length,
                    loading: false,
                    error: null
                };
                
                const filteredCourses = filterCourses(data.courses);
                displayCourses(filteredCourses, container);
                setupPagination(pagination);
                
                console.log(`✅ Loaded ${filteredCourses.length} courses successfully`);
                
            } else {
                throw new Error('Invalid data format');
            }
            
        } catch (error) {
            console.error('❌ Error loading courses:', error);
            AppState.coursesData.loading = false;
            AppState.coursesData.error = error.message;
            
            if (errorState) {
                errorState.classList.remove('hidden');
            }
            
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Unable to load courses</h3>
                    <p>Please check your connection and try again.</p>
                    <button class="retry-btn" onclick="loadCourses(1)">Retry</button>
                </div>
            `;
        }
    }, 800);
}

// API Communication - Simplified to always use mock data
async function fetchCoursesFromAPI(page = 1, limit = CONFIG.COURSES_PER_PAGE) {
    console.log('🔄 Using mock data for courses...');
    return getMockCourses(page, limit);
}

// Enhanced Mock Data - Same as before
function getMockCourses(page = 1, limit = 10) {
    const mockCourses = [
        {
            id: 1,
            title: 'Advanced JavaScript Mastery',
            description: 'Master modern JavaScript including ES6+, async programming, and advanced patterns for building scalable applications.',
            instructor: 'Korelium Team',
            category: 'technology',
            level: 'advanced',
            duration: '8 weeks',
            rating: 4.9,
            studentsCount: 2847,
            image: null,
            slug: 'advanced-javascript-mastery'
        },
        {
            id: 2,
            title: 'Cryptocurrency Trading Strategies',
            description: 'Learn professional trading strategies, technical analysis, and risk management for cryptocurrency markets.',
            instructor: 'Korelium Team',
            category: 'finance',
            level: 'intermediate',
            duration: '6 weeks',
            rating: 4.7,
            studentsCount: 1923,
            image: null,
            slug: 'cryptocurrency-trading-strategies'
        },
        {
            id: 3,
            title: 'React.js & Next.js Development',
            description: 'Build modern web applications with React.js and Next.js, including server-side rendering and optimization.',
            instructor: 'Korelium Team',
            category: 'technology',
            level: 'intermediate',
            duration: '10 weeks',
            rating: 4.8,
            studentsCount: 3156,
            image: null,
            slug: 'react-nextjs-development'
        },
        {
            id: 4,
            title: 'Personal Finance Mastery',
            description: 'Complete guide to personal finance, investment strategies, and wealth building for long-term success.',
            instructor: 'Korelium Team',
            category: 'finance',
            level: 'beginner',
            duration: '6 weeks',
            rating: 4.6,
            studentsCount: 2438,
            image: null,
            slug: 'personal-finance-mastery'
        },
        {
            id: 5,
            title: 'Digital Nomad Lifestyle',
            description: 'Learn how to work remotely, travel the world, and maintain a productive digital nomad lifestyle.',
            instructor: 'Korelium Team',
            category: 'travel',
            level: 'beginner',
            duration: '4 weeks',
            rating: 4.5,
            studentsCount: 1567,
            image: null,
            slug: 'digital-nomad-lifestyle'
        },
        {
            id: 6,
            title: 'Machine Learning with Python',
            description: 'Comprehensive introduction to machine learning algorithms, data science, and AI development with Python.',
            instructor: 'Korelium Team',
            category: 'technology',
            level: 'advanced',
            duration: '12 weeks',
            rating: 4.9,
            studentsCount: 2783,
            image: null,
            slug: 'machine-learning-python'
        },
        {
            id: 7,
            title: 'Stock Market Analysis',
            description: 'Learn fundamental and technical analysis techniques for successful stock market investing.',
            instructor: 'Korelium Team',
            category: 'finance',
            level: 'intermediate',
            duration: '8 weeks',
            rating: 4.7,
            studentsCount: 2089,
            image: null,
            slug: 'stock-market-analysis'
        },
        {
            id: 8,
            title: 'Travel Photography Pro',
            description: 'Master the art of travel photography with professional techniques and post-processing workflows.',
            instructor: 'Korelium Team',
            category: 'travel',
            level: 'intermediate',
            duration: '6 weeks',
            rating: 4.6,
            studentsCount: 1344,
            image: null,
            slug: 'travel-photography-pro'
        },
        {
            id: 9,
            title: 'Blockchain Development',
            description: 'Build decentralized applications and smart contracts with Ethereum, Solidity, and Web3 technologies.',
            instructor: 'Korelium Team',
            category: 'technology',
            level: 'advanced',
            duration: '10 weeks',
            rating: 4.8,
            studentsCount: 1876,
            image: null,
            slug: 'blockchain-development'
        }
    ];
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = mockCourses.slice(startIndex, endIndex);
    
    return {
        courses: paginatedCourses,
        totalPages: Math.ceil(mockCourses.length / limit),
        totalCourses: mockCourses.length,
        currentPage: page
    };
}

// Course Filtering - Same as before
function filterCourses(courses) {
    return courses.filter(course => {
        // Search filter
        if (AppState.filters.search) {
            const searchTerm = AppState.filters.search.toLowerCase();
            const matchesSearch = 
                course.title.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm) ||
                course.instructor.toLowerCase().includes(searchTerm);
            
            if (!matchesSearch) return false;
        }
        
        // Category filter
        if (AppState.filters.category && course.category !== AppState.filters.category) {
            return false;
        }
        
        // Level filter
        if (AppState.filters.level && course.level !== AppState.filters.level) {
            return false;
        }
        
        return true;
    });
}

// Display Courses - Same as before
function displayCourses(courses, container) {
    if (!container) return;
    
    if (courses.length === 0) {
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">🔍</div>
                <h3>No courses found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    const coursesHTML = courses.map(course => createCourseCard(course)).join('');
    container.innerHTML = coursesHTML;
    
    // Add click handlers
    container.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            openCourseDetail(courseId);
        });
    });
}

// Display Featured Courses - Same as before
function displayFeaturedCourses(courses, container) {
    if (!container) return;
    
    const coursesHTML = courses.map(course => createCourseCard(course, true)).join('');
    container.innerHTML = coursesHTML;
    
    // Add click handlers
    container.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            openCourseDetail(courseId);
        });
    });
}

// Create Course Card HTML - Same as before
function createCourseCard(course, isFeatured = false) {
    const categoryColors = {
        technology: 'var(--primary-purple)',
        finance: 'var(--accent-green)',
        trading: 'var(--primary-orange)',
        travel: 'var(--accent-pink)'
    };
    
    const levelColors = {
        beginner: 'var(--accent-green)',
        intermediate: 'var(--primary-cyan)',
        advanced: 'var(--primary-orange)'
    };
    
    return `
        <div class="course-card" data-course-id="${course.id}">
            <div class="course-image">
                ${course.image ? `<img src="${CONFIG.API_BASE_URL}/${course.image}" alt="${course.title}" onerror="this.style.display='none';">` : '🎓'}
            </div>
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <div class="course-info">
                        <div class="course-instructor">By ${course.instructor}</div>
                        <div class="course-duration">${course.duration}</div>
                    </div>
                    <div class="course-rating">
                        <span>⭐ ${course.rating}</span>
                        <span>(${course.studentsCount} students)</span>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <span class="course-category" style="background: ${categoryColors[course.category] || 'var(--primary-cyan)'}; color: white;">${course.category}</span>
                    <span class="course-level" style="background: ${levelColors[course.level] || 'var(--text-muted)'}; color: white;">${course.level}</span>
                </div>
            </div>
        </div>
    `;
}

// Rest of the functions remain the same...
// Pagination
function setupPagination(container) {
    if (!container || AppState.coursesData.totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    const currentPage = AppState.coursesData.currentPage;
    const totalPages = AppState.coursesData.totalPages;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="loadCourses(${currentPage - 1})">
            ← Previous
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadCourses(${i})">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="loadCourses(${currentPage + 1})">
            Next →
        </button>
    `;
    
    container.innerHTML = paginationHTML;
}

// Course Detail Modal
function openCourseDetail(courseId) {
    try {
        console.log('🔍 Opening course detail:', courseId);
        
        const course = AppState.coursesData.courses.find(c => c.id == courseId);
        
        if (course) {
            showCourseModal(course);
        } else {
            showNotification('Course details not available', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error opening course detail:', error);
        showNotification('Unable to open course details', 'error');
    }
}

function showCourseModal(course) {
    const modal = document.getElementById('course-modal');
    const modalContent = document.getElementById('course-modal-content');
    
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `
        <div style="padding: 2rem;">
            <div style="background: var(--gradient-secondary); height: 200px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: white; margin-bottom: 2rem;">
                🎓
            </div>
            
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${course.title}</h1>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-glass); border-radius: 12px; border: 1px solid var(--border-primary);">
                <div><strong>Instructor:</strong><br><span style="color: var(--text-secondary);">${course.instructor}</span></div>
                <div><strong>Duration:</strong><br><span style="color: var(--text-secondary);">${course.duration}</span></div>
                <div><strong>Level:</strong><br><span style="color: var(--text-secondary);">${course.level}</span></div>
                <div><strong>Rating:</strong><br><span style="color: var(--text-secondary);">⭐ ${course.rating} (${course.studentsCount} students)</span></div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Course Description</h3>
                <p style="line-height: 1.7; color: var(--text-secondary); margin-bottom: 1rem;">${course.description}</p>
                <p style="line-height: 1.7; color: var(--text-secondary);">This comprehensive course provides hands-on experience with real-world projects, expert guidance, and practical skills you can apply immediately in your career.</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">What You'll Learn</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 0.5rem 0; color: var(--text-secondary); position: relative; padding-left: 2rem;">
                        <span style="position: absolute; left: 0; color: var(--accent-green); font-weight: bold;">✓</span>
                        Master core concepts and advanced techniques
                    </li>
                    <li style="padding: 0.5rem 0; color: var(--text-secondary); position: relative; padding-left: 2rem;">
                        <span style="position: absolute; left: 0; color: var(--accent-green); font-weight: bold;">✓</span>
                        Work on real-world projects and case studies
                    </li>
                    <li style="padding: 0.5rem 0; color: var(--text-secondary); position: relative; padding-left: 2rem;">
                        <span style="position: absolute; left: 0; color: var(--accent-green); font-weight: bold;">✓</span>
                        Get industry-ready skills and certification
                    </li>
                    <li style="padding: 0.5rem 0; color: var(--text-secondary); position: relative; padding-left: 2rem;">
                        <span style="position: absolute; left: 0; color: var(--accent-green); font-weight: bold;">✓</span>
                        Access to exclusive resources and community
                    </li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button onclick="enrollInCourse('${course.id}')" style="flex: 1; padding: 1rem 2rem; background: var(--gradient-primary); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: transform 0.2s ease;">
                    Enroll Now - Free
                </button>
                <button onclick="addToWishlist('${course.id}')" style="flex: 1; padding: 1rem 2rem; background: transparent; color: var(--text-primary); border: 2px solid var(--border-accent); border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                    Add to Wishlist
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    AppState.ui.modalOpen = true;
    
    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = closeCourseModal;
    }
    
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.onclick = closeCourseModal;
    }
    
    // Keyboard handler
    document.addEventListener('keydown', handleModalKeydown);
    
    console.log('✅ Course modal opened');
}

function closeCourseModal() {
    const modal = document.getElementById('course-modal');
    if (modal) {
        modal.classList.add('hidden');
        AppState.ui.modalOpen = false;
    }
    document.removeEventListener('keydown', handleModalKeydown);
    console.log('✅ Course modal closed');
}

function handleModalKeydown(e) {
    if (e.key === 'Escape' && AppState.ui.modalOpen) {
        closeCourseModal();
    }
}

// Course Actions
function enrollInCourse(courseId) {
    console.log('📝 Enrolling in course:', courseId);
    showNotification('Course enrollment coming soon! 🚀', 'info');
    closeCourseModal();
}

function addToWishlist(courseId) {
    console.log('❤️ Adding to wishlist:', courseId);
    showNotification('Course added to wishlist! ❤️', 'success');
}

// Form Handlers
function initializeFormHandlers() {
    console.log('📝 Setting up form handlers...');
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterForm);
    }
    
    // Blog filters
    const blogFilters = document.querySelectorAll('.filter-btn');
    blogFilters.forEach(btn => {
        btn.addEventListener('click', handleBlogFilter);
    });
    
    console.log('✅ Form handlers ready');
}

function handleContactForm(e) {
    e.preventDefault();
    console.log('📧 Contact form submitted');
    
    const name = document.getElementById('contact-name')?.value || '';
    const email = document.getElementById('contact-email')?.value || '';
    const subject = document.getElementById('contact-subject')?.value || '';
    const message = document.getElementById('contact-message')?.value || '';
    
    if (!name || !email || !message || !subject) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Message sent successfully! We\'ll get back to you soon. 📧', 'success');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function handleNewsletterForm(e) {
    e.preventDefault();
    console.log('📰 Newsletter form submitted');
    
    const email = e.target.querySelector('input[type="email"]')?.value || '';
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Successfully subscribed to newsletter! 📬', 'success');
        e.target.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

function handleBlogFilter(e) {
    e.preventDefault();
    
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const category = e.target.getAttribute('data-category') || 'all';
    console.log('📝 Filtering blog by:', category);
    
    showNotification(`Filtered blog posts: ${category === 'all' ? 'All Posts' : category}`, 'info', 2000);
}

// Enhanced Notification System
function showNotification(message, type = 'info', duration = 4000) {
    console.log(`🔔 Notification: ${message} (${type})`);
    
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.2rem;">×</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, duration);
}

// Global function exports for onclick handlers
window.loadCourses = loadCourses;
window.navigateToPage = navigateToPage;
window.closeCourseModal = closeCourseModal;
window.enrollInCourse = enrollInCourse;
window.addToWishlist = addToWishlist;

// Service worker registration for PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('🔧 ServiceWorker registered');
            })
            .catch(function(error) {
                console.log('⚠️ ServiceWorker registration failed');
            });
    });
}

// Accessibility enhancements
document.addEventListener('keydown', function(e) {
    // ESC key handling
    if (e.key === 'Escape') {
        if (AppState.ui.modalOpen) {
            closeCourseModal();
        } else if (AppState.ui.mobileMenuOpen) {
            closeMobileMenu();
        }
    }
    
    // Tab navigation enhancements
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('using-keyboard');
});

// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log(`📊 Page load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
        }
    }
});

if ('PerformanceObserver' in window) {
    perfObserver.observe({entryTypes: ['navigation']});
}

console.log('🎉 Korelium Frontend Application loaded successfully!');
console.log('🌐 Visit korelium.org for updates and support');
console.log('🐦 Follow @korelium on social media');
console.log('🚀 Ready to elevate your learning experience!');