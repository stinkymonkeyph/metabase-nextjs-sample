import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const dashboardId = searchParams.get('dashboardId');
  
  if (!dashboardId) {
    return NextResponse.json({ error: 'Dashboard ID is required' }, { status: 400 });
  }

  // Get your secret key from environment variables
  const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;
  
  if (!METABASE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Metabase secret key not configured' }, 
      { status: 500 }
    );
  }
  
  // Parameters for the dashboard
  const resource = { dashboard: parseInt(dashboardId) };
  
  // Extract additional parameters to filter the dashboard
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== 'dashboardId') {
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
