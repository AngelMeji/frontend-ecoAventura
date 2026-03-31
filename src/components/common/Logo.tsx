import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <span className="text-2xl font-display font-bold text-eco-primary-700 tracking-tight">EcoAventura</span>
        </div>
    );
};

export default Logo;
