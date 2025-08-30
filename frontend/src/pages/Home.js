import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Star,
  UserCheck
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Heart className="w-8 h-8 text-healthcare-600" />,
      title: "Patient-Centered Care",
      description: "Comprehensive care tracking and monitoring for better patient outcomes."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Secure & Compliant",
      description: "HIPAA-compliant platform with enterprise-grade security measures."
    },
    {
      icon: <Users className="w-8 h-8 text-secondary-600" />,
      title: "Care Team Coordination",
      description: "Seamless communication between patients, caregivers, and healthcare providers."
    },
    {
      icon: <Clock className="w-8 h-8 text-warm-600" />,
      title: "24/7 Monitoring",
      description: "Round-the-clock health monitoring and real-time alerts."
    }
  ];

  const benefits = [
    "Reduce administrative burden by 60%",
    "Improve patient satisfaction scores",
    "Streamline care coordination",
    "Ensure compliance with healthcare regulations",
    "Real-time health monitoring",
    "Secure data encryption"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Modern Healthcare
                <span className="block text-healthcare-300">Management</span>
              </h1>
              <p className="text-xl text-gray-100 leading-relaxed">
                Transform your healthcare practice with our comprehensive SaaS platform. 
                Streamline patient care, enhance communication, and improve outcomes with 
                cutting-edge technology designed for healthcare professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="btn-healthcare text-center">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link to="/about" className="btn-secondary text-center">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-6 h-6 text-healthcare-300" />
                    <span className="text-lg font-medium">Patient Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-6 h-6 text-red-400" />
                    <span className="text-lg font-medium">Care Tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <span className="text-lg font-medium">Secure Platform</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose LifeTrack?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is designed specifically for healthcare professionals, 
              providing the tools you need to deliver exceptional care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Transform Your Healthcare Practice
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of healthcare professionals who trust LifeTrack to 
                manage their patient care and streamline their operations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-healthcare-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-8">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Trusted by Healthcare Professionals
                </h3>
                <p className="text-gray-600 mb-6">
                  "LifeTrack has revolutionized how we manage patient care. 
                  The platform is intuitive, secure, and has significantly 
                  improved our efficiency."
                </p>
                <div className="text-sm text-gray-500">
                  - Dr. Sarah Johnson, Chief Medical Officer
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust LifeTrack to 
            deliver better patient care and streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-healthcare">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
