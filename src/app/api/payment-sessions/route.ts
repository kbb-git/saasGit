import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CHECKOUT_SECRET_KEY = "sk_sbox_3ih4tvdq7byb3b2akct5n64va4h";
const DEFAULT_PROCESSING_CHANNEL_ID = "pc_eonbfv5qtimefo2mizmgmy3c5y";
const ALTERNATIVE_PROCESSING_CHANNEL_ID = "pc_cvw6lv3jnsduhpqewkoum2eugi";

// Store latest session ID for reference in memory
// Note: In production, you'd use a database
let latestSessionId: string | null = null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency,
      items,
      customer,
      billing,
      shipping,
      payment_method_configuration,
      enabled_payment_methods,
      disabled_payment_methods,
      locale,
      plan
    } = body;

    // Choose an appropriate fallback billing address based on currency or locale
    const fallbackBilling = {
      address: {
        address_line1: "123 Test Street",
        city: "London",
        state: "LDN",
        zip: "W1T 4TJ",
        country: "GB"
      }
    };
    
    // Select processing channel ID (may vary based on country)
    let processingChannelId = DEFAULT_PROCESSING_CHANNEL_ID;
    if (
      (billing && billing.address && (billing.address.country === "FR" || billing.address.country === "PT" || billing.address.country === "SA")) ||
      (!billing && fallbackBilling.address && (fallbackBilling.address.country === "FR" || fallbackBilling.address.country === "PT" || fallbackBilling.address.country === "SA"))
    ) {
      processingChannelId = ALTERNATIVE_PROCESSING_CHANNEL_ID;
    }

    // Create the session request object
    const sessionRequest = {
      amount,
      currency,
      payment_type: "Regular",
      display_name: "SaaSify",
      reference: `ORDER-${Date.now()}`,
      description: `Payment for ${plan || 'subscription'}`,
      billing: billing || fallbackBilling,
      shipping: shipping || fallbackBilling,
      customer: {
        email: customer?.email || "customer@example.com",
        name: customer?.name || "Customer"
      },
      success_url: `${request.nextUrl.origin}/checkout/success`,
      failure_url: `${request.nextUrl.origin}/checkout/failure`,
      capture: true,
      locale: locale || "en-GB",
      processing_channel_id: processingChannelId,
      "3ds": {
        enabled: true,
        attempt_n3d: false
      },
      items: items || [],
      enabled_payment_methods: enabled_payment_methods || ["card"],
      disabled_payment_methods: disabled_payment_methods || [],
      payment_method_configuration: {
        ...(payment_method_configuration || {}),
        card: {
          ...(payment_method_configuration?.card || {}),
          store_payment_details: "enabled"
        }
      }
    };

    // Call Checkout.com API to create the payment session
    const response = await axios.post(
      "https://api.sandbox.checkout.com/payment-sessions",
      sessionRequest,
      {
        headers: {
          Authorization: `Bearer ${CHECKOUT_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Store the latest session ID
    latestSessionId = response.data.id;
    
    return NextResponse.json(response.data);

  } catch (error: unknown) {
    const err = error as {
      message: string;
      response?: {
        data: unknown;
        status: number;
      };
    };
    
    console.error("Payment session error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    
    return NextResponse.json(
      {
        error: "Failed to create payment session",
        details: err.response?.data || err.message
      },
      { status: 500 }
    );
  }
}

// Get the latest session ID
export async function GET() {
  if (latestSessionId) {
    return NextResponse.json({ id: latestSessionId });
  } else {
    return NextResponse.json({ error: "No session ID available" }, { status: 404 });
  }
} 