'use client';

import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

interface CarouselIndicatorsProps {
  children: ReactNode[];
  itemWidth?: number;
  gap?: number;
  className?: string;
}

/**
 * Modern Carousel with Dash Indicators
 *
 * UX Design Decisions:
 * - Pills/dashes instead of dots (more modern, Apple-style)
 * - Active indicator expands with smooth spring animation
 * - Clickable indicators for quick navigation
 * - Real-time scroll tracking
 * - Subtle hover states
 */
export function CarouselWithIndicators({
  children,
  itemWidth = 300,
  gap = 20,
  className = '',
}: CarouselIndicatorsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const itemCount = children.length;

  // Calculate active index based on scroll position
  const updateActiveIndex = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
      setActiveIndex(0);
      return;
    }

    // Calculate which item is most centered in view
    const itemTotalWidth = itemWidth + gap;
    const currentIndex = Math.round(scrollLeft / itemTotalWidth);
    const clampedIndex = Math.min(Math.max(0, currentIndex), itemCount - 1);

    setActiveIndex(clampedIndex);
  }, [itemWidth, gap, itemCount]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;

    const itemTotalWidth = itemWidth + gap;
    const scrollPosition = index * itemTotalWidth;

    scrollRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  }, [itemWidth, gap]);

  // Listen to scroll events
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      requestAnimationFrame(updateActiveIndex);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [updateActiveIndex]);

  // Mouse drag for desktop
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let isDown = false;
    let startX: number;
    let scrollLeftStart: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      setIsDragging(true);
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeftStart = scrollContainer.scrollLeft;
      scrollContainer.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
      isDown = false;
      setIsDragging(false);
      scrollContainer.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDown = false;
      setIsDragging(false);
      scrollContainer.style.cursor = 'grab';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollContainer.scrollLeft = scrollLeftStart - walk;
    };

    scrollContainer.addEventListener('mousedown', handleMouseDown);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('mouseup', handleMouseUp);
    scrollContainer.addEventListener('mousemove', handleMouseMove);

    return () => {
      scrollContainer.removeEventListener('mousedown', handleMouseDown);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('mouseup', handleMouseUp);
      scrollContainer.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`carousel-container ${className}`}>
      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="carousel-scroll"
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>

      {/* Modern Dash Indicators */}
      <div className="carousel-indicators">
        {Array.from({ length: itemCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`carousel-indicator ${
              index === activeIndex ? 'active' : ''
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Alternative: Progress Dots (smaller, more discrete)
 */
export function CarouselWithDots({
  children,
  itemWidth = 300,
  gap = 20,
  className = '',
}: CarouselIndicatorsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = children.length;

  const updateActiveIndex = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft } = scrollRef.current;
    const itemTotalWidth = itemWidth + gap;
    const currentIndex = Math.round(scrollLeft / itemTotalWidth);
    const clampedIndex = Math.min(Math.max(0, currentIndex), itemCount - 1);

    setActiveIndex(clampedIndex);
  }, [itemWidth, gap, itemCount]);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;

    const itemTotalWidth = itemWidth + gap;
    scrollRef.current.scrollTo({
      left: index * itemTotalWidth,
      behavior: 'smooth',
    });
  }, [itemWidth, gap]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', updateActiveIndex, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', updateActiveIndex);
  }, [updateActiveIndex]);

  return (
    <div className={`carousel-container ${className}`}>
      <div
        ref={scrollRef}
        className="carousel-scroll"
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>

      {/* Minimal Dot Indicators */}
      <div className="carousel-dots">
        {Array.from({ length: itemCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default CarouselWithIndicators;
