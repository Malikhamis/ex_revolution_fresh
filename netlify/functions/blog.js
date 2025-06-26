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
      // Mock blog posts for admin dashboard
      const mockPosts = [
        {
          id: '1',
          title: 'AI Transforming Business Operations',
          slug: 'ai-transforming-business',
          excerpt: 'How artificial intelligence is revolutionizing business processes...',
          content: 'Full blog post content here...',
          author: 'Ex Revolution Team',
          status: 'published',
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['AI', 'Business', 'Technology'],
          category: 'Technology'
        },
        {
          id: '2',
          title: 'Digital Marketing Strategies for Tanzania',
          slug: 'digital-marketing-tanzania',
          excerpt: 'Effective digital marketing approaches for Tanzanian businesses...',
          content: 'Full blog post content here...',
          author: 'Ex Revolution Team',
          status: 'published',
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['Marketing', 'Tanzania', 'Digital'],
          category: 'Marketing'
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockPosts
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const blogData = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Blog post created successfully',
          data: { id: Date.now().toString(), ...blogData }
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Blog function error:', error);
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
