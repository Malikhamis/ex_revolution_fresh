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
    // Handle newsletter subscribers endpoint
    if (event.path.includes('/subscribers') && event.httpMethod === 'GET') {
      const mockSubscribers = [
        {
          id: '1',
          email: 'subscriber1@example.com',
          subscribed: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2', 
          email: 'subscriber2@example.com',
          subscribed: true,
          createdAt: new Date().toISOString()
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mockSubscribers)
      };
    }

    // Handle newsletter templates
    if (event.httpMethod === 'GET') {
      const mockNewsletters = [
        {
          id: '1',
          title: 'Welcome Newsletter',
          subject: 'Welcome to Ex Revolution',
          content: 'Thank you for subscribing!',
          sent: false,
          createdAt: new Date().toISOString()
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mockNewsletters)
      };
    }

    if (event.httpMethod === 'POST') {
      const newsletterData = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Newsletter operation completed'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Newsletter function error:', error);
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
