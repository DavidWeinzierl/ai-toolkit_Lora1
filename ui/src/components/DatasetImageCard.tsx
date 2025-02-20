import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface DatasetImageCardProps {
  imageUrl: string;
  alt: string;
  children?: ReactNode;
  className?: string;
}

const DatasetImageCard: React.FC<DatasetImageCardProps> = ({ imageUrl, alt, children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isCaptionLoaded, setIsCaptionLoaded] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>('');
  const isGettingCaption = useRef<boolean>(false);

  const fetchCaption = async () => {
    try {
      if (isGettingCaption.current || isCaptionLoaded) return;
      isGettingCaption.current = true;
      const response = await fetch(`/api/caption/${encodeURIComponent(imageUrl)}`);
      const data = await response.text();
      setCaption(data);
      setIsCaptionLoaded(true);
    } catch (error) {
      console.error('Error fetching caption:', error);
    }
  };

  useEffect(() => {
    isVisible && fetchCaption();
  }, [isVisible]);

  useEffect(() => {
    // Create intersection observer to check visibility
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = (): void => {
    setLoaded(true);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Square image container */}
      <div
        ref={cardRef}
        className="relative w-full"
        style={{ paddingBottom: '100%' }} // Make it square
      >
        <div className="absolute inset-0 overflow-hidden rounded-t-lg shadow-md">
          {isVisible && (
            <img
              src={`/api/img/${encodeURIComponent(imageUrl)}`}
              alt={alt}
              onLoad={handleLoad}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
          {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
        </div>
      </div>

      {/* Text area below the image */}
      <div className="w-full p-2 bg-gray-800 text-white text-sm rounded-b-lg h-[75px]">
        {isVisible && isCaptionLoaded && (
          <form>
            <textarea className="w-full bg-transparent resize-none" defaultValue={caption} rows={3} />
          </form>
        )}
      </div>
    </div>
  );
};

export default DatasetImageCard;
