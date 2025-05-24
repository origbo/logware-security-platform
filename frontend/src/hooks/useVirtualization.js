/**
 * Custom Hook for Virtualized Lists
 * 
 * This hook provides virtualization functionality for efficiently rendering large lists
 * in the Logware Security Platform.
 */
import { useState, useEffect, useMemo } from 'react';

/**
 * Hook for virtualizing large lists
 * @param {Object} options Configuration options
 * @param {Array} options.data Full data array
 * @param {number} options.itemHeight Height of each item in pixels
 * @param {number} options.windowHeight Visible window height in pixels
 * @param {number} options.overscan Number of items to render beyond visible area
 * @returns {Object} Virtualization props and data
 */
const useVirtualization = ({
  data = [],
  itemHeight = 50,
  windowHeight = 500,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate visible range
  const visibleRange = useMemo(() => {
    const totalHeight = data.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleItemCount = Math.ceil(windowHeight / itemHeight) + 2 * overscan;
    const endIndex = Math.min(data.length - 1, startIndex + visibleItemCount);
    
    return {
      startIndex,
      endIndex,
      visibleItemCount,
      totalHeight
    };
  }, [data.length, itemHeight, windowHeight, scrollTop, overscan]);
  
  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      ...item,
      virtualIndex: visibleRange.startIndex + index,
      offsetY: (visibleRange.startIndex + index) * itemHeight
    }));
  }, [data, visibleRange.startIndex, visibleRange.endIndex, itemHeight]);
  
  // Handle scroll events
  const handleScroll = (event) => {
    setScrollTop(event.target.scrollTop);
  };
  
  // Container and content styles
  const containerStyle = {
    height: `${windowHeight}px`,
    overflow: 'auto',
    position: 'relative'
  };
  
  const contentStyle = {
    height: `${visibleRange.totalHeight}px`,
    position: 'relative'
  };
  
  return {
    containerProps: {
      style: containerStyle,
      onScroll: handleScroll
    },
    contentProps: {
      style: contentStyle
    },
    visibleItems,
    virtualItemProps: (index) => ({
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${itemHeight}px`,
        transform: `translateY(${index * itemHeight}px)`
      }
    }),
    scrollToIndex: (index) => {
      setScrollTop(index * itemHeight);
    }
  };
};

export default useVirtualization;
