import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  const outlineInnerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
    
    if (checkIsMobile) {
      setIsMobile(true);
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const animate = () => {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;

      if (outlineRef.current) {
        outlineRef.current.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
      }
      requestAnimationFrame(animate);
    };

    const onMouseOver = (e) => {
      const clickable = e.target.closest('a, button, input, select, [role="button"]');
      
      if (outlineInnerRef.current && dotRef.current) {
        if (clickable) {
          outlineInnerRef.current.classList.add('scale-[1.5]', 'bg-black/10', 'dark:bg-[#C2A26F]/20', 'border-transparent', 'dark:border-transparent');
          dotRef.current.classList.add('opacity-0');
        } else {
          outlineInnerRef.current.classList.remove('scale-[1.5]', 'bg-black/10', 'dark:bg-[#C2A26F]/20', 'border-transparent', 'dark:border-transparent');
          dotRef.current.classList.remove('opacity-0');
        }
      }
    };

    const onMouseDown = () => {
      if (outlineInnerRef.current) outlineInnerRef.current.classList.add('scale-[0.8]');
    };
    const onMouseUp = () => {
      if (outlineInnerRef.current) outlineInnerRef.current.classList.remove('scale-[0.8]');
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    
    const animFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-black dark:bg-[#C2A26F] rounded-full pointer-events-none z-[10000] will-change-transform transition-opacity duration-200"
      />

      <div
        ref={outlineRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
      >
        <div
          ref={outlineInnerRef}
          className="w-10 h-10 -ml-5 -mt-5 border-2 border-black dark:border-[#C2A26F] rounded-full transition-all duration-300 ease-out"
        />
      </div>
    </>
  );
}