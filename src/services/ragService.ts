export const getHybridRAGContext = async (query: string, sourceType?: string) => {
    const response = await fetch('/api/rag/context', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Adapt to actual auth
      },
      body: JSON.stringify({ query, sourceType })
    });
    return await response.json();
  };
