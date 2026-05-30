/**
 * Google Analytics 4 Integration
 * Add your GA4 measurement ID to track user behavior and conversions
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const initializeGA = (measurementId: string) => {
  // Load GA4 script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    (window.dataLayer = window.dataLayer || []).push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_path: window.location.pathname,
  });
};

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (window.gtag) {
    window.gtag("config", {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

// Track habit creation
export const trackHabitCreated = (habitName: string) => {
  trackEvent("habit_created", {
    habit_name: habitName,
    timestamp: new Date().toISOString(),
  });
};

// Track habit completion
export const trackHabitCompleted = (habitName: string) => {
  trackEvent("habit_completed", {
    habit_name: habitName,
    timestamp: new Date().toISOString(),
  });
};

// Track user signup
export const trackUserSignup = (method: string) => {
  trackEvent("user_signup", {
    signup_method: method,
    timestamp: new Date().toISOString(),
  });
};

// Track feature usage
export const trackFeatureUsage = (featureName: string) => {
  trackEvent("feature_used", {
    feature_name: featureName,
    timestamp: new Date().toISOString(),
  });
};
