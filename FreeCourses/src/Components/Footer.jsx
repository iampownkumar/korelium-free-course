import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-8">
        {/* Logo & About */}
        <div className="flex-1 mb-8 md:mb-0">
          <div className="flex items-center mb-4">
            <span className="text-xl font-bold text-white">Kore</span>
            <span className="text-xl font-bold text-red-400">lium</span>
          </div>
          <p className="text-gray-400 text-sm max-w-xs">
            Korelium is your trusted source for free and premium online courses. Learn new skills and boost your career with top instructors.
          </p>
        </div>
        {/* Links */}
        <div className="flex-1 grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-red-400 transition">Home</a></li>
              {/* <li><a href="#" className="hover:text-red-400 transition">Courses</a></li> */}
              <li><a href="/about" className="hover:text-red-400 transition">About Us</a></li>
              {/* <li><a href="#" className="hover:text-red-400 transition">Contact Us</a></li> */}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-red-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-red-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-red-400 transition">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        {/* Newsletter */}
        <div className="flex-1">
          <h3 className="font-semibold mb-3 text-white">Subscribe to Newsletter</h3>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-2 rounded bg-gray-800 text-gray-200 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded font-semibold transition"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Get updates on new courses and offers.
          </p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Korelium. All rights reserved.
      </div>
    </footer>
  );
}