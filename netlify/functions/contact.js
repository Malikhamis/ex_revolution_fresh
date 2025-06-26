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
    // For now, return mock data for admin panel
    if (event.httpMethod === 'GET') {
      // Mock contact data for admin dashboard
      const mockContacts = [
        {
          id: '1',
          name: 'maliki mahayu',
          email: 'exrevolution@gmail.com',
          phone: '+255683171345',
          subject: 'Digital Marketing',
          message: 'help',
          createdAt: new Date().toISOString(),
          status: 'new'
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockContacts
        })
      };
    }

    // Handle POST requests (form submissions)
    if (event.httpMethod === 'POST') {
      const formData = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Contact form submitted successfully'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Contact function error:', error);
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
