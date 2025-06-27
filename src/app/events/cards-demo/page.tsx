"use client";

import EventsGrid from '@/components/EventsGrid';
import { motion } from 'framer-motion';

export default function EventsCardsDemo() {
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
              Amazing Event Cards & Grid Layout
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Experience the most elegant event cards designed for your new website. 
              Perfect grid layout with stunning animations and real industry event data.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Grid Section */}
      <EventsGrid />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            🎨 Card Design Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Event Hero</h3>
              <p className="text-gray-600 mb-4">
                Full-width hero card with gradient background, multiple highlights, and dual CTA buttons for maximum impact.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Gradient blue background</li>
                <li>• Key highlights showcase</li>
                <li>• Dual action buttons</li>
                <li>• Rotated image effect</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Cards</h3>
              <p className="text-gray-600 mb-4">
                Hover effects with scale transforms, image zoom, shadow changes, and smooth color transitions.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Hover lift animation</li>
                <li>• Image scale effect</li>
                <li>• Shadow transitions</li>
                <li>• Color state changes</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Responsive Design</h3>
              <p className="text-gray-600 mb-4">
                Perfect grid layout that adapts from 1 column on mobile to 3 columns on desktop with optimal spacing.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Mobile-first approach</li>
                <li>• Flexible grid system</li>
                <li>• Optimal breakpoints</li>
                <li>• Touch-friendly design</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            🔧 Technical Implementation
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Real Event Data</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">✅ Critical Communications World (CCW) 2025</h4>
                  <p className="text-sm text-gray-600">Brussels Expo • June 17-19 • Stand K20</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">✅ Public Safety Technology Summit</h4>
                  <p className="text-sm text-gray-600">Dubai • September 15-17 • Hall 3</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">✅ Transport Technology Expo Asia</h4>
                  <p className="text-sm text-gray-600">Singapore • November 8-10 • Hall 6B</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl">
              <h3 className="text-xl font-semibold text-blue-900 mb-6">Card Elements</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-blue-900">Event Type Badges</h4>
                    <p className="text-sm text-blue-700">Color-coded by category (flagship, industry, technical)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-blue-900">Date Display</h4>
                    <p className="text-sm text-blue-700">Smart date formatting with month/day badges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-blue-900">Event Details</h4>
                    <p className="text-sm text-blue-700">Time, location, venue, and attendee count</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-blue-900">Topic Tags</h4>
                    <p className="text-sm text-blue-700">Relevant technology and industry tags</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Guide */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            🚀 Ready for Your Landing Page
          </h2>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfect Integration</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Matches your existing design system
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Same elegant style as ServicesGrid
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Consistent color palette & typography
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Optimized for performance
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Easy Customization</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Update event data as needed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Adjust max events displayed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Toggle header visibility
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Custom CSS classes support
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <p className="text-gray-700 mb-4">
                <strong>Simple Integration:</strong> Just import the EventsGrid component and place it 
                anywhere in your landing page. It's fully self-contained and responsive.
              </p>
              <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg text-sm text-left">
                {`<EventsGrid showHeader={true} maxEvents={6} />`}
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 