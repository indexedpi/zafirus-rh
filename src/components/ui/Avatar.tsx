import { cn } from '../../utils/cn';

const AVATAR_COLORS = ['#459CDB', '#8b5cf6', '#f59e0b', '#22c55e', '#ec4899'];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

interface AvatarProps {
  name: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, lastName, size = 'md', className }: AvatarProps) {
  const fullName = lastName ? `${name} ${lastName}` : name;
  const initials = lastName
    ? `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();

  const colorIndex = hashString(fullName) % AVATAR_COLORS.length;
  const backgroundColor = AVATAR_COLORS[colorIndex];

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
        sizes[size],
        className
      )}
      style={{ backgroundColor }}
      title={fullName}
    >
      {initials}
    </div>
  );
}
