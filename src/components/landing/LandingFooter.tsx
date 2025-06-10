
import { Diamond, Globe, Users, Building2 } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-purple-600"></div>
      
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-8">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Diamond className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Zarify</span>
                <div className="text-sm text-gray-400">AI-Powered Material Intelligence</div>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg mb-8 max-w-md">
              Transforming jewelry manufacturing with AI-powered insights into 
              raw materials and finished goods for maximum productivity.
            </p>
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Globe className="h-5 w-5" />
              </div>
              <div className="w-12 h-12 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Users className="h-5 w-5" />
              </div>
              <div className="w-12 h-12 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-8 text-lg">AI Insights</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors duration-300">Material Intelligence</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Inventory Analytics</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Production Optimization</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Predictive Insights</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-8 text-lg">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors duration-300">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">AI Research</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2024 Zarify. All rights reserved. Powered by AI for jewelry manufacturing.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
