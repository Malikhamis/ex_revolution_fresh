/**
 * Test Quote API Submission
 */

async function testQuoteAPI() {
    console.log('🧪 Testing Quote API...');
    
    const testQuote = {
        name: 'John Smith',
        email: 'john@testcompany.com',
        phone: '+1234567890',
        company: 'Test Company Ltd',
        serviceType: 'Software Development, Digital Marketing',
        budget: '$10,000 - $25,000',
        timeline: '3-6 months',
        projectDetails: 'We need a complete e-commerce website with payment integration and digital marketing strategy to boost our online presence.'
    };

    try {
        const response = await fetch('http://localhost:3000/api/quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testQuote)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Quote submitted successfully!');
            console.log('📋 Quote Details:', JSON.stringify(result.data, null, 2));
            console.log('💬 Message:', result.message);
        } else {
            console.log('❌ Quote submission failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing quote API:', error.message);
    }
}

// Run the test
testQuoteAPI();
