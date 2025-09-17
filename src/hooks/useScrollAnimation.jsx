import { useEffect, useRef, useState } from 'react';

const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element is visible in the viewport
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once it's visible, no need to observe anymore
          observer.unobserve(entry.target);
        }
      },
      {
        threshold, // Percentage of element visibility needed to trigger the callback
      }
    );

    const currentRef = ref.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

export default useScrollAnimation;
