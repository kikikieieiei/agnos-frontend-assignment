import Ably from 'ably';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json(
      { error: 'Ably API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const client = new Ably.Rest(process.env.ABLY_API_KEY);
    const tokenRequest = await client.auth.createTokenRequest({ clientId: 'patient' });
    return NextResponse.json(tokenRequest);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
