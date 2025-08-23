// API Configuration - Change these URLs as needed
const API_CONFIG = {
    BASE_URL: 'http://localhost:9000', // Change this to your backend URL
    ENDPOINTS: {
        // Public endpoints
        PUBLIC_COURSES: '/public/courses',
        
        // Admin endpoints
        ADMIN_LOGIN: '/api/admin/login',
        ADMIN_COURSES: '/api/courses',
        
        // File uploads
        UPLOADS: '/uploads'
    }
};

// Authentication helper
class AuthManager {
    static getToken() {
        return localStorage.getItem('adminToken');
    }
    
    static setToken(token) {
        localStorage.setItem('adminToken', token);
    }
    
    static removeToken() {
        localStorage.removeItem('adminToken');
    }
    
    static isAuthenticated() {
        return !!this.getToken();
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

// API Service for handling all backend communications
class APIService {
    
    // Public API - Get courses for the main website
    static async getPublicCourses(category = '', sortBy = 'createdAt', sortOrder = 'DESC') {
        try {
            const params = new URLSearchParams();
            if (category && category !== 'all') params.append('category', category);
            params.append('sortBy', sortBy);
            params.append('sortOrder', sortOrder);
            
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PUBLIC_COURSES}?${params}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching public courses:', error);
            throw error;
        }
    }
    
    // Admin API - Login
    static async adminLogin(username, password) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            
            const data = await response.json();
            // Store the token
            AuthManager.setToken(data.token);
            return data;
        } catch (error) {
            console.error('Error during admin login:', error);
            throw error;
        }
    }
    
    // Admin API - Get all courses (for admin panel)
    static async getAdminCourses() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_COURSES}`, {
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
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching admin courses:', error);
            throw error;
        }
    }
    
    // Admin API - Create course
    static async createCourse(courseData) {
        try {
            const formData = new FormData();
            
            // Append all course data to FormData
            Object.keys(courseData).forEach(key => {
                if (key === 'image' && courseData[key] instanceof File) {
                    formData.append('image', courseData[key]);
                } else if (Array.isArray(courseData[key])) {
                    formData.append(key, JSON.stringify(courseData[key]));
                } else if (courseData[key] !== null && courseData[key] !== undefined) {
                    formData.append(key, courseData[key]);
                }
            });
            
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_COURSES}`, {
                method: 'POST',
                headers: AuthManager.getFormDataHeaders(),
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create course');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    }
    
    // Admin API - Update course
    static async updateCourse(courseId, courseData) {
        try {
            const formData = new FormData();
            
            // Append all course data to FormData
            Object.keys(courseData).forEach(key => {
                if (key === 'image' && courseData[key] instanceof File) {
                    formData.append('image', courseData[key]);
                } else if (Array.isArray(courseData[key])) {
                    formData.append(key, JSON.stringify(courseData[key]));
                } else if (courseData[key] !== null && courseData[key] !== undefined) {
                    formData.append(key, courseData[key]);
                }
            });
            
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_COURSES}/${courseId}`, {
                method: 'PUT',
                headers: AuthManager.getFormDataHeaders(),
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update course');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    }
    
    // Admin API - Delete course
    static async deleteCourse(courseId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_COURSES}/${courseId}`, {
                method: 'DELETE',
                headers: AuthManager.getHeaders()
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete course');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }
}

// DOM Elements
const coursesGrid = document.getElementById('coursesGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const filterTags = document.querySelectorAll('.tag');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// State variables
let currentCategory = 'all';
let currentSearchTerm = '';
let displayedCourses = 6;
let allCourses = []; // Store all courses from API
let filteredCourses = []; // Store filtered courses

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCoursesFromAPI();
    setupEventListeners();
    setupSmoothScrolling();
    checkAdminAccess();
});

// Load courses from API instead of static data
async function loadCoursesFromAPI() {
    try {
        showLoading();
        
        // Fetch courses from public API
        const courses = await APIService.getPublicCourses(currentCategory);
        allCourses = courses;
        filteredCourses = [...allCourses];
        
        displayCourses();
    } catch (error) {
        console.error('Failed to load courses:', error);
        // Show error message to user
        showErrorMessage('Failed to load courses. Please try again later.');
    }
}

// Display courses on the page
function displayCourses() {
    if (filteredCourses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="no-courses" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h3>No courses found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    const coursesToShow = filteredCourses.slice(0, displayedCourses);
    
    coursesGrid.innerHTML = coursesToShow.map(course => `
        <div class="course-card" data-category="${course.category}">
            <div class="course-image">
                ${course.image ? 
                    `<img src="${API_CONFIG.BASE_URL}/${course.image}" alt="${course.title}" style="width: 100%; height: 100%; object-fit: cover;">` 
                    : `<div style="font-size: 3rem;">📚</div>`
                }
            </div>
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-instructor">by ${course.instructor}</p>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <div class="course-rating">
                        <span>${'⭐'.repeat(Math.floor(course.rating || 4))}</span>
                        <span>${course.rating || 4.0}</span>
                    </div>
                    <div class="course-duration">${course.duration}</div>
                </div>
                <div class="course-tags">
                    ${(() => {
                                const tags = Array.isArray(course.tags)
                                    ? course.tags
                                    : (typeof course.tags === 'string' && course.tags.length > 0)
                                        ? JSON.parse(course.tags)
                                        : [];
                                return tags.slice(0, 3).map(tag => `<span class="tag-pill">${tag}</span>`).join('');                            })()}
<!--  this is where i modified -->
                </div>
                <div class="course-price">
                    <span class="free-price">FREE</span>
                    <span class="level">${course.level || 'All Levels'}</span>
                </div>
                <a href="${course.udemyLink}" class="course-link" target="_blank" rel="noopener">
                    Get Course Free
                </a>
            </div>
        </div>
    `).join('');
    
    // Show/hide load more button
    loadMoreBtn.style.display = displayedCourses >= filteredCourses.length ? 'none' : 'block';
}

// Filter courses by category and search term
function filterCourses() {
    filteredCourses = allCourses.filter(course => {
        const matchesCategory = currentCategory === 'all' || course.category === currentCategory;
        const matchesSearch = !currentSearchTerm || 
            course.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            course.instructor.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            (course.tags && course.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase())));
        
        return matchesCategory && matchesSearch;
    });
    
    displayedCourses = 6;
    displayCourses();
}

