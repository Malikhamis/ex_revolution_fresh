// Newsletter Management for Netlify Functions
let subscribers = [];
let newsletters = [];

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path.split('/').pop();

    try {
        if (path === 'subscribers') {
            return handleSubscribers(event, headers);
        } else if (path === 'send') {
            return handleSendNewsletter(event, headers);
        } else {
            return handleNewsletters(event, headers);
        }
    } catch (error) {
        console.error('Newsletter function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

function handleSubscribers(event, headers) {
    switch (event.httpMethod) {
        case 'GET':
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(subscribers),
            };
        case 'POST':
            const { email, name } = JSON.parse(event.body);
            if (subscribers.find(s => s.email === email)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Email already subscribed' }),
                };
            }
            const newSubscriber = {
                id: Date.now(),
                email,
                name: name || '',
                subscribed: true,
                subscribedAt: new Date().toISOString()
            };
            subscribers.push(newSubscriber);
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ success: true, message: 'Successfully subscribed', id: newSubscriber.id }),
            };
        case 'DELETE':
            const unsubscribeEmail = event.queryStringParameters.email;
            subscribers = subscribers.filter(s => s.email !== unsubscribeEmail);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Unsubscribed successfully' }),
            };
        default:
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Method not allowed' }),
            };
    }
}

function handleNewsletters(event, headers) {
    switch (event.httpMethod) {
        case 'GET':
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(newsletters),
            };
        case 'POST':
            const newsletterData = JSON.parse(event.body);
            const newNewsletter = {
                id: Date.now(),
                ...newsletterData,
                createdAt: new Date().toISOString(),
                sent: false
            };
            newsletters.push(newNewsletter);
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ success: true, message: 'Newsletter created', id: newNewsletter.id }),
            };
        default:
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Method not allowed' }),
            };
    }
}

async function handleSendNewsletter(event, headers) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    const { newsletterId } = JSON.parse(event.body);
    const newsletter = newsletters.find(n => n.id === parseInt(newsletterId));
    if (!newsletter) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Newsletter not found' }),
        };
    }
    newsletter.sent = true;
    newsletter.sentAt = new Date().toISOString();
    newsletter.sentCount = subscribers.filter(s => s.subscribed).length;
    console.log(`Sending newsletter "${newsletter.subject}" to ${newsletter.sentCount} subscribers`);
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: `Newsletter sent to ${newsletter.sentCount} subscribers`, sentCount: newsletter.sentCount }),
    };
}
