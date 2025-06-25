/**
 * Submit a test contact to verify the system
 */

async function submitTestContact() {
    console.log('📝 Submitting test contact...');
    
    const testContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        subject: 'Software Development',
        message: 'This is a test contact message to verify the admin dashboard integration is working properly.'
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
            console.log('✅ SUCCESS: Contact submitted!');
            console.log('📋 Contact ID:', result.data.id);
            console.log('👤 Name:', result.data.name);
            console.log('📧 Email:', result.data.email);
            console.log('📝 Subject:', result.data.subject);
            console.log('🕒 Created:', result.data.createdAt);
            console.log('💬 Server Response:', result.message);
            
            // Now check if it appears in the system
            console.log('\n🔍 Checking if contact appears in system...');
            const debugResponse = await fetch('http://localhost:3000/api/debug/contacts');
            const debugData = await debugResponse.json();
            
            console.log('📊 Total contacts in system:', debugData.total);
            if (debugData.total > 0) {
                console.log('📋 Contacts found:');
                debugData.contacts.forEach((contact, index) => {
                    console.log(`  ${index + 1}. ${contact.name} - ${contact.email} - ${contact.subject}`);
                });
            }
            
        } else {
            console.log('❌ FAILED:', result.message);
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

// Run the test
submitTestContact();