// Show loading animation
function showLoading() {
    coursesGrid.innerHTML = `
        <div class="loading" style="grid-column: 1/-1;">
            <div class="spinner"></div>
        </div>
    `;
}

// Show error message
function showErrorMessage(message) {
    coursesGrid.innerHTML = `
        <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #e53e3e;">
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="loadCoursesFromAPI()" class="btn btn-primary" style="margin-top: 1rem;">
                Try Again
            </button>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Real-time search (optional)
        searchInput.addEventListener('input', function() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                performSearch();
            }, 500);
        });
    }

    // Filter tags
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            this.classList.add('active');
            
            currentCategory = this.dataset.category;
            loadCoursesFromAPI(); // Reload courses with new category
        });
    });

    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            displayedCourses += 6;
            displayCourses();
        });
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // Here you could send the email to your backend
            showNotification(`Thank you for subscribing with email: ${email}`, 'success');
            this.reset();
        });
    }

    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you could send the form data to your backend
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            this.reset();
        });
    }

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });
}

// Perform search
function performSearch() {
    currentSearchTerm = searchInput.value.trim();
    filterCourses();
}

// Check if admin is logged in and show admin link
function checkAdminAccess() {
    if (AuthManager.isAuthenticated()) {
        addAdminLink();
    }
}

// Add admin link to navigation
function addAdminLink() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.querySelector('.admin-link')) {
        const adminLink = document.createElement('li');
        adminLink.innerHTML = '<a href="admin.html" class="nav-link admin-link">Admin Panel</a>';
        navMenu.appendChild(adminLink);
    }
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#e53e3e' : '#4f46e5'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for elements to be created
    setTimeout(() => {
        const animateElements = document.querySelectorAll('.course-card, .category-card, .about-text, .about-stats');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }, 100);
});

// Export for use in other files
window.APIService = APIService;
window.AuthManager = AuthManager;
window.showNotification = showNotification;