import { Link } from 'react-router-dom';
import { Hand, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Hand size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold font-display text-gradient">SignSpeak</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered sign language learning platform. Learn, practice, and get certified.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/courses" className="text-sm text-gray-500 hover:text-primary transition-colors">Courses</Link></li>
              <li><Link to="/practice" className="text-sm text-gray-500 hover:text-primary transition-colors">Practice</Link></li>
              <li><Link to="/assessments" className="text-sm text-gray-500 hover:text-primary transition-colors">Assessments</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link to="/help" className="text-sm text-gray-500 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-sm text-gray-500 hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2026 SignSpeak. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Github size={18} /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Twitter size={18} /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Linkedin size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
