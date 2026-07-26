const colors = {
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-600',
};

export default function Badge({ children, variant = 'default' }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[variant] || colors.default}`}>
      {children}
    </span>
  );
}

export { colors as badgeColors };
