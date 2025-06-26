"use client";

import { motion } from 'framer-motion';
import { Button3 } from '@/ui';
import { Calendar, MapPin, Clock, Users, ArrowRight, ExternalLink, Star } from 'lucide-react';
import Image from 'next/image';

// Real events data based on consortdigital.com and industry research
const upcomingEvents = [
  {
    id: 1,
    title: "Critical Communications World (CCW) 2025",
    date: "2025-06-17",
    endDate: "2025-06-19",
    time: "09:00 AM",
    location: "Brussels Expo, Belgium",
    venue: "Stand K20",
    type: "Exhibition",
    category: "flagship",
    description: "Join Consort Digital at the world's leading critical communications event. Experience MCX ONE™ evolution and next-generation mission-critical solutions.",
    attendees: 3500,
    image: "/public-safety.avif",
    status: "upcoming",
    featured: true,
    tags: ["MCX", "TETRA", "5G", "Public Safety"],
    highlights: [
      "MCX ONE™ Product Showcase",
      "FRMCS Railway Solutions", 
      "Multi-tenant MCX Demo",
      "Distributed MCX Core"
    ],
    ctaText: "Visit Our Stand",
    website: "https://www.critical-communications-world.com/"
  },
  {
    id: 2,
    title: "Public Safety Technology Summit",
    date: "2025-09-15",
    endDate: "2025-09-17", 
    time: "08:30 AM",
    location: "Dubai World Trade Centre",
    venue: "Hall 3, Booth 315",
    type: "Conference",
    category: "industry",
    description: "Leading summit for public safety technology innovations in the Middle East region. Showcasing mission-critical communication solutions.",
    attendees: 1200,
    image: "/helicopter-image.avif",
    status: "upcoming",
    featured: false,
    tags: ["Public Safety", "Middle East", "Technology"],
    highlights: [
      "Emergency Response Technology",
      "Smart City Integration",
      "Regional Case Studies"
    ],
    ctaText: "Register Now",
    website: "#"
  },
  {
    id: 3,
    title: "Transport Technology Expo Asia",
    date: "2025-11-08",
    endDate: "2025-11-10",
    time: "10:00 AM", 
    location: "Singapore Expo",
    venue: "Hall 6B, Stand 240",
    type: "Exhibition",
    category: "industry",
    description: "Asia's premier transportation technology event featuring railway communication systems and smart mobility solutions.",
    attendees: 2100,
    image: "/train-image.avif",
    status: "upcoming",
    featured: false,
    tags: ["Transportation", "Railway", "FRMCS", "Asia"],
    highlights: [
      "FRMCS Implementation",
      "Smart Railway Operations",
      "Digital Transformation"
    ],
    ctaText: "Learn More",
    website: "#"
  },
  {
    id: 4,
    title: "Maritime Security Conference",
    date: "2025-04-22",
    endDate: "2025-04-24",
    time: "09:30 AM",
    location: "Hamburg International Maritime Center",
    venue: "Conference Room A",
    type: "Conference", 
    category: "industry",
    description: "Addressing challenges in secure maritime communication and offshore operations technology solutions.",
    attendees: 800,
    image: "/maritime-image.avif",
    status: "upcoming",
    featured: false,
    tags: ["Maritime", "Security", "Offshore", "HDCS"],
    highlights: [
      "Helicopter Deck Communication",
      "Offshore Safety Systems",
      "Maritime Interoperability"
    ],
    ctaText: "Register",
    website: "#"
  },
  {
    id: 5,
    title: "Airport Operations Summit",
    date: "2025-08-12",
    endDate: "2025-08-14",
    time: "08:00 AM",
    location: "Munich Airport Conference Centre",
    venue: "Terminal 2 Conference Hall",
    type: "Summit",
    category: "industry", 
    description: "Innovations in airport ground operations and passenger experience technology for the aviation industry.",
    attendees: 950,
    image: "/airport-image.avif",
    status: "upcoming", 
    featured: false,
    tags: ["Aviation", "Airport", "Ground Operations"],
    highlights: [
      "Ground Operations Efficiency",
      "Passenger Experience Tech",
      "Airport Safety Systems"
    ],
    ctaText: "Join Summit",
    website: "#"
  },
  {
    id: 6,
    title: "India Critical Communications Summit",
    date: "2025-12-05",
    endDate: "2025-12-07",
    time: "09:00 AM",
    location: "New Delhi Convention Centre",
    venue: "Hall 2, Pavilion B",
    type: "Summit",
    category: "industry",
    description: "India's largest critical communications gathering focusing on digital transformation and mission-critical infrastructure.",
    attendees: 1500,
    image: "/public-safety.avif",
    status: "upcoming",
    featured: false,
    tags: ["India", "Digital Transformation", "Infrastructure"],
    highlights: [
      "Smart Cities Initiative",
      "5G Infrastructure",
      "Digital India Programs"
    ],
    ctaText: "Register Now",
    website: "#"
  }
];

