import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export function Breadcrumb({ items = [], className = '' }) {
  return (
    <nav className={classNames('flex items-center gap-1.5 text-sm', className)}>
      <Link to="/dashboard" className="text-slate-400 hover:text-primary transition-colors">
        <Home size={14} />
      </Link>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-slate-600" />
          {item.path ? (
            <Link to={item.path} className="text-slate-400 hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
