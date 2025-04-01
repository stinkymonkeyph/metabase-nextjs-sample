'use client';
import MetabaseCard from '@/components/MetabaseCard';
import { useState } from 'react';

export default function DashboardPage() {
  // Example of a card payload you might want to use
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
    parameters: [],
    collection_position: null,
    result_metadata: null,
    enable_embedding: true  // Request embedding to be enabled
  });
  
  // Adding a state to track newly created card ID
  const [createdCardId, setCreatedCardId] = useState<number | null>(null);
  
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
    <div className="flex flex-col h-screen w-screen">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-semibold text-black">Analytics Cards</h1>
        {!createdCardId && (
          <button 
            onClick={createCard}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Card
          </button>
        )}
        {createdCardId && (
          <div className="mt-2 px-4 py-2 bg-green-100 border border-green-300 rounded">
            <p className="text-green-800 font-medium">
              Created Card ID: <span className="font-mono font-bold">{createdCardId}</span>
            </p>
          </div>
        )}
      </header>
      
      {/* Main content area */}
      <main className="flex-grow w-full p-4">
        <div className="grid grid-cols-1 gap-6">
          {createdCardId ? (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Embedded Card (ID: {createdCardId})</h2>
              <MetabaseCard 
                cardId={createdCardId}
                height={400}
                params={{
                  // Optional parameters to filter the visualization
                }}
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg shadow-md p-4 text-center">
              <p>Click "Create New Card" to generate and view a Metabase card</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
