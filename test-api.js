/**
 * Test script to verify API proxy is working
 */

async function testAPI() {
    console.log('🧪 Testing API endpoints...\n');

    // Test health endpoint
    try {
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch('http://localhost:3000/api/health');
        const healthText = await healthResponse.text();
        console.log('   Status:', healthResponse.status);
        console.log('   Response:', healthText);
        
        if (healthResponse.ok) {
            console.log('   ✅ Health check passed\n');
        } else {
            console.log('   ❌ Health check failed\n');
        }
    } catch (error) {
        console.log('   ❌ Health check error:', error.message, '\n');
    }

    // Test login endpoint
    try {
        console.log('2. Testing login endpoint...');
        const loginResponse = await fetch('http://localhost:3000/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@exrevolution.com',
                password: 'Admin@123'
            })
        });
        
        const loginText = await loginResponse.text();
        console.log('   Status:', loginResponse.status);
        console.log('   Response:', loginText);
        
        if (loginResponse.ok) {
            console.log('   ✅ Login test passed\n');
        } else {
            console.log('   ❌ Login test failed\n');
        }
    } catch (error) {
        console.log('   ❌ Login test error:', error.message, '\n');
    }

    console.log('🎯 Test complete!');
    console.log('📱 If both tests passed, mobile login should work');
    console.log('🔗 Try: https://6qb2p13s-3000.inc1.devtunnels.ms/admin/login.html');
}

testAPI();
