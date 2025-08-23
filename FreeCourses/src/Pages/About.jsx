import React from 'react';
import { CheckCircle, Users, Award, Target, Heart, Zap } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <CheckCircle className="text-green-600" size={32} />,
      title: "100% Free Courses",
      description: "Access thousands of premium courses at absolutely no cost"
    },
    {
      icon: <Users className="text-blue-600" size={32} />,
      title: "Expert Instructors",
      description: "Learn from industry professionals and certified educators"
    },
    {
      icon: <Award className="text-purple-600" size={32} />,
      title: "Certificates",
      description: "Earn recognized certificates upon course completion"
    },
    {
      icon: <Target className="text-red-600" size={32} />,
      title: "Skill-Focused",
      description: "Courses designed to build practical, job-ready skills"
    },
    {
      icon: <Heart className="text-pink-600" size={32} />,
      title: "Community Driven",
      description: "Join a supportive community of learners worldwide"
    },
    {
      icon: <Zap className="text-yellow-600" size={32} />,
      title: "Regular Updates",
      description: "Fresh content added daily from top educational platforms"
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Students" },
    { number: "1000+", label: "Free Courses" },
    { number: "50+", label: "Categories" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              About <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Korelium</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to democratize education by making quality learning accessible to everyone, everywhere.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  At Korelium, we believe that education should be accessible to everyone, regardless of their financial situation. 
                  We curate and provide free access to premium courses from leading educational platforms like Udemy, 
                  helping millions of learners worldwide acquire new skills and advance their careers.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our platform serves as a bridge between quality education and learners who are eager to grow but may not 
                  have the financial means to access premium content. We're committed to breaking down barriers and creating 
                  opportunities for personal and professional development.
                </p>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                  alt="Team collaboration"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-2xl text-gray-900">50K+</div>
                      <div className="text-gray-600">Students Helped</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Korelium?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're more than just a platform - we're your partner in lifelong learning
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
              <p className="text-xl text-gray-600">Numbers that speak for themselves</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white p-8 rounded-2xl shadow-lg">
                  <div className="text-4xl font-black text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">The principles that guide everything we do</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-blue-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Accessibility</h3>
                <p className="text-gray-600 leading-relaxed">
                  We believe everyone deserves access to quality education, regardless of their background or financial situation.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  We carefully curate and verify all courses to ensure our learners receive only the highest quality content.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="text-purple-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  We foster a supportive learning community where students can connect, share, and grow together.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Learning?</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already advancing their careers with our free courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200">
                Browse Courses
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
