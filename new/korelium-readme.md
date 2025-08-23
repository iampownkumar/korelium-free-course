# Korelium Frontend Integration

A modern, responsive educational platform frontend that seamlessly integrates with your Node.js backend API.

## 🚀 Quick Start

1. **Copy the files** to your project directory:
   - `korelium-index.html` - Main website
   - `korelium-admin.html` - Admin panel
   - `korelium-style.css` - Complete styling
   - `korelium-app.js` - Application logic

2. **Start your backend server**:
   ```bash
   cd your-backend-directory
   npm start
   # Should run on http://localhost:9000
   ```

3. **Open the website**:
   - Main site: Open `korelium-index.html` in your browser
   - Admin panel: Open `korelium-admin.html` in your browser

## 📁 File Structure

```
your-project/
├── korelium-index.html     # Main website
├── korelium-admin.html     # Admin panel  
├── korelium-style.css      # Complete CSS styles
├── korelium-app.js         # JavaScript application
└── README.md               # This file
```

## 🎨 Features

### ✨ Modern Design
- **Sophisticated light/dark mode** with smooth transitions
- **Glassmorphism effects** with backdrop blur
- **Animated particle system** for visual appeal
- **Responsive design** optimized for all devices
- **Fast loading** with performance optimizations

### 🔌 API Integration
- **Full backend integration** with your localhost:9000 server
- **Course management** (view, create, edit, delete)
- **Admin authentication** with JWT tokens
- **Image upload support** for course thumbnails
- **Error handling** and offline detection

### 📱 Mobile-First
- **Touch-friendly** interface with 44px minimum touch targets
- **Responsive navigation** with mobile hamburger menu
- **Optimized layouts** for phones, tablets, and desktops
- **Fast touch interactions** with haptic feedback

### 🔧 Performance
- **Lazy loading** for images and content
- **API response caching** for faster navigation
- **Debounced search** to reduce server load
- **Optimized animations** with reduced motion support
- **Service worker ready** for offline functionality

## 🔐 Admin Panel

### Login Credentials
Use your existing admin credentials from your backend:
- Username: `pown` (from your admincreation.js file)
- Password: `1234` (from your admincreation.js file)

### Admin Features
- **Dashboard** with course statistics
- **Course management** with full CRUD operations
- **Image upload** for course thumbnails
- **Bulk operations** for managing multiple courses
- **Real-time API status** monitoring

## 🌐 API Endpoints Used

### Public Endpoints
- `GET /public/courses` - Get all courses (public access)
- `GET /api/course-categories` - Get course categories
- `GET /api/course/:slug` - Get single course by slug
- `GET /api/courses/category/:categorySlug` - Get courses by category

### Protected Endpoints (Admin)
- `POST /api/admin/login` - Admin authentication
- `GET /api/courses` - Get all courses (admin)
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

## 🎯 Social Media Integration

All social media links are configured for `@korelium`:
- **Instagram**: https://instagram.com/korelium
- **YouTube**: https://youtube.com/@korelium  
- **Twitter**: https://twitter.com/korelium

## 🛠️ Customization

### Color Themes
The CSS includes sophisticated light and dark mode themes. To customize colors, edit the CSS custom properties in `korelium-style.css`:

```css
:root {
  --brand-primary: #00d4ff;    /* Main brand color */
  --brand-secondary: #6366f1;  /* Secondary brand color */
  --brand-accent: #f59e0b;     /* Accent color */
  /* Add your custom colors here */
}
```

### API Configuration
To change the API base URL, edit the `CONFIG` object in `korelium-app.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:9000', // Change this to your API URL
    // ... other config options
};
```

### Content Customization
- **Logo**: Replace the logo URL in HTML files
- **Social handles**: Update `@korelium` references to your handles
- **Content**: Edit the HTML content in sections
- **Metadata**: Update SEO metadata in HTML head sections

## 📊 Performance Optimizations

### Built-in Optimizations
- **Image lazy loading** for faster initial page load
- **API response caching** with 5-minute TTL
- **Debounced search** (300ms delay)
- **CSS animations** optimized for 60fps
- **Minified assets** ready for production

### Recommended Additional Optimizations
1. **Serve files through CDN** for global delivery
2. **Enable gzip compression** on your server
3. **Use WebP images** for better compression
4. **Implement service worker** for offline caching
5. **Add performance monitoring** with tools like Lighthouse

