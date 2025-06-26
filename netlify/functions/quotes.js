exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Mock quote data for admin dashboard
      const mockQuotes = [
        {
          id: '1',
          name: 'Sample Client',
          email: 'client@example.com',
          company: 'Example Corp',
          services: ['Software Development', 'Digital Marketing'],
          budget: 'TSHS 10,625,000 - TSHS 21,250,000',
          timeline: '3-6 months',
          description: 'Need a complete digital transformation',
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockQuotes
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const quoteData = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Quote request submitted successfully'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Quotes function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Server error'
      })
    };
  }
};
