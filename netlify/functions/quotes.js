// Quote Request Handler for Netlify Functions
let quotes = [];

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        switch (event.httpMethod) {
            case 'GET':
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(quotes),
                };
            case 'POST':
                const quoteData = JSON.parse(event.body);
                const newQuote = {
                    id: Date.now(),
                    ...quoteData,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                };
                quotes.push(newQuote);
                await sendQuoteNotification(newQuote);
                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({ success: true, message: 'Quote request saved successfully', id: newQuote.id }),
                };
            case 'PUT':
                const { id, status, response } = JSON.parse(event.body);
                const quoteIndex = quotes.findIndex(q => q.id === parseInt(id));
                if (quoteIndex !== -1) {
                    quotes[quoteIndex].status = status;
                    quotes[quoteIndex].response = response;
                    quotes[quoteIndex].updatedAt = new Date().toISOString();
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ success: true, message: 'Quote updated' }),
                    };
                }
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Quote not found' }),
                };
            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' }),
                };
        }
    } catch (error) {
        console.error('Quote function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

async function sendQuoteNotification(quote) {
    console.log('New quote request:', quote.name, quote.service, quote.budget);
    // TODO: Implement email notification
}
