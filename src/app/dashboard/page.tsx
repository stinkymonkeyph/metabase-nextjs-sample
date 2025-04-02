'use client';
import MetabaseCard from '@/components/MetabaseCard';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [createdCardId, setCreatedCardId] = useState<number | null>(null);
  const [windowHeight, setWindowHeight] = useState<number>(800);
  
  useEffect(() => {
    const calculateHeight = () => {
      const headerHeight = 100;
      const padding = 32;
      const availableHeight = window.innerHeight - headerHeight - padding;
      setWindowHeight(availableHeight > 400 ? availableHeight : 400);
    };
    
    calculateHeight();
    
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);
  
  const [customCardPayload, setCustomCardPayload] = useState({
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
      "graph.dimensions": ["category", "price_range"],
      "graph.metrics": ["count"],
      "graph.x_axis.title_text": "Product Category",
      "graph.y_axis.title_text": "Number of Orders",
      "stackable.stack_type": "stacked",
      "graph.colors": ["#509EE3", "#88BF4D", "#A989C5", "#EF8C8C"]
    },
    description: "SQL-based stacked bar chart showing orders by category and price range",
    enable_embedding: true
  });
  
  const createCard = async () => {
    try {
      const response = await fetch('/api/metabase-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardPayload: customCardPayload,
          enableEmbedding: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create card');
      }
      
      const data = await response.json();
      console.log("Card created:", data);
      setCreatedCardId(data.id);
      return data.id;
    } catch (error) {
      console.error("Error creating card:", error);
      return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-black">Sample Analytics Display</h1>
            {createdCardId && (
              <p className="text-gray-800 font-medium">
                Created Card ID: <span className="font-mono">{createdCardId}</span>
              </p>
            )}
          </div>
          {!createdCardId && (
            <button 
              onClick={createCard}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create New Card
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-grow w-full overflow-hidden">
        {createdCardId ? (
          <div className="h-full w-full">
            <MetabaseCard 
              cardId={createdCardId}
              height={windowHeight}
              params={{}}
            />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white rounded shadow-md">
              <p className="text-gray-800 mb-2 font-medium">No card has been created yet.</p>
              <p className="text-gray-600">Click "Create New Card" to generate and embed a Metabase card</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
