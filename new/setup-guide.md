# 🚀 Korelium Frontend - Copy & Paste Setup Guide

## Step 1: Download the Files

Save these 4 files in the same folder:

### 📄 File 1: `index.html` (Main Website)
Copy the content from `korelium-index.html` and save as `index.html`

### 📄 File 2: `admin.html` (Admin Panel)  
Copy the content from `korelium-admin.html` and save as `admin.html`

### 📄 File 3: `style.css` (Complete Styling)
Copy the content from `korelium-style.css` and save as `style.css`

### 📄 File 4: `app.js` (Application Logic)
Copy the content from `korelium-app.js` and save as `app.js`

## Step 2: Update File References

### In `index.html`, change these lines:
```html
<!-- Change from: -->
<link rel="stylesheet" href="korelium-style.css">
<script src="korelium-app.js"></script>

<!-- To: -->
<link rel="stylesheet" href="style.css">
<script src="app.js"></script>
```

### In `admin.html`, change this line:
```html
<!-- Change from: -->
<link rel="stylesheet" href="korelium-style.css">

<!-- To: -->
<link rel="stylesheet" href="style.css">
```

## Step 3: Verify Your Backend

Make sure your backend is running:
```bash
cd your-backend-folder
npm start
```

You should see: `Server is running on http://localhost:9000`

## Step 4: Test the Setup

1. **Open Main Website**: Double-click `index.html`
2. **Open Admin Panel**: Double-click `admin.html`

### Admin Login:
- **Username**: `pown`
- **Password**: `1234`

## 📁 Final Folder Structure

```
your-website-folder/
├── index.html          # Main website (from korelium-index.html)
├── admin.html          # Admin panel (from korelium-admin.html)
├── style.css           # All styles (from korelium-style.css)
└── app.js              # All JavaScript (from korelium-app.js)
```

## ✅ Testing Checklist

- [ ] Backend runs on http://localhost:9000
- [ ] Main website opens without errors
- [ ] Admin panel opens and login works
- [ ] Courses load on the main site
- [ ] Theme toggle works (light/dark mode)
- [ ] Mobile menu works on small screens
- [ ] Admin can create/edit/delete courses

## 🎨 Quick Customizations

### Change Brand Colors:
In `style.css`, find and modify:
```css
:root {
  --brand-primary: #00d4ff;    /* Change this to your primary color */
  --brand-secondary: #6366f1;  /* Change this to your secondary color */
}
```

### Update Social Media:
In both HTML files, find `@korelium` and replace with your handles.

### Change Logo:
Replace this URL in both HTML files:
```
https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/604803b7-b51d-4f0c-97be-e6ae5b305935.png
```

## 🚨 Common Issues & Solutions

### Issue: "Failed to load courses"
**Solution**: Check if your backend is running on port 9000

### Issue: "CORS error" 
**Solution**: Make sure your backend has CORS enabled for the frontend

### Issue: Admin login doesn't work
**Solution**: Run your `admincreation.js` script to create the admin user

### Issue: Images don't show
**Solution**: Make sure the `uploads/courses/` folder exists in your backend

## 🎯 You're Done!

Your Korelium website is now ready with:
- ✅ Modern, responsive design
- ✅ Light/dark mode themes  
- ✅ Mobile-optimized interface
- ✅ Complete backend integration
- ✅ Admin panel for course management
- ✅ Fast loading with optimizations
- ✅ Social media integration (@korelium)

**Need help?** Check the browser console (F12) for any error messages.

---

**Built with ❤️ for the Korelium learning platform**