/**
 * Korelium Frontend Application
 * Modern, fast-loading educational platform with backend API integration
 * Author: Korelium Team (@korelium)
 * Version: 2.0.0
 */

/* ==================== CONFIGURATION ==================== */
const CONFIG = {
    API_BASE_URL: 'http://localhost:9000',
    ENDPOINTS: {
        COURSES_PUBLIC: '/public/courses',
        COURSES_ADMIN: '/api/courses',
        ADMIN_LOGIN: '/api/admin/login',
        COURSE_CATEGORIES: '/api/course-categories',
        COURSE_BY_SLUG: '/api/course',
        COURSES_BY_CATEGORY: '/api/courses/category',
        RELATED_COURSES: '/api/course'
    },
    PAGINATION: {
        COURSES_PER_PAGE: 9,
        FEATURED_COURSES_LIMIT: 6
    },
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300,
        ANIMATION_DURATION: 300,
        LAZY_LOAD_THRESHOLD: 100
    },
    PARTICLES: {
        COUNT: 50,
        SPEED: 15000
    },
    SOCIAL_MEDIA: {
        instagram: 'https://instagram.com/korelium',
        youtube: 'https://youtube.com/@korelium',
        twitter: 'https://twitter.com/korelium'
    }
};

/* ==================== APPLICATION STATE ==================== */
const AppState = {
    // Current application state
    currentPage: 'home',
    theme: localStorage.getItem('korelium-theme') || 'dark',
    isLoading: false,
    
    // Course data and pagination
    coursesData: {
        courses: [],
        categories: [],
        currentPage: 1,
        totalPages: 1,
        totalCourses: 0,
        loading: false,
        error: null
    },
    
    // Filters and search
    filters: {
        search: '',
        category: '',
        level: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
    },
    
    // UI state
    ui: {
        mobileMenuOpen: false,
        modalOpen: false,
        particleSystem: null,
        notifications: [],
        lastScrollY: 0
    },
    
    // Performance tracking
    performance: {
        loadTime: 0,
        apiCalls: 0,
        cacheHits: 0
    }
};

/* ==================== CACHE MANAGEMENT ==================== */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = 5 * 60 * 1000; // 5 minutes TTL
    }
    
    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        AppState.performance.cacheHits++;
        return item.value;
    }
    
    clear() {
        this.cache.clear();
    }
}

const cache = new CacheManager();

/* ==================== API UTILITIES ==================== */
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.requestCount = 0;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        try {
            this.requestCount++;
            AppState.performance.apiCalls++;
            
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            return { success: false, error: error.message };
        }
    }
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

const api = new APIClient();

/* ==================== APPLICATION INITIALIZATION ==================== */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Korelium initializing...');
    const startTime = performance.now();
    
    // Initialize app
    initializeApp().then(() => {
        const loadTime = performance.now() - startTime;
        AppState.performance.loadTime = loadTime;
        console.log(`✅ Korelium loaded in ${loadTime.toFixed(2)}ms`);
        
        // Show welcome notification
        showNotification('Welcome to Korelium! 🎓', 'success', 3000);
    }).catch(error => {
        console.error('❌ Initialization failed:', error);
        showNotification('Failed to initialize application', 'error');
    });
});

async function initializeApp() {
    try {
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
        initializeScrollEffects();
        initializeLazyLoading();
        
        // Load initial content
        await loadCategories();
        
        // Set initial page
        const initialPage = getPageFromHash() || 'home';
        
        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Hide loading screen and show content
        hideLoadingScreen();
        navigateToPage(initialPage, false);
        
        // Initialize service worker for caching
        initializeServiceWorker();
        
    } catch (error) {
        hideLoadingScreen();
        throw error;
    }
}

/* ==================== LOADING SCREEN ==================== */
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
        // Remove from DOM after animation
        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.remove();
            }
        }, 500);
    }
}

/* ==================== THEME MANAGEMENT ==================== */
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
    localStorage.setItem('korelium-theme', AppState.theme);
    updateThemeToggleIcon();
    
    // Animate theme transition
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
    
    console.log(`🎨 Theme switched to: ${AppState.theme}`);
    showNotification(`Switched to ${AppState.theme} mode`, 'info', 2000);
}

function updateThemeToggleIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle?.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = AppState.theme === 'dark' ? '🌙' : '☀️';
        icon.style.transform = 'scale(0.8)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 150);
    }
}

/* ==================== PARTICLE SYSTEM ==================== */
function initializeParticleSystem() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;
    
    // Create initial particles
    for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
        createParticle(particleContainer);
    }
    
    console.log('✨ Particle system initialized');
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random starting position and animation
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * CONFIG.PARTICLES.SPEED + 'ms';
    particle.style.animationDuration = (CONFIG.PARTICLES.SPEED + Math.random() * 10000) + 'ms';
    
    container.appendChild(particle);
    
    // Recycle particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
            createParticle(container);
        }
    }, CONFIG.PARTICLES.SPEED + Math.random() * 10000);
}

/* ==================== NAVIGATION SYSTEM ==================== */
function initializeNavigation() {
    console.log('🧭 Setting up navigation...');
    
    // Global click handler for navigation
    document.addEventListener('click', handleNavigationClick);
    
    // Handle browser navigation
    window.addEventListener('popstate', function(e) {
        const page = getPageFromHash() || 'home';
        console.log('🔙 Browser navigation to:', page);
        navigateToPage(page, false);
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    updateNavigationStates();
    console.log('✅ Navigation system ready');
}

function handleNavigationClick(e) {
    const target = e.target.closest('[data-page], a[href^="#"]');
    if (!target) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    let page = null;
    
    // Get page from data-page attribute
    if (target.hasAttribute('data-page')) {
        page = target.getAttribute('data-page');
    }
    // Get page from href
    else if (target.hasAttribute('href')) {
        const href = target.getAttribute('href');
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
            
            // Trigger animation
            requestAnimationFrame(() => {
                targetPage.classList.add('page-active');
            });
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

function handlePageLoad(page) {
    switch (page) {
        case 'courses':
            console.log('📚 Loading courses page...');
            setTimeout(() => loadCourses(1), 200);
            break;
        case 'home':
            console.log('🏠 Loading home page...');
            setTimeout(() => loadFeaturedCourses(), 200);
            break;
        default:
            console.log(`📄 Page loaded: ${page}`);
            break;
    }
}

/* ==================== SEO MANAGEMENT ==================== */
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
        services: {
            title: 'Professional Services - Transform Your Business | Korelium',
            description: 'Professional development services including web development, mobile apps, and consulting.',
            keywords: 'services, web development, mobile apps, consulting'
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

/* ==================== MOBILE MENU ==================== */
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
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.ui.mobileMenuOpen) {
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

/* ==================== SCROLL EFFECTS ==================== */
function initializeScrollEffects() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });
    
    function updateScrollEffects() {
        const scrollY = window.scrollY;
        AppState.ui.lastScrollY = scrollY;
        ticking = false;
    }
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
        navbar.style.background = 'rgba(var(--bg-primary), 0.95)';
        navbar.style.boxShadow = 'var(--shadow-md)';
    } else {
        navbar.style.background = 'rgba(var(--bg-primary), 0.8)';
        navbar.style.boxShadow = 'none';
    }
}

/* ==================== ANIMATED COUNTERS ==================== */
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
    const increment = target / 60;
    const duration = 2000;
    const stepTime = duration / 60;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, stepTime);
}

/* ==================== TESTIMONIAL SLIDER ==================== */
function initializeTestimonialSlider() {
    const slider = document.getElementById('testimonials-slider');
    if (!slider) return;
    
    let currentSlide = 0;
    const slides = slider.querySelectorAll('.testimonial-card');
    const totalSlides = slides.length;
    
    if (totalSlides <= 1) return;
    
    // Auto-rotate testimonials
    setInterval(() => {
        slides[currentSlide].style.opacity = '0.7';
        slides[currentSlide].style.transform = 'scale(0.95)';
        
        currentSlide = (currentSlide + 1) % totalSlides;
        
        slides[currentSlide].style.opacity = '1';
        slides[currentSlide].style.transform = 'scale(1)';
    }, 5000);
    
    console.log('💬 Testimonial slider initialized');
}

