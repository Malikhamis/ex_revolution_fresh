/**
 * Test Contact API Submission
 */

async function testContactAPI() {
    console.log('🧪 Testing Contact API...');
    
    const testContact = {
        name: 'Jane Smith',
        email: 'jane@testcompany.com',
        phone: '+1987654321',
        subject: 'Software Development',
        message: 'Hello! I am interested in your software development services. Could you please provide more information about your custom web application development process and pricing? We are looking to build a customer management system for our business.'
    };

    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testContact)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Contact message submitted successfully!');
            console.log('📋 Contact Details:', JSON.stringify(result.data, null, 2));
            console.log('💬 Message:', result.message);
        } else {
            console.log('❌ Contact submission failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing contact API:', error.message);
    }
}

// Run the test
testContactAPI();
