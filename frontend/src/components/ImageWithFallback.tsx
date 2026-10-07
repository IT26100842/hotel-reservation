import React, { useState } from 'react';
import { Bed } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  className?: string;
  containerClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackTitle,
  className = '',
  containerClassName = '',
  loading = 'eager',
  ...props
}) => {
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#E8E8E3] ${containerClassName}`}>
      {!error ? (
        <img
          src={src}
          alt={alt || 'Luxury room at Serene Stay'}
          referrerPolicy="no-referrer"
          loading={loading}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 opacity-100 ${className}`}
          {...props}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A34] to-[#0D2822] flex flex-col items-center justify-center p-4 text-center text-white/90">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Bed className="w-5 h-5 text-[#C2A26F]" />
          </div>
          <span className="text-xs font-serif tracking-wide text-white">
            {fallbackTitle || 'Serene Stay Sanctuary'}
          </span>
          <span className="text-[10px] text-white/60 mt-0.5">Oceanfront Luxury</span>
        </div>
      )}
    </div>
  );
};

