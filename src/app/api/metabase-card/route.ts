import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardPayload, enableEmbedding = true } = body;
    
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
    
    console.log("Using Metabase URL:", METABASE_URL);
    
    if (!METABASE_URL || !METABASE_USERNAME || !METABASE_PASSWORD) {
      return NextResponse.json(
        { error: `Metabase API configuration is missing. URL: ${METABASE_URL ? 'set' : 'missing'}, Username: ${METABASE_USERNAME ? 'set' : 'missing'}, Password: ${METABASE_PASSWORD ? 'set' : 'missing'}` },
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
    
    // Step 2: Create the card
    const cardResponse = await fetch(`${METABASE_URL}/api/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': sessionId,
      },
      body: JSON.stringify(cardPayload),
    });
    
    if (!cardResponse.ok) {
      const errorText = await cardResponse.text();
      return NextResponse.json(
        { error: `Failed to create Metabase card: ${errorText}` },
        { status: 500 }
      );
    }
    
    const cardData = await cardResponse.json();
    const cardId = cardData.id;
    
    // Step 3: Enable embedding for the card if requested
    if (enableEmbedding) {
      // First, check current embedding settings
      const cardSettingsResponse = await fetch(`${METABASE_URL}/api/card/${cardId}`, {
        method: 'GET',
        headers: {
          'X-Metabase-Session': sessionId,
        },
      });
      
      if (!cardSettingsResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch card settings' },
          { status: 500 }
        );
      }
      
      // Update the card to enable embedding
      const updateResponse = await fetch(`${METABASE_URL}/api/card/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': sessionId,
        },
        body: JSON.stringify({
          enable_embedding: true,
          embedding_params: {} // Allow all parameters or specify which ones to enable
        }),
      });
      
      if (!updateResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to enable embedding for card' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      id: cardId,
      message: 'Card created and embedding enabled successfully' 
    });
  } catch (error) {
    console.error('Error creating Metabase card:', error);
    return NextResponse.json(
      { error: 'Failed to create Metabase card' },
      { status: 500 }
    );
  }
}
