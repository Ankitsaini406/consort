"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button3 } from '@/ui';
import { Calendar, MapPin, Clock, Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Sample events data
const sampleEvents = [
  {
    id: 1,
    title: "MCX Technology Summit 2024",
    date: "2024-07-15",
    time: "09:00 AM",
    location: "Dubai World Trade Centre",
    type: "Conference",
    category: "flagship",
    description: "Annual flagship event showcasing the latest in mission-critical communication technology",
    attendees: 500,
    image: "/public-safety.avif",
    status: "upcoming",
    tags: ["MCX", "Technology", "Networking"]
  },
  {
    id: 2,
    title: "Public Safety Expo Singapore",
    date: "2024-08-22",
    time: "10:00 AM", 
    location: "Marina Bay Sands",
    type: "Exhibition",
    category: "industry",
    description: "Demonstrating next-gen solutions for first responders and emergency services",
    attendees: 1200,
    image: "/helicopter-image.avif",
    status: "upcoming",
    tags: ["Public Safety", "Emergency", "Singapore"]
  },
  {
    id: 3,
    title: "Railway Communication Workshop",
    date: "2024-06-10",
    time: "02:00 PM",
    location: "London Tech Hub",
    type: "Workshop",
    category: "technical",
    description: "Deep dive into LTE solutions for railway operations and passenger services",
    attendees: 80,
    image: "/train-image.avif",
    status: "past",
    tags: ["Railway", "LTE", "Workshop"]
  },
  {
    id: 4,
    title: "Maritime Security Conference",
    date: "2024-09-05",
    time: "11:30 AM",
    location: "Hamburg International Maritime Center",
    type: "Conference",
    category: "industry",
    description: "Addressing challenges in secure maritime communication and offshore operations",
    attendees: 300,
    image: "/maritime-image.avif",
    status: "upcoming",
    tags: ["Maritime", "Security", "Offshore"]
  },
  {
    id: 5,
    title: "Airport Operations Summit",
    date: "2024-10-18",
    time: "08:30 AM",
    location: "Munich Airport Conference Centre",
    type: "Summit",
    category: "industry",
    description: "Innovations in airport ground operations and passenger experience technology",
    attendees: 400,
    image: "/airport-image.avif",
    status: "upcoming",
    tags: ["Aviation", "Airport", "Operations"]
  },
  {
    id: 6,
    title: "MCX ONE Platform Launch",
    date: "2024-05-20",
    time: "06:00 PM",
    location: "Virtual Event",
    type: "Product Launch",
    category: "flagship",
    description: "Official launch of our revolutionary MCX ONE communication platform",
    attendees: 800,
    image: "/public-safety.avif",
    status: "past",
    tags: ["Product Launch", "MCX ONE", "Platform"]
  }
];

// Option Components
const TimelineEvents = () => {
  const upcomingEvents = sampleEvents.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = sampleEvents.filter(e => e.status === 'past').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const EventCard = ({ event, index, isPast = false }: { event: any, index: number, isPast?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-8`}
    >
      <div className={`w-full max-w-md ${isPast ? 'opacity-70' : ''}`}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              event.category === 'flagship' ? 'bg-blue-100' : 
              event.category === 'industry' ? 'bg-green-100' : 'bg-purple-100'
            }`}>
              <Calendar className={`w-6 h-6 ${
                event.category === 'flagship' ? 'text-blue-600' : 
                event.category === 'industry' ? 'text-green-600' : 'text-purple-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.type}</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {new Date(event.date).toLocaleDateString()} • {event.time}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              {event.attendees} attendees
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{event.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {event.tags.slice(0, 2).map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded-full">{tag}</span>
              ))}
            </div>
            {!isPast && (
              <Button3 variant="brand-primary" size="small">
                Register <ArrowRight className="w-4 h-4 ml-1" />
              </Button3>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Timeline line */}
      <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-gray-200"></div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Upcoming Events</h2>
        {upcomingEvents.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} />
        ))}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-600">Past Events</h2>
        {pastEvents.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} isPast />
        ))}
      </div>
    </div>
  );
};

const CalendarEvents = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sampleEvents.filter(event => event.date === dateStr);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div key={day} className={`p-2 min-h-[100px] border border-gray-100 ${isToday ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          {events.map(event => (
            <div key={event.id} className={`text-xs p-1 mb-1 rounded ${
              event.category === 'flagship' ? 'bg-blue-100 text-blue-800' :
              event.category === 'industry' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            } truncate`}>
              {event.title}
            </div>
          ))}
        </div>
      );
    }
    
    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {renderCalendarDays()}
      </div>

      {/* Event Legend */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span className="text-sm text-gray-600">Flagship Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span className="text-sm text-gray-600">Industry Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-400 rounded"></div>
          <span className="text-sm text-gray-600">Technical Events</span>
        </div>
      </div>
    </div>
  );
};

const FeaturedEvents = () => {
  const featuredEvent = sampleEvents.find(e => e.category === 'flagship' && e.status === 'upcoming');
  const otherEvents = sampleEvents.filter(e => e.id !== featuredEvent?.id && e.status === 'upcoming').slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Featured Event Hero */}
      {featuredEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                  Featured Event
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">{featuredEvent.title}</h2>
                <p className="text-xl opacity-90 mb-6">{featuredEvent.description}</p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(featuredEvent.date).toLocaleDateString()} • {featuredEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>{featuredEvent.attendees}+ Expected Attendees</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button3 variant="neutral-primary" size="large">
                    Register Now
                  </Button3>
                  <Button3 variant="neutral-secondary" size="large">
                    Learn More
                  </Button3>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={featuredEvent.image} 
                  alt={featuredEvent.title}
                  className="rounded-2xl w-full h-64 lg:h-80 object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Other Events Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-8">More Upcoming Events</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.category === 'industry' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {event.type}
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>
                
                <Button3 variant="brand-secondary" size="small" className="w-full">
                  View Details
                </Button3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function EventsDemo() {
  const [activeOption, setActiveOption] = useState<'timeline' | 'calendar' | 'featured'>('timeline');

  const options = [
    { id: 'timeline', name: 'Timeline Events', description: 'Chronological timeline showing upcoming and past events' },
    { id: 'calendar', name: 'Calendar View', description: 'Monthly calendar with event highlights and navigation' },
    { id: 'featured', name: 'Featured Events', description: 'Hero featured event with supporting event grid' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events Section - Demo Options</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from 3 different UX approaches for displaying events. Each option offers unique advantages for user engagement and event discovery.
          </p>
        </div>

        {/* Option Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveOption(option.id as any)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                activeOption === option.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <h3 className="font-semibold mb-1">{option.name}</h3>
                <p className="text-sm opacity-75">{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 lg:p-12 shadow-sm">
          {activeOption === 'timeline' && <TimelineEvents />}
          {activeOption === 'calendar' && <CalendarEvents />}
          {activeOption === 'featured' && <FeaturedEvents />}
        </div>

        {/* Footer Notes */}
        <div className="mt-12 text-center text-gray-500">
          <p className="mb-4">✨ Each option can be fully customized with your branding, colors, and specific event data</p>
          <p>Select your preferred approach and we'll implement it with your real event content!</p>
        </div>
      </div>
    </div>
  );
} 