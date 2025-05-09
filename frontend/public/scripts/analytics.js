// Simple analytics script that will be loaded after the main content
console.log('Analytics script loaded');

// Function to track page views
function trackPageView() {
  const path = window.location.pathname;
  console.log(`Page view tracked: ${path}`);
  // In a real app, you would send this data to your analytics service
}

// Function to track user interactions
function trackEvent(category, action, label) {
  console.log(`Event tracked: ${category} - ${action} - ${label}`);
  // In a real app, you would send this data to your analytics service
}

// Initialize analytics when the script loads
document.addEventListener('DOMContentLoaded', function() {
  trackPageView();
  
  // Track navigation events
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (target && target.href) {
      trackEvent('Navigation', 'Click', target.href);
    }
  });
});