/* ==================== COURSE MANAGEMENT ==================== */
function initializeCourseControls() {
    console.log('🎛️ Setting up course controls...');
    
    // Search functionality with debouncing
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
            }, CONFIG.PERFORMANCE.DEBOUNCE_DELAY);
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

/* ==================== API INTEGRATION - COURSES ==================== */
async function loadCourses(page = 1) {
    const container = document.getElementById('courses-grid');
    const loadingState = document.getElementById('courses-loading');
    const errorState = document.getElementById('courses-error');
    const paginationContainer = document.getElementById('courses-pagination');
    
    if (!container) return;
    
    // Show loading state
    showLoadingState();
    
    try {
        console.log('📚 Loading courses...', { page, filters: AppState.filters });
        
        // Build query parameters
        const params = new URLSearchParams({
            page: page.toString(),
            limit: CONFIG.PAGINATION.COURSES_PER_PAGE.toString(),
            ...AppState.filters
        });
        
        // Check cache first
        const cacheKey = `courses-${params.toString()}`;
        let response = cache.get(cacheKey);
        
        if (!response) {
            // Make API call
            response = await api.get(`${CONFIG.ENDPOINTS.COURSES_PUBLIC}?${params}`);
            if (response.success) {
                cache.set(cacheKey, response);
            }
        }
        
        if (response.success) {
            const courses = response.data;
            
            // Update state
            AppState.coursesData = {
                courses: courses,
                currentPage: page,
                totalPages: Math.ceil(courses.length / CONFIG.PAGINATION.COURSES_PER_PAGE),
                totalCourses: courses.length,
                loading: false,
                error: null
            };
            
            // Render courses
            renderCourses(courses);
            renderPagination();
            
            console.log(`✅ Loaded ${courses.length} courses`);
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('❌ Error loading courses:', error);
        AppState.coursesData.error = error.message;
        showErrorState(error.message);
        showNotification('Failed to load courses', 'error');
    } finally {
        hideLoadingState();
    }
    
    function showLoadingState() {
        if (container) container.style.display = 'none';
        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';
        AppState.coursesData.loading = true;
    }
    
    function hideLoadingState() {
        if (container) container.style.display = 'grid';
        if (loadingState) loadingState.style.display = 'none';
        AppState.coursesData.loading = false;
    }
    
    function showErrorState(message) {
        if (container) container.style.display = 'none';
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) {
            errorState.style.display = 'block';
            const errorText = errorState.querySelector('p');
            if (errorText) {
                errorText.textContent = message || 'Failed to load courses. Please try again.';
            }
        }
        if (paginationContainer) paginationContainer.style.display = 'none';
    }
}

