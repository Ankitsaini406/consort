import TechStackCube from './TechStackCube';

interface TechStackSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
  autoRotate?: boolean;
}

export default function TechStackSection({ 
  title = "Technology Architecture",
  subtitle = "Explore our layered platform architecture through an interactive visualization",
  className = "",
  autoRotate = true
}: TechStackSectionProps) {
  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            {title}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Cube Visualization */}
          <div className="flex justify-center lg:justify-end">
            <TechStackCube 
              autoRotate={autoRotate}
              rotationInterval={4000}
            />
          </div>
          
          {/* Content Description */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                AI Applications
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Ready-to-use enterprise applications for high-value use cases across industries.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Development Tools
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Integrated family of development tools available in a collaborative environment.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                AI Platform
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Complete software services suite to rapidly develop and operate enterprise applications.
              </p>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Scalable Architecture</h3>
              <p className="text-slate-600 leading-relaxed">
                Modular design ensures seamless scaling from small deployments to enterprise-wide implementations.
              </p>
            </div>
            
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Enterprise Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Built-in security at every layer, ensuring mission-critical communications remain protected and compliant.
              </p>
            </div>
            
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Developer Experience</h3>
              <p className="text-slate-600 leading-relaxed">
                Comprehensive APIs and SDKs enable rapid development with seamless third-party integrations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 