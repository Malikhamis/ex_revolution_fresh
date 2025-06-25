// Authentication Function for Netlify Functions
const jwt = require('jsonwebtoken');

const users = [
    { id: 1, username: 'admin', password: 'exrev2024', role: 'admin' },
    { id: 2, username: 'demo', password: 'demo123', role: 'user' }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { username, password } = JSON.parse(event.body);
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' }),
            };
        }
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            }),
        };
    } catch (error) {
        console.error('Auth function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
