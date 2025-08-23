// Admin Panel JavaScript
// This file handles all admin panel functionality including CRUD operations for courses

class AdminPanel {
    constructor() {
        this.courses = [];
        this.isEditing = false;
        this.editingCourseId = null;
        this.init();
    }
    
    async init() {
        // Check authentication
        if (!AuthManager.isAuthenticated()) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        // Set admin username
        const username = localStorage.getItem('adminUsername') || 'Admin';
        document.getElementById('adminUsername').textContent = username;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadCourses();
        this.updateStatistics();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });
        
        // Course form submission
        document.getElementById('courseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCourseSubmit();
        });
        
        // Auto-generate slug from title
        document.getElementById('title').addEventListener('input', (e) => {
            const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            document.getElementById('slug').value = slug;
        });
        
        // Image preview
        document.getElementById('image').addEventListener('change', (e) => {
            this.previewImage(e.target.files[0]);
        });
    }
    
    switchSection(section) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(`${section}-section`).classList.remove('hidden');
        
        // Add active class to clicked button
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Load section-specific data
        if (section === 'stats') {
            this.updateStatistics();
        }
    }
    
    async loadCourses() {
        const loadingMsg = document.getElementById('coursesLoadingMsg');
        const errorMsg = document.getElementById('coursesErrorMsg');
        const tableContainer = document.getElementById('coursesTableContainer');
        
        try {
            loadingMsg.style.display = 'flex';
            errorMsg.classList.add('hidden');
            tableContainer.classList.add('hidden');
            
            // Fetch courses from admin API
            this.courses = await APIService.getAdminCourses();
            
            this.renderCoursesTable();
            
            loadingMsg.style.display = 'none';
            tableContainer.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error loading courses:', error);
            loadingMsg.style.display = 'none';
            errorMsg.textContent = `Error loading courses: ${error.message}`;
            errorMsg.classList.remove('hidden');
            
            if (error.message.includes('Authentication failed')) {
                // Token expired, redirect to login
                setTimeout(() => {
                    logout();
                }, 2000);
            }
        }
    }
    
    renderCoursesTable() {
        const tbody = document.getElementById('coursesTableBody');
        
        if (this.courses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <p>No courses found. <a href="#" onclick="adminPanel.switchSection('add-course')">Add your first course</a></p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.courses.map(course => `
            <tr>
                <td>
                    ${course.image ? 
                        `<img src="${API_CONFIG.BASE_URL}/${course.image}" alt="${course.title}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">` 
                        : '<div style="width: 60px; height: 40px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 20px;">📚</div>'
                    }
                </td>
                <td>
                    <div style="font-weight: 500;">${course.title}</div>
                    <div style="font-size: 0.8rem; color: #666;">${course.slug}</div>
                </td>
                <td>${course.instructor}</td>
                <td>
                    <span class="tag-pill">${course.category}</span>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                        <span style="color: #f59e0b;">⭐</span>
                        <span>${course.rating || 'N/A'}</span>
                    </div>
                </td>
                <td>${course.duration || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="adminPanel.editCourse(${course.id})" class="btn btn-sm btn-outline" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminPanel.deleteCourse(${course.id}, '${course.title.replace(/'/g, "\\'")}')" class="btn btn-sm btn-danger" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <a href="${course.udemyLink}" target="_blank" class="btn btn-sm btn-success" title="View on Udemy">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    async handleCourseSubmit() {
        const submitBtn = document.getElementById('submitCourseBtn');
        const submitText = document.querySelector('.submit-text');
        const submitSpinner = document.querySelector('.submit-spinner');
        const errorMsg = document.getElementById('courseFormErrorMsg');
        const successMsg = document.getElementById('courseFormSuccessMsg');
        
        try {
            // Show loading state
            submitText.classList.add('hidden');
            submitSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
            errorMsg.classList.add('hidden');
            successMsg.classList.add('hidden');
            
            // Gather form data
            const formData = this.gatherFormData();
            
            let response;
            if (this.isEditing) {
                response = await APIService.updateCourse(this.editingCourseId, formData);
                successMsg.textContent = 'Course updated successfully!';
            } else {
                response = await APIService.createCourse(formData);
                successMsg.textContent = 'Course created successfully!';
            }
            
            successMsg.classList.remove('hidden');
            
            // Reset form and reload courses
            this.resetCourseForm();
            await this.loadCourses();
            this.updateStatistics();
            
            // Show success notification
            showNotification(
                this.isEditing ? 'Course updated successfully!' : 'Course created successfully!',
                'success'
            );
            
        } catch (error) {
            console.error('Error saving course:', error);
            errorMsg.textContent = `Error saving course: ${error.message}`;
            errorMsg.classList.remove('hidden');
            
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            // Reset button state
            submitText.classList.remove('hidden');
            submitSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    gatherFormData() {
        const form = document.getElementById('courseForm');
        const formData = {};
        
        // Get all form fields
        const fields = [
            'title', 'slug', 'description', 'category', 'instructor', 'duration',
            'students', 'rating', 'udemyLink', 'fullDescription', 'prerequisites',
            'level', 'language', 'lastUpdated', 'certificate'
        ];
        
        fields.forEach(field => {
            const element = form.querySelector(`[name="${field}"]`);
            if (element) {
                formData[field] = element.value;
            }
        });
        
        // Handle special fields
        
        // Tags - convert comma-separated string to array
        const tagsValue = form.querySelector('[name="tags"]').value;
        if (tagsValue) {
            formData.tags = tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        
        // What you'll learn - convert line-separated string to array
        const whatYoullLearnValue = form.querySelector('[name="whatYoullLearn"]').value;
        if (whatYoullLearnValue) {
            formData.whatYoullLearn = whatYoullLearnValue.split('\n').map(item => item.trim()).filter(item => item);
        }
        
        // Image file
        const imageInput = form.querySelector('[name="image"]');
        if (imageInput.files.length > 0) {
            formData.image = imageInput.files[0];
        }
        
        // Convert certificate to boolean
        formData.certificate = formData.certificate === 'true';
        
        // Convert numeric fields
        if (formData.students) formData.students = parseInt(formData.students);
        if (formData.rating) formData.rating = parseFloat(formData.rating);
        
        return formData;
    }
    
    editCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;
        
        // Switch to add course section
        this.switchSection('add-course');
        
        // Set editing state
        this.isEditing = true;
        this.editingCourseId = courseId;
        
        // Update form title and button
        document.getElementById('courseFormTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Course';
        document.querySelector('.submit-text').textContent = 'Update Course';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        
        // Populate form with course data
        this.populateFormWithCourse(course);
    }
    
    populateFormWithCourse(course) {
        const form = document.getElementById('courseForm');
        
        // Set basic fields
        form.querySelector('[name="title"]').value = course.title || '';
        form.querySelector('[name="slug"]').value = course.slug || '';
        form.querySelector('[name="description"]').value = course.description || '';
        form.querySelector('[name="category"]').value = course.category || '';
        form.querySelector('[name="instructor"]').value = course.instructor || '';
        form.querySelector('[name="duration"]').value = course.duration || '';
        form.querySelector('[name="students"]').value = course.students || '';
        form.querySelector('[name="rating"]').value = course.rating || '';
        form.querySelector('[name="udemyLink"]').value = course.udemyLink || '';
        form.querySelector('[name="fullDescription"]').value = course.fullDescription || '';
        form.querySelector('[name="prerequisites"]').value = course.prerequisites || '';
        form.querySelector('[name="level"]').value = course.level || 'All Levels';
        form.querySelector('[name="language"]').value = course.language || 'English';
        form.querySelector('[name="lastUpdated"]').value = course.lastUpdated || '';
        form.querySelector('[name="certificate"]').value = course.certificate ? 'true' : 'false';
        
        // Handle tags
        if (course.tags && Array.isArray(course.tags)) {
            form.querySelector('[name="tags"]').value = course.tags.join(', ');
        }
        
        // Handle what you'll learn
        if (course.whatYoullLearn && Array.isArray(course.whatYoullLearn)) {
            form.querySelector('[name="whatYoullLearn"]').value = course.whatYoullLearn.join('\n');
        }
        
        // Handle image
        if (course.image) {
            const currentImage = document.getElementById('currentImage');
            const currentImagePreview = document.getElementById('currentImagePreview');
            currentImagePreview.src = `${API_CONFIG.BASE_URL}/${course.image}`;
            currentImage.classList.remove('hidden');
        }
    }
    
    async deleteCourse(courseId, courseTitle) {
        if (!confirm(`Are you sure you want to delete the course "${courseTitle}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            await APIService.deleteCourse(courseId);
            
            showNotification('Course deleted successfully!', 'success');
            
            // Reload courses and update statistics
            await this.loadCourses();
            this.updateStatistics();
            
        } catch (error) {
            console.error('Error deleting course:', error);
            showNotification(`Error deleting course: ${error.message}`, 'error');
        }
    }
    
    resetCourseForm() {
        document.getElementById('courseForm').reset();
        document.getElementById('currentImage').classList.add('hidden');
        document.getElementById('courseFormErrorMsg').classList.add('hidden');
        document.getElementById('courseFormSuccessMsg').classList.add('hidden');
        
        // Reset editing state
        this.isEditing = false;
        this.editingCourseId = null;
        document.getElementById('courseFormTitle').innerHTML = '<i class="fas fa-plus"></i> Add New Course';
        document.querySelector('.submit-text').textContent = 'Add Course';
        document.getElementById('cancelEditBtn').style.display = 'none';
    }
    
    cancelEdit() {
        this.resetCourseForm();
        this.switchSection('courses');
    }
    
    previewImage(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const currentImage = document.getElementById('currentImage');
            const currentImagePreview = document.getElementById('currentImagePreview');
            currentImagePreview.src = e.target.result;
            currentImage.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
    
    updateStatistics() {
        if (this.courses.length === 0) return;
        
        // Total courses
        document.getElementById('totalCoursesCount').textContent = this.courses.length;
        
        // Unique categories
        const categories = new Set(this.courses.map(course => course.category));
        document.getElementById('totalCategoriesCount').textContent = categories.size;
        
        // Average rating
        const ratingsSum = this.courses.reduce((sum, course) => sum + (course.rating || 0), 0);
        const avgRating = (ratingsSum / this.courses.length).toFixed(1);
        document.getElementById('avgRatingCount').textContent = avgRating;
    }
}

// Global functions for button onclick events
window.refreshCourses = async function() {
    await adminPanel.loadCourses();
    showNotification('Courses refreshed!', 'success');
};

window.resetCourseForm = function() {
    adminPanel.resetCourseForm();
};

window.cancelEdit = function() {
    adminPanel.cancelEdit();
};

window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        AuthManager.removeToken();
        localStorage.removeItem('adminUsername');
        window.location.href = 'admin-login.html';
    }
};

// Initialize admin panel when page loads
let adminPanel;
document.addEventListener('DOMContentLoaded', function() {
    adminPanel = new AdminPanel();
});

// Make adminPanel available globally for onclick events
window.adminPanel = adminPanel;