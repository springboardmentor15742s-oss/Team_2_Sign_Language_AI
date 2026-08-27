import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-primary-100 font-display mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">The page you are looking for does not exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()}><ArrowLeft size={16} /> Go Back</Button>
          <Link to="/dashboard"><Button><Home size={16} /> Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}
