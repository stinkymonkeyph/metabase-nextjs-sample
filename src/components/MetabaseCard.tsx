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
  height = 400, 
  params = {},
  createCard = false,
  cardPayload = undefined
}: MetabaseCardProps) => {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // We don't need actualCardId as a separate state variable as it causes infinite loops
  
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
        
        const response = await fetch(`/api/metabase-card-token?${queryParams}`);
        
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
        
        const url = `${metabaseSiteUrl}/embed/question/${token}#bordered=true&titled=true`;
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
    return <div>Loading card...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="metabase-container">
      <iframe
        src={iframeUrl}
        frameBorder="0"
        width="100%"
        height={height}
      ></iframe>
    </div>
  );
};

export default MetabaseCard;
