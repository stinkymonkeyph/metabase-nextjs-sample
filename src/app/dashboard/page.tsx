'use client';
import MetabaseDashboard from '@/components/MetabaseDashboard';
import { useState } from 'react';

export default function DashboardPage() {
  // Example of a dynamic card payload you might want to use
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
    result_metadata: null
  });

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Optional Header - Remove if you want the dashboard to take the entire screen */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-semibold text-black">Analytics Dashboard</h1>
      </header>
      
      {/* Main content area - flex-grow will make it take all available space */}
      <main className="flex-grow w-full">
        <div className="h-full w-full">
          <MetabaseDashboard 
            dashboardId={1} // Replace with your dashboard ID
            createCard={true} // This will trigger the card creation before loading the dashboard
            cardPayload={customCardPayload} // Pass your custom card configuration
            cardWidth={0} // 0 means full width, or specify a number (e.g., 6 for half width on a 12-column grid)
            cardHeight={6} // Taller than default for better visualization
            params={{
              // Optional dashboard parameters
            }}
          />
        </div>
      </main>
    </div>
  );
}
