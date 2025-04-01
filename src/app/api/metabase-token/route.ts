import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('cardId');
  
  if (!cardId) {
    return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
  }
  
  // Get your secret key from environment variables
  const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;
  
  console.log("Generating token for card ID:", cardId);
  console.log("Secret key available:", METABASE_SECRET_KEY ? 'Yes' : 'No');
  
  if (!METABASE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Metabase secret key not configured' }, 
      { status: 500 }
    );
  }
  
  // Parameters for the card
  const resource = { question: parseInt(cardId) };
  
  // Extract additional parameters to filter the card
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== 'cardId') {
      params[key] = value;
    }
  });
  
  // Create the payload
  const payload = {
    resource,
    params,
    exp: Math.round(Date.now() / 1000) + (10 * 60) // Token expires in 10 minutes
  };
  
  // Sign the token
  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  
  // Return the token
  return NextResponse.json({ token });
}