## 🔒 Security Features

### Frontend Security
- **XSS protection** with proper input sanitization
- **CSRF protection** ready for implementation
- **Secure authentication** with JWT tokens
- **Input validation** on all forms
- **Admin panel protection** with authentication checks

### Backend Integration Security
- **CORS configured** for localhost:9000
- **Authentication headers** properly set
- **Error handling** without exposing sensitive data
- **Token storage** in localStorage with expiration

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load correctly
- [ ] Navigation works smoothly
- [ ] Course loading from API works
- [ ] Admin login functions properly
- [ ] Theme switching works
- [ ] Mobile menu operates correctly
- [ ] Forms submit successfully
- [ ] Images load properly

### API Testing
Test your API endpoints directly:
```bash
# Test public courses endpoint
curl http://localhost:9000/public/courses

# Test admin login
curl -X POST http://localhost:9000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"pown","password":"1234"}'
```

## 🐛 Troubleshooting

### Common Issues

**Problem**: Courses not loading
- **Solution**: Check if backend is running on port 9000
- **Check**: Browser console for CORS errors
- **Fix**: Ensure CORS is configured in your backend

**Problem**: Admin login fails
- **Solution**: Verify admin user exists in database
- **Check**: Run your `admincreation.js` script
- **Fix**: Check username/password combination

**Problem**: Images not displaying
- **Solution**: Check file paths in your uploads folder
- **Check**: Ensure `uploads/courses/` directory exists
- **Fix**: Verify image URLs in API responses

**Problem**: Styling not working
- **Solution**: Ensure CSS file is in same directory as HTML
- **Check**: Browser console for CSS loading errors
- **Fix**: Check file paths and names

### Development Tools
Open browser console and use `window.KoreliumDev` for debugging:
```javascript
// Check application state
console.log(window.KoreliumDev.state);

// Test API manually
window.KoreliumDev.api.get('/public/courses');

// Show custom notification
window.KoreliumDev.showNotification('Test message', 'success');
```

## 🚀 Deployment

### For Production
1. **Update API URLs** to your production domain
2. **Minify CSS and JavaScript** files
3. **Optimize images** and enable WebP format
4. **Configure CDN** for static assets
5. **Set up HTTPS** for secure connections
6. **Add analytics** tracking (Google Analytics, etc.)

### Environment Variables
Consider using environment-specific configurations:
```javascript
const CONFIG = {
    API_BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://api.korelium.org' 
        : 'http://localhost:9000'
};
```

## 📱 Browser Support

### Supported Browsers
- **Chrome** 90+ ✅
- **Firefox** 88+ ✅
- **Safari** 14+ ✅
- **Edge** 90+ ✅
- **Mobile browsers** (iOS Safari, Chrome Mobile) ✅

### Polyfills Included
- IntersectionObserver for older browsers
- CSS custom properties fallbacks
- Flexbox and Grid fallbacks

## 🤝 Contributing

### Code Style
- Use **2 spaces** for indentation
- Follow **semantic HTML** structure
- Use **BEM methodology** for CSS classes
- Write **accessible code** with ARIA labels
- Include **performance considerations**

### Commit Guidelines
- `feat:` New features
- `fix:` Bug fixes
- `style:` CSS/design changes
- `refactor:` Code improvements
- `docs:` Documentation updates

## 📞 Support

For issues with the frontend integration:
1. Check browser console for errors
2. Verify backend API is responding
3. Test with sample data
4. Check network tab for failed requests

## 🎓 Educational Platform Best Practices

This frontend follows modern educational platform design principles:

### UX/UI Best Practices
- **Clear navigation** with breadcrumbs
- **Progress indicators** for multi-step processes
- **Accessibility compliance** (WCAG 2.1 AA)
- **Mobile-first design** for on-the-go learning
- **Fast loading** for better engagement

### Learning Experience
- **Visual hierarchy** to guide attention
- **Consistent design patterns** for familiarity
- **Responsive layouts** for any device
- **Interactive elements** for engagement
- **Performance optimized** for global audiences

---

**Built with ❤️ by the Korelium Team (@korelium)**

Ready to transform digital education? 🚀