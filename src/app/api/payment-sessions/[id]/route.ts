import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CHECKOUT_SECRET_KEY = "sk_sbox_3ih4tvdq7byb3b2akct5n64va4h";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://api.sandbox.checkout.com/payment-sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${CHECKOUT_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    const err = error as {
      message: string;
      response?: {
        data: unknown;
        status: number;
      };
    };
    
    console.error("Session fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch session details" },
      { status: 500 }
    );
  }
} 