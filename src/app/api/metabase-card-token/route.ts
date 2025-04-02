import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    
    console.log("API route called with cardId:", cardId);
    
    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }
    
    const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;
    
    console.log("Secret key available:", METABASE_SECRET_KEY ? 'Yes' : 'No');
    
    if (!METABASE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Metabase secret key not configured' }, 
        { status: 500 }
      );
    }
    
    const resource = { question: parseInt(cardId) };
    
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'cardId') {
        params[key] = value;
      }
    });
    
    const payload = {
      resource,
      params,
      exp: Math.round(Date.now() / 1000) + (10 * 60)
    };
    
    console.log("Creating token with payload:", JSON.stringify(payload));
    
    const token = jwt.sign(payload, METABASE_SECRET_KEY);
    
    console.log("Token created successfully");
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error in metabase-card-token API route:", error);
    return NextResponse.json(
      { error: `Failed to generate token: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    );
  }
}
