/**
 * Simple API Server for Mobile Login
 * Minimal dependencies, guaranteed to work
 */

const http = require('http');
const url = require('url');

// Simple CORS headers
function setCORSHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
}

// Simple JSON response
function sendJSON(res, statusCode, data) {
    setCORSHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Parse JSON body
function parseBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        console.log('Raw body received:', body);
        try {
            if (!body.trim()) {
                callback(new Error('Empty body'), null);
                return;
            }
            const data = JSON.parse(body);
            callback(null, data);
        } catch (err) {
            console.error('JSON parse error:', err.message);
            console.error('Body was:', body);
            callback(err, null);
        }
    });
    req.on('error', (err) => {
        console.error('Request error:', err.message);
        callback(err, null);
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    console.log(`${method} ${path}`);

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        setCORSHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check
    if (path === '/api/health' && method === 'GET') {
        sendJSON(res, 200, {
            status: 'OK',
            message: 'Simple API Server Running',
            timestamp: new Date().toISOString()
        });
        return;
    }

    // Login endpoint
    if (path === '/api/auth' && method === 'POST') {
        console.log('📝 Processing login request...');
        parseBody(req, (err, data) => {
            if (err) {
                console.error('❌ Body parsing error:', err.message);
                sendJSON(res, 400, {
                    msg: 'Invalid JSON',
                    error: err.message
                });
                return;
            }

            if (!data) {
                console.error('❌ No data received');
                sendJSON(res, 400, { msg: 'No data received' });
                return;
            }

            const { email, password } = data;
            console.log('🔐 Login attempt:', { email, password: password ? '***' : 'missing' });

            // Simple authentication
            if (email === 'admin@exrevolution.com' && (password === 'Admin@123' || password === 'admin123')) {
                console.log('✅ Login successful for:', email);
                sendJSON(res, 200, {
                    token: 'simple-mobile-token',
                    user: { email, name: 'Admin' }
                });
            } else {
                console.log('❌ Login failed for:', email);
                sendJSON(res, 400, { msg: 'Invalid credentials' });
            }
        });
        return;
    }

    // Mock newsletter endpoints
    if (path === '/api/newsletter/subscribers' && method === 'GET') {
        sendJSON(res, 200, [
            { id: 1, email: 'test@example.com', subscribed: true },
            { id: 2, email: 'demo@example.com', subscribed: true }
        ]);
        return;
    }

    if (path === '/api/newsletter/templates' && method === 'GET') {
        sendJSON(res, 200, [
            { id: 1, name: 'Welcome', subject: 'Welcome!', sent: false },
            { id: 2, name: 'Update', subject: 'Monthly Update', sent: true }
        ]);
        return;
    }

    // Mock other endpoints
    if (path.startsWith('/api/')) {
        sendJSON(res, 200, { message: 'Mock API endpoint', path });
        return;
    }

    // 404 for everything else
    sendJSON(res, 404, { msg: 'Not found' });
});

const PORT = 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log('🚀 Simple API Server Started');
    console.log(`📡 Server running on ${HOST}:${PORT}`);
    console.log('🔐 Login: admin@exrevolution.com / Admin@123');
    console.log('💡 Ready for mobile Dev Tunnel access!');
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err.message);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down API server...');
    server.close(() => {
        console.log('✅ API server stopped');
        process.exit(0);
    });
});
