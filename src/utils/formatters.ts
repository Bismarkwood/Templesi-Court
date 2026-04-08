// Format 'YYYY-MM-DD' to 'Apr 06, 2026'
export const formatDateV2 = (dateString: string) => {
  if (!dateString) return '';
  // Avoid time zone issues by splitting
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString; // fallback
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

// Avatar configurations
const AVATAR_COLORS = [
  { bg: '#EEF2FF', color: '#4F46E5' }, // indigo
  { bg: '#ECFDF5', color: '#059669' }, // green
  { bg: '#FFFBEB', color: '#D97706' }, // amber
  { bg: '#FFF1F2', color: '#E11D48' }  // rose
];

export const getAvatarColor = (name: string) => {
  // Deterministic color based on name length or char code
  if (!name) return AVATAR_COLORS[0];
  const code = name.charCodeAt(0) + name.length;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

export const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  
  if (s.includes('checked-in') || s === 'on duty' || s === 'available') {
    return { bg: '#ECFDF5', color: '#059669', dot: '#059669' };
  }
  if (s.includes('checked-out') || s === 'paid') {
    return { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A' };
  }
  if (s.includes('confirmed')) {
    return { bg: '#EEF2FF', color: '#4F46E5', dot: '#4F46E5' };
  }
  if (s.includes('pending') || s.includes('maintenance')) {
    return { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' };
  }
  // Default / others like reserved, occupied (let's map occupied to rose)
  if (s.includes('occupied')) {
     return { bg: '#FFF1F2', color: '#E11D48', dot: '#E11D48' };
  }
  
  // Default neutral
  return { bg: '#F4F4F4', color: '#555555', dot: '#555555' };
};
