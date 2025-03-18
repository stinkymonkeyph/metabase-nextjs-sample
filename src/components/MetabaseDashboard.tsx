'use client';

import { useState, useEffect } from 'react';

interface MetabaseDashboardProps {
  dashboardId: number;
  height?: number;
  params?: Record<string, string>;
}

const MetabaseDashboard = ({ 
  dashboardId, 
  height = 900, 
  params = {} 
}: MetabaseDashboardProps) => {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const getMetabaseUrl = async () => {
      try {
        setLoading(true);
        
        // Fetch the signed token from your API
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
        console.error('Error fetching Metabase token:', error);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    getMetabaseUrl();
  }, [dashboardId, params]);
  
  if (loading) {
    return <div>Loading dashboard...</div>;
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

export default MetabaseDashboard;
