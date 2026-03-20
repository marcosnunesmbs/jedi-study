import { Sparkles } from 'lucide-react';

interface WelcomeMessageProps {
  message: string;
}

export function WelcomeMessage({ message }: WelcomeMessageProps) {
  const containerStyle: React.CSSProperties = {
    background: 'rgba(124, 58, 237, 0.05)', 
    borderLeft: '4px solid var(--primary)', 
    padding: '1.5rem', 
    marginBottom: '2rem', 
    borderRadius: '0 0.75rem 0.75rem 0',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start'
  };

  const iconStyle: React.CSSProperties = {
    color: 'var(--primary)',
    marginTop: '0.25rem'
  };

  const pStyle: React.CSSProperties = {
    color: 'var(--text-slate-700)', 
    fontSize: '1rem', 
    lineHeight: '1.6', 
    fontStyle: 'italic',
    margin: 0
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>
        <Sparkles size={24} />
      </div>
      <p style={pStyle}>
        "{message}"
      </p>
    </div>
  );
}
