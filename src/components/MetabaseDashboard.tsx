'use client';
import { useState, useEffect } from 'react';

interface MetabaseDashboardProps {
  dashboardId: number;
  height?: number;
  params?: Record<string, string>;
  createCard?: boolean; // Control whether to create/update the card
  cardPayload?: any; // Optional custom card payload
  cardWidth?: number; // Optional width for the card on dashboard (0 for full width)
  cardHeight?: number; // Optional height for the card on dashboard
}

const MetabaseDashboard = ({ 
  dashboardId, 
  height = 1000, 
  params = {},
  createCard = true, // Default to true to create the card
  cardPayload = undefined, // Default to undefined to use the default payload
  cardWidth = 0, // Default to 0 = full width (will be determined by API)
  cardHeight = 4 // Default height (standard in Metabase)
}: MetabaseDashboardProps) => {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const setupDashboard = async () => {
      try {
        setLoading(true);
        
        if (createCard) {
          const defaultCardPayload = {
            name: "Orders by Category Stacked by Price Range",
            dataset_query: {
              database: 1,
              type: "native",
              native: {
                query: "SELECT p.category AS category, CASE WHEN p.price < 20 THEN 'Under $20' WHEN p.price < 50 THEN '$20-$49' WHEN p.price < 100 THEN '$50-$99' ELSE '$100+' END AS price_range, COUNT(*) AS count FROM orders o JOIN products p ON o.product_id = p.id GROUP BY p.category, price_range ORDER BY p.category, price_range",
                "template-tags": {}
              }
            },
            display: "bar",
            visualization_settings: {
              //"graph.dimensions": ["category", "price_range"],
              //"graph.metrics": ["count"],
              //"graph.x_axis.title_text": "Product Category",
              //"graph.y_axis.title_text": "Number of Orders",
              //"stackable.stack_type": "stacked",
              //"graph.colors": ["#509EE3", "#88BF4D", "#A989C5", "#EF8C8C"]
            },
            description: "SQL-based stacked bar chart showing orders by category and price range",
            parameters: [],
            collection_position: null,
            result_metadata: null
          };
          
          const cardResponse = await fetch('/api/metabase-card', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dashboardId: dashboardId,
              cardPayload: cardPayload || defaultCardPayload,
              cardWidth: cardWidth,
              cardHeight: cardHeight
            }),
          });
          
          if (!cardResponse.ok) {
            const errorData = await cardResponse.json();
            throw new Error(`Failed to create card: ${errorData.error || cardResponse.statusText}`);
          }
        }
        
        // Step 2: Fetch the signed token for the dashboard
        const queryParams = new URLSearchParams({
          dashboardId: dashboardId.toString(),
          ...params
        }).toString();
        
        const response = await fetch(`/api/metabase-token?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch Metabase token');
        }
        
        const { token } = await response.json();
        
        // Create the iframe URL with the token
        const metabaseSiteUrl = process.env.NEXT_PUBLIC_METABASE_SITE_URL;
        if (!metabaseSiteUrl) {
          throw new Error('Metabase site URL not configured');
        }
        
        const url = `${metabaseSiteUrl}/embed/dashboard/${token}#bordered=true&titled=true`;
        setIframeUrl(url);
        setError(null);
      } catch (error) {
        console.error('Error setting up dashboard:', error);
        setError(`Failed to load dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    setupDashboard();
  }, [dashboardId, params, createCard]);
  
  if (loading) {
    return <div>Loading dashboard...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="metabase-container pt-5">
      <iframe
        src={iframeUrl}
        frameBorder="0"
        width="100%"
        height={height}
      ></iframe>
    </div>
  );
};

export default MetabaseDashboard;
