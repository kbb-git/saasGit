// This is a fallback script that will be returned if the real Checkout.com script cannot be loaded
export const fallbackScript = `
// Fallback script for Checkout.com Web Components
console.warn('Using fallback Checkout.com script - actual script could not be loaded');

// Create a minimal implementation that shows an error message
window.CheckoutWebComponents = function(options) {
  console.error('Unable to load Checkout.com payment system.');
  
  // Call the onError handler if provided
  if (options && typeof options.onError === 'function') {
    setTimeout(() => {
      options.onError(null, { 
        message: 'Payment system could not be loaded. Please try again later or contact support.'
      });
    }, 500);
  }
  
  // Return a minimal implementation
  return Promise.resolve({
    create: function(componentType) {
      console.warn('Creating fallback component:', componentType);
      return {
        mount: function(element) {
          if (element) {
            // Create error UI
            element.innerHTML = \`
              <div style="border: 1px solid #f56565; background-color: #fff5f5; color: #c53030; padding: 1rem; border-radius: 0.375rem; text-align: center;">
                <p style="font-weight: bold; margin-bottom: 0.5rem;">Payment System Unavailable</p>
                <p style="margin-bottom: 0.5rem;">We're unable to load the payment system at this time.</p>
                <p>Please try again later or contact support if the problem persists.</p>
                <button 
                  style="margin-top: 1rem; background-color: #c53030; color: white; font-weight: 500; padding: 0.5rem 1rem; border-radius: 0.25rem; border: none;"
                  onclick="window.location.reload()">
                  Retry
                </button>
              </div>
            \`;
          }
        }
      };
    },
    unmount: function() {
      console.warn('Unmounting fallback component');
    }
  });
};
`; 