exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            functions: {
                auth: 'active',
                contact: 'active',
                quotes: 'active',
                newsletter: 'active',
                blog: 'active'
            },
            emailConfigured: false,
            version: '1.0.0'
        }),
    };
};
