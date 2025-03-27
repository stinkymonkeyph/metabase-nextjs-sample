import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dashboardId, cardPayload, cardWidth = 0, cardHeight = 4 } = body;
    
    if (!dashboardId) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      );
    }

    if (!cardPayload) {
      return NextResponse.json(
        { error: 'Card payload is required' },
        { status: 400 }
      );
    }

    // Metabase API credentials
    const METABASE_URL = process.env.METABASE_SITE_URL;
    const METABASE_USERNAME = process.env.METABASE_USERNAME;
    const METABASE_PASSWORD = process.env.METABASE_PASSWORD;
    
    if (!METABASE_URL || !METABASE_USERNAME || !METABASE_PASSWORD) {
      return NextResponse.json(
        { error: 'Metabase API configuration is missing' },
        { status: 500 }
      );
    }
    
    // Step 1: Authenticate and get session token
    const sessionResponse = await fetch(`${METABASE_URL}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: METABASE_USERNAME,
        password: METABASE_PASSWORD,
      }),
    });
    
    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Metabase' },
        { status: 500 }
      );
    }
    
    const { id: sessionId } = await sessionResponse.json();
    
    // Step 2: Create/update the card
    // Ensure the dashboard_id is set correctly in the payload
    const finalCardPayload = {
      ...cardPayload,
      dashboard_id: dashboardId
    };
    
    // First, create or update the card
    const cardResponse = await fetch(`${METABASE_URL}/api/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': sessionId,
      },
      body: JSON.stringify(finalCardPayload),
    });
    
    if (!cardResponse.ok) {
      const errorText = await cardResponse.text();
      return NextResponse.json(
        { error: `Failed to create Metabase card: ${errorText}` },
        { status: 500 }
      );
    }
    
    const cardData = await cardResponse.json();
    
    try {
      return NextResponse.json({ 
        success: true, 
        id: cardData.id,
        message: 'Card created successfully. Please add it to your dashboard manually for proper layout.',
        instructions: 'Log into Metabase, go to your dashboard, click "Add", select "Saved Question", and choose this card. Then drag to resize as needed.'
      });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ 
        success: true, 
        id: cardData.id,
        message: 'Card created but could not be added to dashboard automatically.'
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      id: cardData.id,
      message: 'Card created and added to dashboard successfully' 
    });
  } catch (error) {
    console.error('Error creating Metabase card:', error);
    return NextResponse.json(
      { error: 'Failed to create Metabase card' },
      { status: 500 }
    );
  }
}
