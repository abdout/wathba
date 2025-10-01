/**
 * Performance monitoring utility
 * Tracks web vitals and custom performance metrics
 */

import logger from './logger';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      // Web Vitals thresholds (in ms)
      FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
      LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
      FID: { good: 100, needsImprovement: 300 },   // First Input Delay
      CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
      TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
      INP: { good: 200, needsImprovement: 500 }    // Interaction to Next Paint
    };
  }

  // Track a custom metric
  track(name, value, unit = 'ms') {
    const metric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      rating: this.getRating(name, value)
    };

    this.metrics.set(name, metric);

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Performance metric: ${name}`, metric);
    }

    return metric;
  }

  // Get rating for a metric value
  getRating(name, value) {
    const threshold = this.thresholds[name];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  // Start timing an operation
  startTiming(label) {
    const key = `timing_${label}`;
    this.metrics.set(key, performance.now());
  }

  // End timing and record the duration
  endTiming(label) {
    const key = `timing_${label}`;
    const start = this.metrics.get(key);

    if (start === undefined) {
      logger.warn(`No timing started for label: ${label}`);
      return null;
    }

    const duration = performance.now() - start;
    this.metrics.delete(key);

    return this.track(label, duration);
  }

  // Get all metrics
  getMetrics() {
    const metrics = {};
    this.metrics.forEach((value, key) => {
      if (!key.startsWith('timing_')) {
        metrics[key] = value;
      }
    });
    return metrics;
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
  }

  // Report metrics to analytics service
  async report() {
    const metrics = this.getMetrics();

    // Report to console in development
    if (process.env.NODE_ENV === 'development') {
      console.table(metrics);
    }

    // Report to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
          Object.entries(metrics).forEach(([name, data]) => {
            window.gtag('event', 'performance', {
              metric_name: name,
              value: data.value,
              metric_rating: data.rating,
              metric_unit: data.unit
            });
          });
        }

        // Custom analytics endpoint
        if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
          await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'performance',
              metrics,
              timestamp: Date.now(),
              url: typeof window !== 'undefined' ? window.location.href : undefined
            })
          });
        }
      } catch (error) {
        logger.error('Failed to report performance metrics', error);
      }
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Web Vitals reporter
export function reportWebVitals(metric) {
  // Track the metric
  performanceMonitor.track(metric.name, metric.value, 'ms');

  // Log poor performance
  const rating = performanceMonitor.getRating(metric.name, metric.value);
  if (rating === 'poor') {
    logger.warn(`Poor ${metric.name} performance: ${metric.value}ms`);
  }

  // Report to analytics
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true
      });
    }

    // Send to custom analytics
    const body = JSON.stringify(metric);
    const url = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    if (url) {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, {
          body,
          method: 'POST',
          keepalive: true
        });
      }
    }
  }
}

// Custom performance observer for long tasks
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  try {
    // Observe long tasks
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          performanceMonitor.track('long-task', entry.duration);

          if (entry.duration > 100) {
            logger.warn('Long task detected', {
              duration: `${entry.duration}ms`,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

export { performanceMonitor };
export default performanceMonitor;