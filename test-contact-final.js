/**
 * Final Contact API Test
 */

async function testFinalContact() {
    console.log('🧪 Testing Final Contact Submission...');
    
    const testContact = {
        name: 'David Chen',
        email: 'david@startup.com',
        phone: '+1333456789',
        subject: 'Branding Kit',
        message: 'Hi! We are a new startup and need a complete branding package including logo design, business cards, and website branding. What packages do you offer?'
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
            console.log('📋 Contact ID:', result.data.id);
            console.log('👤 Name:', result.data.name);
            console.log('📧 Email:', result.data.email);
            console.log('📞 Phone:', result.data.phone);
            console.log('📝 Subject:', result.data.subject);
            console.log('💬 Message:', result.message);
            console.log('🕒 Created:', result.data.createdAt);
        } else {
            console.log('❌ Contact submission failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing contact API:', error.message);
    }
}

// Run the test
testFinalContact();
