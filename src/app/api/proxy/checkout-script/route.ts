import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch the script from Checkout.com
    const response = await fetch(
      'https://cdn.checkout.com/web-components/v2.0/flow/web-components-flow.js',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SaaSify/1.0)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch script: ${response.status} ${response.statusText}`);
    }

    // Get the script content
    const scriptContent = await response.text();
    
    // Return the script with proper JavaScript content type
    return new NextResponse(scriptContent, {
      headers: {
        'Content-Type': 'application/javascript',
        // Add cache headers to improve performance
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      }
    });
  } catch (error) {
    console.error('Error fetching Checkout.com script:', error);
    return NextResponse.json(
      { error: 'Failed to load Checkout.com script' },
      { status: 500 }
    );
  }
} 