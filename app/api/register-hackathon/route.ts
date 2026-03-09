import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, slug } = body;

    if (!userId || !slug) {
      return NextResponse.json(
        { success: false, error: 'userId and slug are required' },
        { status: 400 }
      );
    }

    // Register user for hackathon
    const response = await fetch(`${API_URL}/registration/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, slug }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to register user for hackathon:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to register for hackathon' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, registration: data.registration });
  } catch (error) {
    console.error('Error in register-hackathon API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}