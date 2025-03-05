import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CHECKOUT_SECRET_KEY = "sk_sbox_3ih4tvdq7byb3b2akct5n64va4h";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    
    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://api.sandbox.checkout.com/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${CHECKOUT_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Payment fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
} 