'use client';
import { useState, useEffect } from 'react';

interface MetabaseCardProps {
  cardId?: number;           // Optional - existing card ID to display
  height?: number;           // Height of the iframe
  params?: Record<string, string>; // Optional parameters to filter the card
  createCard?: boolean;      // Control whether to create a new card
  cardPayload?: any;         // Card configuration payload
}

const MetabaseCard = ({ 
  cardId,
  height = 800, 
  params = {},
  createCard = false,
  cardPayload = undefined
}: MetabaseCardProps) => {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const setupCard = async () => {
      try {
        setLoading(true);
        
        let idToUse = cardId;
        
        // Step 1: Create the card if needed
        if (createCard && cardPayload) {
          console.log("Creating new card...");
          const cardResponse = await fetch('/api/metabase-card', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cardPayload: cardPayload,
              enableEmbedding: true // Request to enable embedding for this card
            }),
          });
          
          if (!cardResponse.ok) {
            const errorData = await cardResponse.json();
            throw new Error(`Failed to create card: ${errorData.error || cardResponse.statusText}`);
          }
          
          const cardData = await cardResponse.json();
          console.log("Card created with ID:", cardData.id);
          idToUse = cardData.id;
        }
        
        // Step 2: Now that we have a card ID (either provided or created), fetch the signed token
        if (!idToUse) {
          throw new Error('No card ID available. Either provide a cardId or set createCard to true with a cardPayload.');
        }
        
        console.log("Fetching token for card ID:", idToUse);
        const queryParams = new URLSearchParams({
          cardId: idToUse?.toString() || '',
          ...params
        }).toString();
        
        const tokenUrl = `/api/metabase-card-token?${queryParams}`;
        console.log("Token URL:", tokenUrl);
        
        const response = await fetch(tokenUrl);
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch Metabase token for card: ${errorData}`);
        }
        
        const { token } = await response.json();
        console.log("Token received for card");
        
        // Create the iframe URL with the token
        const metabaseSiteUrl = process.env.NEXT_PUBLIC_METABASE_SITE_URL;
        if (!metabaseSiteUrl) {
          throw new Error('Metabase site URL not configured');
        }
        
        // Add parameters for full-screen and borderless display
        const url = `${metabaseSiteUrl}/embed/question/${token}#bordered=false&titled=true&hide_parameters=true`;
        console.log("Setting iframe URL:", url);
        setIframeUrl(url);
        setError(null);
      } catch (error) {
        console.error('Error setting up card:', error);
        setError(`Failed to load card: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    setupCard();
  }, [cardId, params, createCard, cardPayload]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700">Loading visualization...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="p-6 text-red-500 border border-red-300 rounded bg-red-50 max-w-xl">
          <h3 className="font-semibold text-lg mb-2">Error Loading Visualization</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full bg-white">
      <iframe
        src={iframeUrl}
        style={{ border: 'none' }}
        width="100%"
        height={height || "100%"}
        className="h-full w-full"
      ></iframe>
    </div>
  );
};

export default MetabaseCard;
