// Contact Form Handler for Netlify Functions
let contacts = [];

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    try {
        switch (event.httpMethod) {
            case 'GET':
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(contacts),
                };
            case 'POST':
                const contactData = JSON.parse(event.body);
                const newContact = {
                    id: Date.now(),
                    ...contactData,
                    timestamp: new Date().toISOString(),
                    status: 'new'
                };
                contacts.push(newContact);
                await sendNotificationEmail(newContact);
                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({ success: true, message: 'Contact saved successfully', id: newContact.id }),
                };
            case 'PUT':
                const { id, status } = JSON.parse(event.body);
                const contactIndex = contacts.findIndex(c => c.id === parseInt(id));
                if (contactIndex !== -1) {
                    contacts[contactIndex].status = status;
                    contacts[contactIndex].updatedAt = new Date().toISOString();
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ success: true, message: 'Contact updated' }),
                    };
                }
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Contact not found' }),
                };
            case 'DELETE':
                const deleteId = event.queryStringParameters.id;
                contacts = contacts.filter(c => c.id !== parseInt(deleteId));
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, message: 'Contact deleted' }),
                };
            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' }),
                };
        }
    } catch (error) {
        console.error('Contact function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

async function sendNotificationEmail(contact) {
    // Integrate with email service if needed
    console.log('New contact received:', contact.name, contact.email);
    // TODO: Implement email notification
}
