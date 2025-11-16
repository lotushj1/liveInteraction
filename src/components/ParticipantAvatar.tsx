import { useMemo } from 'react';
import { User } from 'lucide-react';

interface ParticipantAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

export function ParticipantAvatar({
  name,
  imageUrl,
  size = 'md',
  className = '',
}: ParticipantAvatarProps) {
  const initials = useMemo(() => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  const bgColor = useMemo(() => {
    if (!name) return 'bg-muted';

    // 根據名字生成一致的顏色
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  if (imageUrl) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden flex items-center justify-center bg-muted`}
      >
        <img
          src={imageUrl}
          alt={name || 'Participant'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} ${className} rounded-full flex items-center justify-center text-white font-semibold`}
    >
      {name ? initials : <User className="w-1/2 h-1/2" />}
    </div>
  );
}
