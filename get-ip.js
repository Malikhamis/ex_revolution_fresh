const { networkInterfaces } = require('os');

function getLocalIP() {
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    
    return 'localhost';
}

const localIP = getLocalIP();
console.log('Your computer\'s IP address:', localIP);
console.log('');
console.log('📱 MOBILE LOGIN INSTRUCTIONS:');
console.log('1. Make sure your mobile device is on the same WiFi network');
console.log(`2. Open mobile browser and go to: http://${localIP}:3000/admin/login.html`);
console.log('3. Use these credentials:');
console.log('   Email: admin@exrevolution.com');
console.log('   Password: Admin@123');
console.log('');
console.log('🔧 TROUBLESHOOTING:');
console.log('- Ensure both website (port 3000) and API (port 5000) servers are running');
console.log('- Check Windows Firewall allows Node.js connections');
console.log('- Try different mobile browsers if one doesn\'t work');