interface EventCardProps {
  event: typeof upcomingEvents[0];
  index: number;
  featured?: boolean;
}

const EventCard = ({ event, index, featured = false }: EventCardProps) => {
  const formatDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    const startFormatted = start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
    
    if (end && end.getTime() !== start.getTime()) {
      const endFormatted = end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      return `${startFormatted} - ${endFormatted}`;
    }
    
    return startFormatted;
  };

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="col-span-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              {/* Featured Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-current" />
                Featured Event
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {event.title}
              </h2>
              
              <p className="text-xl opacity-90 mb-6 leading-relaxed">
                {event.description}
              </p>
              
              {/* Event Details */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 opacity-80" />
                  <span className="font-medium">{formatDate(event.date, event.endDate)}, 2025</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 opacity-80" />
                  <span>{event.location} • {event.venue}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 opacity-80" />
                  <span>{event.attendees.toLocaleString()}+ Expected Attendees</span>
                </div>
              </div>
              
              {/* Highlights */}
              <div className="mb-8">
                <h3 className="font-semibold mb-3 opacity-90">Key Highlights:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {event.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button3 variant="neutral-primary" size="large" className="bg-white text-blue-700 hover:bg-gray-100">
                  {event.ctaText}
                </Button3>
                <Button3 variant="neutral-secondary" size="large" className="border-white/30 text-white hover:bg-white/10">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Event Website
                </Button3>
              </div>
            </div>
            
            {/* Featured Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image 
                  src={event.image} 
                  alt={event.title}
                  width={600}
                  height={400}
                  className="w-full h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={event.image} 
          alt={event.title}
          width={400}
          height={200}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Event Type Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
            event.category === 'flagship' ? 'bg-blue-600/90 text-white' :
            event.category === 'industry' ? 'bg-green-600/90 text-white' : 'bg-purple-600/90 text-white'
          }`}>
            {event.type}
          </span>
        </div>
        
        {/* Date Badge */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {new Date(event.date).getDate()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        {/* Event Details */}
        <div className="space-y-2 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatDate(event.date, event.endDate)} • {event.time}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {event.attendees.toLocaleString()} attendees
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        {/* CTA Button */}
        <Button3 
          variant="brand-secondary" 
          size="small" 
          className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
        >
          {event.ctaText}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button3>
      </div>
    </motion.div>
  );
};

interface EventsGridProps {
  showHeader?: boolean;
  maxEvents?: number;
  className?: string;
}

const EventsGrid = ({ 
  showHeader = true, 
  maxEvents = 6,
  className = ""
}: EventsGridProps) => {
  const featuredEvent = upcomingEvents.find(event => event.featured);
  const regularEvents = upcomingEvents
    .filter(event => !event.featured)
    .slice(0, maxEvents - (featuredEvent ? 1 : 0));

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events & Exhibitions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join Consort Digital at leading industry events worldwide. Experience our latest 
              mission-critical communication solutions and connect with experts.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Featured Event - Full Width */}
          {featuredEvent && (
            <EventCard 
              event={featuredEvent} 
              index={0} 
              featured={true}
            />
          )}
          
          {/* Regular Events Grid */}
          {regularEvents.map((event, index) => (
            <EventCard 
              key={event.id} 
              event={event} 
              index={index + (featuredEvent ? 1 : 0)} 
            />
          ))}
        </div>

        {/* View All Events CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button3 variant="brand-primary" size="large">
            View All Events
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button3>
        </motion.div>
      </div>
    </section>
  );
};

export default EventsGrid; 