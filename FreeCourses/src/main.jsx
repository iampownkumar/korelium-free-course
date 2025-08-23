import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'

// Import components with correct paths
import Header from './Components/Header.jsx'
import Footer from './Components/Footer.jsx'
import { Home } from './Pages/Home.jsx'
import CourseDetail from './Pages/CourseDetail.jsx'
import About from './Pages/About.jsx'
import Contact from './Pages/Contact.jsx'
import AdminLogin from './Pages/AdminLogin.jsx'
import AdminPanel from './Pages/AdminPanel.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course/:slug" element={<CourseDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  </StrictMode>
)
