"use client";

import EventsGrid from '@/components/EventsGrid';
import { motion } from 'framer-motion';

export default function EventsLandingDemo() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Events Section Demo
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              See how the EventsGrid component can be seamlessly integrated into your landing page. 
              These are the most amazing event cards designed for your new website.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Grid Section - This is what you can paste into your landing page */}
      <EventsGrid />

      {/* Additional Demo Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ✨ Component Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">🎨 Amazing Cards</h3>
              <p className="text-sm text-gray-600">Beautiful, interactive event cards with hover effects and smooth animations</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">📱 Responsive</h3>
              <p className="text-sm text-gray-600">Perfect grid layout that adapts to all screen sizes and devices</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">🌟 Featured Events</h3>
              <p className="text-sm text-gray-600">Hero-style featured event card with premium design treatment</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">🔧 Customizable</h3>
              <p className="text-sm text-gray-600">Easy to customize colors, content, and integrate with your brand</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Instructions */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 How to Use in Your Landing Page
          </h2>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Simple Integration:</h3>
            <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
              {`import EventsGrid from '@/components/EventsGrid';

export default function HomePage() {
  return (
    <div>
      {/* Your other sections */}
      
      {/* Events Section */}
      <EventsGrid 
        showHeader={true}
        maxEvents={6}
        className="bg-gray-50"
      />
      
      {/* Your other sections */}
    </div>
  );
}`}
            </code>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-3">✅ What's Included:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Real industry event data</li>
                <li>• Featured event hero section</li>
                <li>• Responsive grid layout</li>
                <li>• Smooth animations</li>
                <li>• Event details & CTA buttons</li>
                <li>• Category-based styling</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-3">🎯 Perfect For:</h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Landing page sections</li>
                <li>• Event promotion</li>
                <li>• Company engagement</li>
                <li>• Industry presence</li>
                <li>• Lead generation</li>
                <li>• Professional networking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Example of how it might look with other sections */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🏆 Perfect for Your New Website
          </h2>
          <p className="text-gray-700 mb-8">
            This EventsGrid component can be dropped into any section of your landing page. 
            It maintains the same elegant design language as your ServicesGrid and integrates 
            seamlessly with your overall site architecture.
          </p>
          
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-lg font-medium text-gray-900 mb-2">Ready to implement?</p>
            <p className="text-gray-600">
              The component is fully responsive, accessible, and optimized for performance. 
              Simply paste it into your landing page where you want the events section to appear.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 