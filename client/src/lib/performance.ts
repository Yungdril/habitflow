/**
 * Performance Monitoring
 * Track and optimize application performance
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export const getPerformanceMetrics = (): Partial<PerformanceMetrics> => {
  if (!window.performance || !window.performance.getEntriesByType) {
    return {};
  }

  const metrics: Partial<PerformanceMetrics> = {};

  // Page load time
  const navigationTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  if (navigationTiming) {
    metrics.pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
  }

  // First Contentful Paint
  const fcp = performance.getEntriesByName("first-contentful-paint")[0];
  if (fcp) {
    metrics.firstContentfulPaint = fcp.startTime;
  }

  // Largest Contentful Paint
  const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
  if (lcpEntries.length > 0) {
    metrics.largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
  }

  return metrics;
};

export const logPerformanceMetrics = () => {
  const metrics = getPerformanceMetrics();
  console.log("Performance Metrics:", metrics);
  
  // Log to analytics if available
  if (window.gtag) {
    window.gtag("event", "performance_metrics", {
      page_load_time: metrics.pageLoadTime,
      first_contentful_paint: metrics.firstContentfulPaint,
      largest_contentful_paint: metrics.largestContentfulPaint,
    });
  }
};

// Monitor API response times
export const measureAPICall = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`API Call "${name}" took ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`API Call "${name}" failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

// Monitor component render times
export const measureComponentRender = (componentName: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  if (duration > 16) {
    // Warn if render takes longer than one frame (16ms at 60fps)
    console.warn(`Component "${componentName}" render took ${duration.toFixed(2)}ms`);
  }
};
