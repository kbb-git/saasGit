import { NextResponse } from 'next/server';
import { fallbackScript } from './fallback';

export async function GET() {
  try {
    // Let's try a different URL and add more headers to simulate a browser request
    const scriptUrl = 'https://cdn.checkout.com/web-components/v2.0/flow/web-components-flow.js';
    console.log(`Attempting to fetch Checkout.com script from: ${scriptUrl}`);
    
    try {
      const response = await fetch(scriptUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://saasify.onrender.com/',
          'Origin': 'https://saasify.onrender.com',
          'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'script',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
        },
        cache: 'no-store', // Don't cache the initial fetch
      });

      if (response.ok) {
        // Get the script content from the primary URL
        const scriptContent = await response.text();
        console.log(`Successfully fetched script (${scriptContent.length} bytes)`);
        
        // Return the script with proper JavaScript content type
        return new NextResponse(scriptContent, {
          headers: {
            'Content-Type': 'application/javascript',
            // Add cache headers to improve performance
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          }
        });
      }
      
      console.error(`Failed to fetch script: ${response.status} ${response.statusText}`);
    } catch (primaryError) {
      console.error('Error fetching from primary URL:', primaryError);
    }
    
    // Try an alternative URL if the first one fails
    const alternativeUrl = 'https://cdn.checkout.com/web-components/v2/flow/web-components-flow.js';
    console.log(`Trying alternative URL: ${alternativeUrl}`);
    
    try {
      const alternativeResponse = await fetch(alternativeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://saasify.onrender.com/',
          'Origin': 'https://saasify.onrender.com',
        },
        cache: 'no-store',
      });
      
      if (alternativeResponse.ok) {
        const alternativeScriptContent = await alternativeResponse.text();
        console.log(`Successfully fetched script from alternative URL (${alternativeScriptContent.length} bytes)`);
        
        return new NextResponse(alternativeScriptContent, {
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          }
        });
      }
      
      console.error(`Alternative URL also failed: ${alternativeResponse.status} ${alternativeResponse.statusText}`);
    } catch (alternativeError) {
      console.error('Error fetching from alternative URL:', alternativeError);
    }
    
    // If both URLs fail, use the fallback script
    console.log('Using fallback script');
    return new NextResponse(fallbackScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Don't cache the fallback
      }
    });
    
  } catch (error) {
    console.error('Error in checkout script proxy:', error);
    
    // Return the fallback script even on unexpected errors
    return new NextResponse(fallbackScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
} 