async function loadFeaturedCourses() {
    const container = document.getElementById('featured-courses');
    if (!container) return;
    
    console.log('🌟 Loading featured courses...');
    
    try {
        // Check cache first
        const cacheKey = 'featured-courses';
        let response = cache.get(cacheKey);
        
        if (!response) {
            response = await api.get(`${CONFIG.ENDPOINTS.COURSES_PUBLIC}?limit=${CONFIG.PAGINATION.FEATURED_COURSES_LIMIT}`);
            if (response.success) {
                cache.set(cacheKey, response);
            }
        }
        
        if (response.success) {
            const courses = response.data.slice(0, CONFIG.PAGINATION.FEATURED_COURSES_LIMIT);
            renderCourses(courses, container);
            console.log(`✅ Loaded ${courses.length} featured courses`);
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('❌ Error loading featured courses:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Unable to load featured courses. Please try again later.</p>
                <button class="retry-btn" onclick="loadFeaturedCourses()">Retry</button>
            </div>
        `;
    }
}

async function loadCategories() {
    try {
        const response = await api.get(CONFIG.ENDPOINTS.COURSE_CATEGORIES);
        if (response.success) {
            AppState.coursesData.categories = response.data;
            populateCategoryFilter();
            console.log('📋 Categories loaded:', response.data.length);
        }
    } catch (error) {
        console.error('❌ Error loading categories:', error);
    }
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter || !AppState.coursesData.categories.length) return;
    
    // Clear existing options (except first one)
    const firstOption = categoryFilter.querySelector('option');
    categoryFilter.innerHTML = '';
    categoryFilter.appendChild(firstOption);
    
    // Add category options
    AppState.coursesData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.slug || category.name.toLowerCase();
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

/* ==================== COURSE RENDERING ==================== */
function renderCourses(courses, container = null) {
    const targetContainer = container || document.getElementById('courses-grid');
    if (!targetContainer) return;
    
    if (!courses || courses.length === 0) {
        targetContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No courses found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    targetContainer.innerHTML = courses.map(course => createCourseCard(course)).join('');
    
    // Add stagger animation
    const cards = targetContainer.querySelectorAll('.course-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function createCourseCard(course) {
    const {
        id,
        title,
        slug,
        description,
        image,
        category,
        tags = [],
        instructor,
        duration,
        students,
        rating,
        level,
        udemyLink
    } = course;
    
    // Parse JSON fields if they're strings
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags || '[]') : tags;
    
    // Generate fallback values
    const fallbackStudents = students || Math.floor(Math.random() * 5000) + 1000;
    const fallbackRating = rating || (4.0 + Math.random() * 1.0).toFixed(1);
    const instructorInitial = instructor ? instructor.charAt(0).toUpperCase() : 'K';
    
    return `
        <article class="course-card" data-course-id="${id}" data-category="${category}" data-level="${level}">
            <div class="course-image">
                ${image 
                    ? `<img src="${CONFIG.API_BASE_URL}/${image}" alt="${title}" loading="lazy">`
                    : `<div class="course-image-placeholder">📚</div>`
                }
                <div class="course-badge">${level || 'All Levels'}</div>
            </div>
            <div class="course-content">
                <div class="course-meta">
                    <span class="course-category">${category || 'General'}</span>
                    <span class="course-level">${level || 'All Levels'}</span>
                </div>
                <h3 class="course-title">${title}</h3>
                <p class="course-description">${description || 'Comprehensive course covering essential topics and practical skills.'}</p>
                ${instructor ? `
                    <div class="course-instructor">
                        <div class="instructor-avatar">${instructorInitial}</div>
                        <span>${instructor}</span>
                    </div>
                ` : ''}
                <div class="course-stats">
                    <div class="course-rating">
                        <span>⭐</span>
                        <span>${fallbackRating}</span>
                    </div>
                    <div class="course-students">${fallbackStudents.toLocaleString()} students</div>
                    <div class="course-duration">${duration || '8 weeks'}</div>
                </div>
            </div>
        </article>
    `;
}

/* ==================== PAGINATION ==================== */
function renderPagination() {
    const container = document.getElementById('courses-pagination');
    if (!container) return;
    
    const { currentPage, totalPages } = AppState.coursesData;
    
    if (totalPages <= 1) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    
    let pagination = '';
    
    // Previous button
    pagination += `
        <button class="pagination-btn" ${currentPage <= 1 ? 'disabled' : ''} 
                onclick="loadCourses(${currentPage - 1})" 
                ${currentPage <= 1 ? '' : `aria-label="Go to page ${currentPage - 1}"`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
            </svg>
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        pagination += `<button class="pagination-btn" onclick="loadCourses(1)" aria-label="Go to page 1">1</button>`;
        if (startPage > 2) {
            pagination += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pagination += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="loadCourses(${i})" 
                    aria-label="Go to page ${i}"
                    ${i === currentPage ? 'aria-current="page"' : ''}>
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination += `<span class="pagination-ellipsis">...</span>`;
        }
        pagination += `<button class="pagination-btn" onclick="loadCourses(${totalPages})" aria-label="Go to page ${totalPages}">${totalPages}</button>`;
    }
    
    // Next button
    pagination += `
        <button class="pagination-btn" ${currentPage >= totalPages ? 'disabled' : ''} 
                onclick="loadCourses(${currentPage + 1})" 
                ${currentPage >= totalPages ? '' : `aria-label="Go to page ${currentPage + 1}"`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
            </svg>
        </button>
    `;
    
    container.innerHTML = pagination;
}

/* ==================== FORM HANDLERS ==================== */
function initializeFormHandlers() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Blog filter handlers
    const blogFilters = document.querySelectorAll('.filter-btn');
    blogFilters.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterBlogPosts(filter);
            
            // Update active state
            blogFilters.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    console.log('📝 Form handlers initialized');
}

async function handleContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <div class="loading-spinner" style="width: 20px; height: 20px; margin-right: 8px;"></div>
            <span>Sending...</span>
        `;
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reset form
        form.reset();
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('❌ Error submitting form:', error);
        showNotification('Failed to send message. Please try again.', 'error');
        
        // Reset button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = `
            <span>Send Message</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        `;
        submitBtn.disabled = false;
    }
}

/* ==================== BLOG FUNCTIONALITY ==================== */
function filterBlogPosts(filter) {
    const blogCards = document.querySelectorAll('.blog-card');
    
    blogCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
    
    console.log(`📖 Filtered blog posts by: ${filter}`);
}

/* ==================== LAZY LOADING ==================== */
function initializeLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: `${CONFIG.PERFORMANCE.LAZY_LOAD_THRESHOLD}px`
    });
    
    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    console.log('🖼️ Lazy loading initialized');
}

/* ==================== NOTIFICATION SYSTEM ==================== */
function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-message">${message}</div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
    
    // Track notification
    AppState.ui.notifications.push({
        message,
        type,
        timestamp: Date.now()
    });
    
    console.log(`📢 Notification: ${message} (${type})`);
}

/* ==================== COURSE CARD INTERACTIONS ==================== */
function handleCourseCardClick(courseId) {
    // In a real application, this would navigate to course detail page
    console.log('🎯 Course clicked:', courseId);
    showNotification('Course details coming soon!', 'info');
}

// Add event delegation for course cards
document.addEventListener('click', function(e) {
    const courseCard = e.target.closest('.course-card');
    if (courseCard) {
        const courseId = courseCard.getAttribute('data-course-id');
        if (courseId) {
            handleCourseCardClick(courseId);
        }
    }
});

/* ==================== SEARCH FUNCTIONALITY ==================== */
function handleSearch(query) {
    if (!query || query.length < 2) {
        return AppState.coursesData.courses;
    }
    
    return AppState.coursesData.courses.filter(course => {
        const searchFields = [
            course.title,
            course.description,
            course.instructor,
            course.category,
            ...(course.tags || [])
        ].join(' ').toLowerCase();
        
        return searchFields.includes(query.toLowerCase());
    });
}

/* ==================== PERFORMANCE OPTIMIZATIONS ==================== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/* ==================== SERVICE WORKER ==================== */
function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🔧 Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    }
}

/* ==================== ERROR HANDLING ==================== */
window.addEventListener('error', function(e) {
    console.error('❌ Global error:', e.error);
    showNotification('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Unhandled promise rejection:', e.reason);
    showNotification('Network error occurred', 'error');
});

/* ==================== ACCESSIBILITY ENHANCEMENTS ==================== */
function initializeAccessibility() {
    // Keyboard navigation for custom elements
    document.addEventListener('keydown', function(e) {
        // Escape key handling
        if (e.key === 'Escape') {
            closeMobileMenu();
            // Close any open modals here
        }
        
        // Enter/Space key for button-like elements
        if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute('data-page')) {
            e.preventDefault();
            e.target.click();
        }
    });
    
    // Focus management
    document.addEventListener('focusin', function(e) {
        // Add focus indicators for keyboard users
        if (e.target.matches('.course-card, .blog-card, .portfolio-item')) {
            e.target.style.outline = '2px solid var(--brand-primary)';
            e.target.style.outlineOffset = '2px';
        }
    });
    
    document.addEventListener('focusout', function(e) {
        if (e.target.matches('.course-card, .blog-card, .portfolio-item')) {
            e.target.style.outline = '';
            e.target.style.outlineOffset = '';
        }
    });
    
    console.log('♿ Accessibility enhancements initialized');
}

/* ==================== SOCIAL MEDIA INTEGRATION ==================== */
function openSocialMedia(platform) {
    const url = CONFIG.SOCIAL_MEDIA[platform];
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        console.log(`📱 Opened ${platform}: ${url}`);
    }
}

/* ==================== ANALYTICS TRACKING ==================== */
function trackEvent(eventName, properties = {}) {
    // Analytics tracking (replace with your preferred analytics service)
    console.log('📊 Event tracked:', eventName, properties);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Example: Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, properties);
    }
}

/* ==================== UTILITY FUNCTIONS ==================== */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/* ==================== ADMIN FUNCTIONALITY ==================== */
let adminToken = localStorage.getItem('korelium-admin-token');

async function loginAdmin(username, password) {
    try {
        const response = await api.post(CONFIG.ENDPOINTS.ADMIN_LOGIN, {
            username,
            password
        });
        
        if (response.success) {
            adminToken = response.data.token;
            localStorage.setItem('korelium-admin-token', adminToken);
            showNotification('Admin login successful', 'success');
            return true;
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('❌ Admin login failed:', error);
        showNotification('Login failed: ' + error.message, 'error');
        return false;
    }
}

function logoutAdmin() {
    adminToken = null;
    localStorage.removeItem('korelium-admin-token');
    showNotification('Logged out successfully', 'info');
}

function isAdminAuthenticated() {
    return !!adminToken;
}

/* ==================== API HELPERS WITH AUTHENTICATION ==================== */
async function apiWithAuth(endpoint, options = {}) {
    if (!adminToken) {
        throw new Error('Authentication required');
    }
    
    const authOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${adminToken}`
        }
    };
    
    return api.request(endpoint, authOptions);
}

