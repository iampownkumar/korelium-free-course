import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom"; // Changed from Link to NavLink
import { Menu, X, MessageCircle } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTelegramJoin = () => {
    window.open('https://t.me/korelium', '_blank');
  };

  const handleWhatsAppJoin = () => {
    window.open('https://whatsapp.com/channel/0029Vb6hyZwGpLHQMeoPHD3J', '_blank');
  };

  const navigationLinks = [
    { linkName: "Home", link: "/" },
    { linkName: "About", link: "/about" },
    { linkName: "Login", link: "/admin-login" }
  ];

  // Active link styling function
  const getNavLinkClass = ({ isActive }) => {
    return `relative py-2 font-bold text-lg transition-all duration-300 group ${
      isActive 
        ? 'text-purple-600' 
        : 'text-gray-700 hover:text-purple-600'
    }`;
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-lg">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-black text-xl">KB</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
            <div className="hidden sm:block cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex flex-col">
                <span className="text-2xl xl:text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">Korelium</span>
                <span className="text-xs text-gray-500 font-medium tracking-wide">Learn • Grow • Succeed</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <nav className="flex items-center gap-8">
              {navigationLinks.map((item) => (
                <NavLink 
                  key={item.linkName}
                  to={item.link} 
                  className={getNavLinkClass}
                  end={item.link === "/"} // Add 'end' prop for home route
                >
                  {({ isActive }) => (
                    <>
                      {item.linkName}
                      <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Social Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleTelegramJoin}
              className="group flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
              <span className="font-semibold text-xs lg:text-sm">Telegram</span>
            </button>
            
            <button 
              onClick={handleWhatsAppJoin}
              className="group flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
              <span className="font-semibold text-xs lg:text-sm">WhatsApp</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-40">
          {/* Social Groups Mobile */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 mb-3 text-lg">Join Our Community</h4>
            <div className="flex gap-3">
              <button
                onClick={handleTelegramJoin}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Telegram Group
              </button>
              <button
                onClick={handleWhatsAppJoin}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Group
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-3">
            {navigationLinks.map((item) => (
              <NavLink
                key={item.linkName}
                to={item.link}
                className={({ isActive }) => 
                  `block py-3 px-4 font-bold text-lg transition-all duration-300 rounded-xl ${
                    isActive 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
                end={item.link === "/"}
              >
                {item.linkName}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
