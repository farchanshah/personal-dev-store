import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { ServicesShowcase } from '@/components/home/ServicesShowcase';
import { Testimonials } from '@/components/home/Testimonials';
import { CTASection } from '@/components/home/CTASection';
import { Stats } from '@/components/home/Stats';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Stats */}
      <Stats />
      
      {/* Featured Products */}
      <FeaturedProducts />
      
      {/* Services Showcase */}
      <ServicesShowcase />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

// File: apps/web/components/home/Hero.tsx
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-32">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border px-4 py-2 bg-white/80 backdrop-blur-sm">
              <span className="text-sm font-medium text-blue-600">
                🚀 Premium Developer Resources
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Build Faster with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Professional Tools
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl">
              Premium templates, tools, and services for modern developers.
              Everything you need to build, launch, and grow your projects.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
                Browse Products
              </button>
              
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all">
                View Services
              </button>
            </div>
            
            <div className="flex items-center gap-8 pt-8">
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Happy Developers</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-gray-900">24h</div>
                <div className="text-gray-600">Avg. Delivery Time</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-xl" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-pink-400 rounded-full opacity-20 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}