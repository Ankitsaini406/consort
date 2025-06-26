import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const sampleEvents = [
  {
    image: 'https://source.unsplash.com/random/800x600?conference',
    title: 'Global Tech Summit 2025',
    date: 'May 30, 2025',
  },
  {
    image: 'https://source.unsplash.com/random/800x600?workshop',
    title: 'AI & Machine Learning Workshop',
    date: 'June 5, 2025',
  },
  {
    image: 'https://source.unsplash.com/random/800x600?startup',
    title: 'Startup Pitch Day',
    date: 'June 12, 2025',
  },
  {
    image: 'https://source.unsplash.com/random/800x600?networking',
    title: 'Women in Tech Networking',
    date: 'June 20, 2025',
  },
  {
    image: 'https://source.unsplash.com/random/800x600?webinar',
    title: 'Cloud Computing Webinar',
    date: 'June 25, 2025',
  },
];

export default function EventsNewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
  }, [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* Left fade overlay */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
      {/* Right fade overlay */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {sampleEvents.map((event, index) => (
            <div
              key={index}
              className="flex-[0_0_auto] w-[80%] sm:w-[60%] md:w-[40%] lg:w-[33%] p-2"
            >
              <div className="rounded-lg shadow-lg bg-white p-4 hover:shadow-xl transition duration-300">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="mt-3 text-lg font-semibold text-gray-800">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === selectedIndex ? 'bg-gray-800' : 'bg-gray-400'
            }`}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