/* ==================== PERFORMANCE MONITORING ==================== */
function logPerformanceMetrics() {
    const metrics = {
        ...AppState.performance,
        cacheSize: cache.cache.size,
        memoryUsage: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null
    };
    
    console.log('📊 Performance metrics:', metrics);
    return metrics;
}

/* ==================== OFFLINE DETECTION ==================== */
window.addEventListener('online', function() {
    showNotification('Connection restored', 'success', 3000);
    // Retry failed requests
    if (AppState.coursesData.error) {
        loadCourses(AppState.coursesData.currentPage);
    }
});

window.addEventListener('offline', function() {
    showNotification('You are offline. Some features may not work.', 'warning', 5000);
});

/* ==================== KEYBOARD SHORTCUTS ==================== */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('course-search');
        if (searchInput && AppState.currentPage === 'courses') {
            searchInput.focus();
        }
    }
    
    // Arrow keys for navigation
    if (e.altKey) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                history.back();
                break;
            case 'ArrowRight':
                e.preventDefault();
                history.forward();
                break;
        }
    }
});

/* ==================== DEVELOPMENT HELPERS ==================== */
if (process.env.NODE_ENV === 'development') {
    // Development tools
    window.KoreliumDev = {
        state: AppState,
        api,
        cache,
        loadCourses,
        showNotification,
        toggleTheme,
        logPerformanceMetrics
    };
    
    console.log('🔧 Development tools available at window.KoreliumDev');
}

/* ==================== INITIALIZATION HELPERS ==================== */
// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Additional initialization that needs DOM
    initializeAccessibility();
    
    // Set up intersection observers for animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.course-card, .feature-item, .service-card, .blog-card').forEach(el => {
        animationObserver.observe(el);
    });
});

/* ==================== ERROR BOUNDARY ==================== */
function withErrorBoundary(fn, fallback) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error('❌ Error in function:', fn.name, error);
            if (fallback) {
                return fallback(error);
            }
            showNotification('An error occurred', 'error');
        }
    };
}

/* ==================== EXPORT FOR TESTING ==================== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        CONFIG,
        api,
        cache,
        loadCourses,
        navigateToPage,
        showNotification
    };
}

/* ==================== POLYFILLS ==================== */
// IntersectionObserver polyfill for older browsers
if (!window.IntersectionObserver) {
    // Load polyfill
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    document.head.appendChild(script);
}

console.log('🎉 Korelium application loaded successfully!');