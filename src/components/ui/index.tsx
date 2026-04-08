import type { ReactNode } from 'react';
import './UI.css';

export const Card = ({ children, className = '', style, onClick }: { children: ReactNode, className?: string, style?: React.CSSProperties, onClick?: () => void }) => {
  return (
    <div className={`ui-card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

export const Badge = ({ children, status = 'default' }: { children: ReactNode, status?: 'success' | 'warning' | 'error' | 'info' | 'default' }) => {
  return (
    <span className={`ui-badge badge-${status}`}>
      {children}
    </span>
  );
};

interface SegmentedControlProps {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
}

export const SegmentedControl = ({ options, selected, onChange }: SegmentedControlProps) => {
  return (
    <div className="ui-segmented-control">
      {options.map(option => (
        <button
          key={option}
          className={`seg-btn ${selected === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};
