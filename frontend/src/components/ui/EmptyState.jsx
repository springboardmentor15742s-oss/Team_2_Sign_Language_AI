import { classNames } from '../../utils/helpers';

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={classNames('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
          <Icon size={28} className="text-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
