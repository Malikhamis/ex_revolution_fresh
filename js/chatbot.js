/**
 * Chatbot Implementation
 * This script implements a fully functional chatbot with backend integration
 * for lead generation and customer support.
 *
 * Ex Revolution Technology
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the chatbot
    initChatbot();
});

// Get API base URL from api-service.js (declared in api-service.js)

// Simple client-side responses for demo purposes
const CHATBOT_RESPONSES = {
    services: {
        text: "We offer comprehensive IT solutions including:",
        options: [
            { text: "Software Development", value: "software" },
            { text: "Digital Marketing", value: "marketing" },
            { text: "IT Consulting", value: "consulting" },
            { text: "Branding Services", value: "branding" }
        ]
    },
    software: {
        text: "Our software development services include web applications, mobile apps, enterprise software, and e-commerce solutions. We use modern technologies like React, Node.js, Python, and more.",
        options: [
            { text: "Get a quote", value: "quote" },
            { text: "View our portfolio", value: "portfolio" },
            { text: "Ask another question", value: "more" }
        ]
    },
    marketing: {
        text: "Our digital marketing services help businesses grow online through SEO, social media marketing, content marketing, and PPC advertising.",
        options: [
            { text: "Learn about SEO", value: "seo" },
            { text: "Social media marketing", value: "social" },
            { text: "Get a marketing quote", value: "quote" }
        ]
    },
    consulting: {
        text: "Our IT consulting services help businesses optimize their technology infrastructure, improve security, and plan digital transformation strategies.",
        options: [
            { text: "Schedule a consultation", value: "contact" },
            { text: "Learn about our process", value: "process" },
            { text: "Get a quote", value: "quote" }
        ]
    },
    branding: {
        text: "We create comprehensive branding kits including logos, color schemes, typography, and brand guidelines to help your business stand out.",
        options: [
            { text: "View branding examples", value: "portfolio" },
            { text: "Get a branding quote", value: "quote" },
            { text: "Ask about the process", value: "process" }
        ]
    },
    quote: {
        text: "I'd be happy to help you get a quote! Let me collect some information from you.",
        requiresLead: true,
        leadType: "quote"
    },
    contact: {
        text: "I'll connect you with one of our specialists. Please provide your contact information.",
        requiresLead: true,
        leadType: "contact"
    },
    portfolio: {
        text: "You can view our portfolio and case studies on our website. Would you like me to direct you to specific examples?",
        options: [
            { text: "Software projects", value: "software_portfolio" },
            { text: "Marketing campaigns", value: "marketing_portfolio" },
            { text: "Branding projects", value: "branding_portfolio" },
            { text: "Contact us instead", value: "contact" }
        ]
    },
    process: {
        text: "Our process typically involves: 1) Initial consultation, 2) Requirements analysis, 3) Proposal and planning, 4) Development/implementation, 5) Testing and refinement, 6) Launch and support.",
        options: [
            { text: "Schedule a consultation", value: "contact" },
            { text: "Get a quote", value: "quote" },
            { text: "Ask another question", value: "more" }
        ]
    },
    more: {
        text: "What else would you like to know about Ex Revolution Technology?",
        options: [
            { text: "Tell me about your services", value: "services" },
            { text: "How much do projects cost?", value: "pricing" },
            { text: "How long do projects take?", value: "timeline" },
            { text: "Contact a specialist", value: "contact" }
        ]
    },
    pricing: {
        text: "Project costs vary based on scope and complexity. We offer competitive rates and flexible payment options. Would you like a personalized quote?",
        options: [
            { text: "Yes, get a quote", value: "quote" },
            { text: "Tell me about payment options", value: "payment" },
            { text: "Ask another question", value: "more" }
        ]
    },
    timeline: {
        text: "Project timelines depend on complexity: Simple websites (2-4 weeks), Mobile apps (6-12 weeks), Enterprise software (3-6 months). We provide detailed timelines in our proposals.",
        options: [
            { text: "Get a detailed estimate", value: "quote" },
            { text: "Learn about our process", value: "process" },
            { text: "Contact us", value: "contact" }
        ]
    },
    end: {
        text: "Thank you for chatting with us! Feel free to reach out anytime if you have more questions. Have a great day!",
        options: []
    }
};

// Chatbot state
const chatbotState = {
    isOpen: false,
    userId: generateUserId(),
    conversation: [],
    context: {},
    leadCaptured: false
};

/**
 * Initialize the chatbot
 */
function initChatbot() {
    // Check if chatbot container exists
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (!chatbotContainer) return;

    // Create chatbot UI
    createChatbotUI(chatbotContainer);

    // Add event listeners
    addChatbotEventListeners();

    // Show chatbot based on user behavior
    initChatbotTriggers();
}

/**
 * Create the chatbot UI
 */
function createChatbotUI(container) {
    // Determine the correct path to assets based on current page location
    const currentPath = window.location.pathname;
    let assetsPath = 'assets/images/logo-icon.png';

    // If we're in a subdirectory, use relative path
    if (currentPath.includes('/blog/') || currentPath.includes('/case-studies/') || currentPath.includes('/services/')) {
        assetsPath = '../assets/images/logo-icon.png';
    }

    // Create toggle button
    const chatbotToggle = document.createElement('button');
    chatbotToggle.className = 'chatbot-toggle';
    chatbotToggle.innerHTML = '<i class="fas fa-comments"></i>';
    chatbotToggle.setAttribute('aria-label', 'Open chat');
    container.appendChild(chatbotToggle);

    // Create chatbot window
    const chatbotWindow = document.createElement('div');
    chatbotWindow.className = 'chatbot-window';
    chatbotWindow.innerHTML = `
        <div class="chatbot-header">
            <div class="chatbot-title">
                <div class="chatbot-avatar">
                    <img src="${assetsPath}" alt="Ex Revolution Support" style="width: 30px; height: 30px; border-radius: 50%;">
                </div>
                <h3>Chat with Us</h3>
            </div>
            <button class="chatbot-close" aria-label="Close chat">&times;</button>
        </div>
        <div class="chatbot-messages"></div>
        <div class="chatbot-typing" style="display: none;">
            <span></span><span></span><span></span>
        </div>
        <div class="chatbot-input">
            <input type="text" placeholder="Type your message..." aria-label="Type your message">
            <button type="button" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    container.appendChild(chatbotWindow);

    // Add styles if not already added
    if (!document.getElementById('chatbot-styles')) {
        addChatbotStyles();
    }
}

/**
 * Add event listeners to chatbot elements
 */
function addChatbotEventListeners() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotWindow = document.querySelector('.chatbot-window');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotInput = document.querySelector('.chatbot-input input');
    const chatbotSendButton = document.querySelector('.chatbot-input button');

    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', function() {
        toggleChatbot();
    });

    // Close chatbot
    chatbotClose.addEventListener('click', function() {
        closeChatbot();
    });

    // Send message on button click
    chatbotSendButton.addEventListener('click', function() {
        sendUserMessage();
    });

    // Send message on Enter key
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });

    // Handle clicks on response options
    document.querySelector('.chatbot-messages').addEventListener('click', function(e) {
        if (e.target.classList.contains('chatbot-option')) {
            const value = e.target.getAttribute('data-value');
            const text = e.target.textContent;
            handleOptionSelection(value, text);
        }
    });
}

/**
 * Initialize chatbot triggers based on user behavior
 */
function initChatbotTriggers() {
    // Show chatbot after 30 seconds if not shown already
    setTimeout(() => {
        if (!sessionStorage.getItem('chatbot_shown') && !chatbotState.isOpen) {
            // Highlight the toggle button
            const chatbotToggle = document.querySelector('.chatbot-toggle');
            chatbotToggle.classList.add('attention');

            // Store that we've shown the attention indicator
            sessionStorage.setItem('chatbot_attention_shown', 'true');
        }
    }, 30000);

    // Show chatbot automatically for returning visitors
    if (localStorage.getItem('returning_visitor') && !sessionStorage.getItem('chatbot_shown')) {
        setTimeout(() => {
            toggleChatbot();
        }, 5000);
    }

    // Mark as returning visitor
    localStorage.setItem('returning_visitor', 'true');
}

/**
 * Toggle chatbot visibility
 */
function toggleChatbot() {
    const chatbotWindow = document.querySelector('.chatbot-window');
    const chatbotToggle = document.querySelector('.chatbot-toggle');

    chatbotWindow.classList.toggle('active');
    chatbotState.isOpen = chatbotWindow.classList.contains('active');

    // Remove attention class
    chatbotToggle.classList.remove('attention');

    // If opening the chatbot
    if (chatbotState.isOpen) {
        // Mark as shown in this session
        sessionStorage.setItem('chatbot_shown', 'true');

        // Start conversation if it's empty
        if (chatbotState.conversation.length === 0) {
            startConversation();
        }

        // Focus input field
        setTimeout(() => {
            document.querySelector('.chatbot-input input').focus();
        }, 300);
    }
}

/**
 * Close the chatbot
 */
function closeChatbot() {
    const chatbotWindow = document.querySelector('.chatbot-window');
    chatbotWindow.classList.remove('active');
    chatbotState.isOpen = false;
}

/**
 * Start the conversation
 */
function startConversation() {
    // Show typing indicator
    showTypingIndicator();

    // Add welcome message after a short delay
    setTimeout(() => {
        hideTypingIndicator();
        addBotMessage({
            text: "Hello! Welcome to Ex Revolution Technology. How can I help you today?",
            options: [
                { text: "Tell me about your services", value: "services" },
                { text: "I'd like a quote", value: "quote" },
                { text: "I want to speak with someone", value: "contact" }
            ]
        });
    }, 1000);
}

/**
 * Send a user message
 */
function sendUserMessage() {
    const inputField = document.querySelector('.chatbot-input input');
    const message = inputField.value.trim();

    if (!message) return;

    // Add message to UI
    addUserMessage(message);

    // Clear input field
    inputField.value = '';

    // Process message
    processUserMessage(message);
}

/**
 * Process a user message
 */
function processUserMessage(message) {
    // Show typing indicator
    showTypingIndicator();

    // Try to get response from client-side responses first
    const response = getClientSideResponse(message);

    if (response) {
        // Use client-side response
        setTimeout(() => {
            hideTypingIndicator();
            addBotMessage(response);

            // Check if lead capture is required
            if (response.requiresLead && !chatbotState.leadCaptured) {
                showLeadCaptureForm(response.leadType || 'general');
            }
        }, 1000 + Math.random() * 1000); // Random delay to simulate thinking
        return;
    }

    // Fallback to backend if available
    fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/chatbot/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message,
            userId: chatbotState.userId,
            context: chatbotState.context
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide typing indicator
        hideTypingIndicator();

        if (data.success) {
            // Add bot response to UI
            addBotMessage(data.response);

            // Check if lead capture is required
            if (data.response.requiresLead && !chatbotState.leadCaptured) {
                showLeadCaptureForm(data.response.leadType || 'general');
            }
        } else {
            // Show fallback message
            addBotMessage({
                text: "I'm sorry, I'm having trouble processing your request. You can contact us directly at exrevolution8@gmail.com or +255 744 622 649.",
                options: [
                    { text: "Contact us", value: "contact" },
                    { text: "Try again", value: "more" }
                ]
            });
        }
    })
    .catch(error => {
        console.error('Error processing message:', error);

        // Hide typing indicator
        hideTypingIndicator();

        // Show fallback message with contact info
        addBotMessage({
            text: "I'm having trouble connecting right now. You can reach us directly at exrevolution8@gmail.com or call +255 744 622 649 for immediate assistance.",
            options: [
                { text: "Try again", value: "more" },
                { text: "Contact us", value: "contact" }
            ]
        });
    });
}

/**
 * Get client-side response based on message or context
 */
function getClientSideResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for specific keywords
    if (lowerMessage.includes('service') || lowerMessage.includes('what do you do')) {
        return CHATBOT_RESPONSES.services;
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
        return CHATBOT_RESPONSES.pricing;
    }

    if (lowerMessage.includes('time') || lowerMessage.includes('how long') || lowerMessage.includes('duration')) {
        return CHATBOT_RESPONSES.timeline;
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('speak') || lowerMessage.includes('call')) {
        return CHATBOT_RESPONSES.contact;
    }

    if (lowerMessage.includes('quote') || lowerMessage.includes('estimate')) {
        return CHATBOT_RESPONSES.quote;
    }

    // Check context for specific responses
    if (chatbotState.context.lastSelection && CHATBOT_RESPONSES[chatbotState.context.lastSelection]) {
        return CHATBOT_RESPONSES[chatbotState.context.lastSelection];
    }

    // Default response for unrecognized messages
    return {
        text: "I'd be happy to help! Here are some things I can assist you with:",
        options: [
            { text: "Tell me about your services", value: "services" },
            { text: "I'd like a quote", value: "quote" },
            { text: "I want to speak with someone", value: "contact" },
            { text: "How much do projects cost?", value: "pricing" }
        ]
    };
}

/**
 * Handle option selection
 */
function handleOptionSelection(value, text) {
    // Add user message
    addUserMessage(text);

    // Update context
    chatbotState.context.lastSelection = value;

    // Show typing indicator
    showTypingIndicator();

    // Get response for the selected option
    const response = CHATBOT_RESPONSES[value];

    if (response) {
        setTimeout(() => {
            hideTypingIndicator();
            addBotMessage(response);

            // Check if lead capture is required
            if (response.requiresLead && !chatbotState.leadCaptured) {
                showLeadCaptureForm(response.leadType || 'general');
            }
        }, 500 + Math.random() * 500);
    } else {
        // Fallback to processing as a regular message
        hideTypingIndicator();
        processUserMessage(text);
    }
}

/**
 * Add a user message to the conversation
 */
function addUserMessage(message) {
    const messagesContainer = document.querySelector('.chatbot-messages');

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'chatbot-message user-message';
    messageElement.textContent = message;

    // Add to container
    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    scrollToBottom();

    // Add to conversation state
    chatbotState.conversation.push({
        sender: 'user',
        message
    });
}

/**
 * Add a bot message to the conversation
 */
function addBotMessage(response) {
    const messagesContainer = document.querySelector('.chatbot-messages');

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'chatbot-message bot-message';

    // Add text
    const textElement = document.createElement('p');
    textElement.textContent = response.text;
    messageElement.appendChild(textElement);

    // Add options if available
    if (response.options && response.options.length > 0) {
        const optionsElement = document.createElement('div');
        optionsElement.className = 'chatbot-options';

        response.options.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.className = 'chatbot-option';
            optionButton.textContent = option.text;
            optionButton.setAttribute('data-value', option.value);
            optionsElement.appendChild(optionButton);
        });

        messageElement.appendChild(optionsElement);
    }

    // Add to container
    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    scrollToBottom();

    // Add to conversation state
    chatbotState.conversation.push({
        sender: 'bot',
        message: response.text,
        options: response.options
    });
}

/**
 * Show the lead capture form
 */
function showLeadCaptureForm(leadType) {
    const messagesContainer = document.querySelector('.chatbot-messages');

    // Create form element
    const formElement = document.createElement('div');
    formElement.className = 'chatbot-lead-form';

    // Different form based on lead type
    if (leadType === 'contact') {
        formElement.innerHTML = `
            <p>Please provide your contact information:</p>
            <div class="form-group">
                <input type="text" placeholder="Your Name" id="chatbot-lead-name" required>
            </div>
            <div class="form-group">
                <input type="email" placeholder="Your Email" id="chatbot-lead-email" required>
            </div>
            <div class="form-group">
                <input type="tel" placeholder="Your Phone Number" id="chatbot-lead-phone">
            </div>
            <button type="button" class="chatbot-lead-submit">Submit</button>
        `;
    } else {
        formElement.innerHTML = `
            <p>Please provide your email to receive more information:</p>
            <div class="form-group">
                <input type="email" placeholder="Your Email" id="chatbot-lead-email" required>
            </div>
            <button type="button" class="chatbot-lead-submit">Submit</button>
        `;
    }

    // Add to container
    messagesContainer.appendChild(formElement);

    // Scroll to bottom
    scrollToBottom();

    // Add event listener to submit button
    const submitButton = formElement.querySelector('.chatbot-lead-submit');
    submitButton.addEventListener('click', function() {
        submitLeadForm(formElement, leadType);
    });
}

/**
 * Submit the lead form
 */
function submitLeadForm(formElement, leadType) {
    // Get form data
    const name = formElement.querySelector('#chatbot-lead-name')?.value || '';
    const email = formElement.querySelector('#chatbot-lead-email')?.value || '';
    const phone = formElement.querySelector('#chatbot-lead-phone')?.value || '';

    // Validate email
    if (!email || !validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Show loading state
    formElement.classList.add('loading');
    const submitButton = formElement.querySelector('.chatbot-lead-submit');
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    // Create email subject and body
    const subject = `${leadType === 'contact' ? 'Contact Request' : 'Quote Request'} from ${name || 'Website Visitor'}`;
    const body = `Name: ${name || 'Not provided'}
Email: ${email}
Phone: ${phone || 'Not provided'}
Interest: ${chatbotState.context.lastSelection || leadType}
Source: Chatbot
Page: ${window.location.href}

Message: User submitted a ${leadType} request through the chatbot.`;

    // Create mailto link
    const mailtoLink = `mailto:exrevolution8@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Try to send via backend first, fallback to email
    fetch(`${API_BASE_URL}/chatbot/lead`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            email,
            phone,
            interest: chatbotState.context.lastSelection || leadType,
            source: 'Chatbot',
            leadScore: 50,
            landingPage: window.location.href
        })
    })
    .then(response => response.json())
    .then(data => {
        // Remove form
        formElement.remove();

        if (data.success) {
            // Mark lead as captured
            chatbotState.leadCaptured = true;

            // Show success message
            if (leadType === 'contact') {
                addBotMessage({
                    text: `Thanks, ${name || 'there'}! One of our representatives will contact you soon at ${email}${phone ? ' or ' + phone : ''}. Is there anything else I can help you with?`,
                    options: [
                        { text: "No, that's all for now", value: "end" },
                        { text: "Yes, I have another question", value: "more" }
                    ]
                });
            } else {
                addBotMessage({
                    text: `Thanks! We'll send more information to ${email} shortly. Is there anything specific you'd like to know about our services?`,
                    options: [
                        { text: "Tell me about your process", value: "process" },
                        { text: "What technologies do you use?", value: "tech" },
                        { text: "No, that's all for now", value: "end" }
                    ]
                });
            }
        } else {
            // Fallback to email
            window.open(mailtoLink, '_blank');
            handleLeadSubmissionFallback(formElement, name, email, leadType);
        }
    })
    .catch(error => {
        console.error('Error submitting lead:', error);

        // Fallback to email
        window.open(mailtoLink, '_blank');
        handleLeadSubmissionFallback(formElement, name, email, leadType);
    });
}

/**
 * Handle lead submission fallback when backend is not available
 */
function handleLeadSubmissionFallback(formElement, name, email, leadType) {
    // Remove form
    formElement.remove();

    // Mark lead as captured
    chatbotState.leadCaptured = true;

    // Show success message with email fallback info
    if (leadType === 'contact') {
        addBotMessage({
            text: `Thanks, ${name || 'there'}! I've opened your email client with a pre-filled message. Please send it so our team can contact you at ${email}. You can also call us directly at +255 744 622 649.`,
            options: [
                { text: "No, that's all for now", value: "end" },
                { text: "Yes, I have another question", value: "more" }
            ]
        });
    } else {
        addBotMessage({
            text: `Thanks! I've opened your email client with a pre-filled quote request. Please send it and we'll respond with detailed information at ${email}. You can also call +255 744 622 649 for immediate assistance.`,
            options: [
                { text: "Tell me about your process", value: "process" },
                { text: "How long do projects take?", value: "timeline" },
                { text: "No, that's all for now", value: "end" }
            ]
        });
    }
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const typingIndicator = document.querySelector('.chatbot-typing');
    typingIndicator.style.display = 'block';
    scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.chatbot-typing');
    typingIndicator.style.display = 'none';
}

/**
 * Scroll to the bottom of the chat
 */
function scrollToBottom() {
    const messagesContainer = document.querySelector('.chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Generate a unique user ID
 */
function generateUserId() {
    // Check if user ID already exists
    const existingId = localStorage.getItem('chatbot_user_id');
    if (existingId) return existingId;

    // Generate new ID
    const newId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('chatbot_user_id', newId);
    return newId;
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Add chatbot styles
 */
function addChatbotStyles() {
    const styleElement = document.createElement('style');
    styleElement.id = 'chatbot-styles';
    styleElement.textContent = `
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            font-family: var(--font-family);
        }

        .chatbot-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: var(--primary);
            color: white;
            border: none;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.3s ease;
        }

        .chatbot-toggle:hover {
            background-color: var(--primary-dark);
            transform: scale(1.05);
        }

        .chatbot-toggle.attention {
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); }
            50% { transform: scale(1.05); box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3); }
            100% { transform: scale(1); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); }
        }

        .chatbot-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px) scale(0.9);
            pointer-events: none;
            transition: all 0.3s ease;
        }

        .chatbot-window.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        .chatbot-header {
            padding: 15px;
            background-color: var(--primary);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chatbot-title {
            display: flex;
            align-items: center;
        }

        .chatbot-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: var(--bg-primary);
            margin-right: 10px;
            overflow: hidden;
        }

        .chatbot-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .chatbot-header h3 {
            margin: 0;
            font-size: 16px;
        }

        .chatbot-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }

        .chatbot-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .chatbot-message {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 18px;
            margin-bottom: 5px;
            word-wrap: break-word;
        }

        .bot-message {
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            align-self: flex-start;
            border-bottom-left-radius: 5px;
        }

        .user-message {
            background-color: var(--primary);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 5px;
        }

        .chatbot-options {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }

        .chatbot-option {
            background-color: var(--bg-primary);
            border: 1px solid var(--primary);
            color: var(--primary);
            border-radius: 18px;
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .chatbot-option:hover {
            background-color: var(--primary);
            color: white;
        }

        .chatbot-typing {
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .chatbot-typing span {
            width: 8px;
            height: 8px;
            background-color: var(--text-tertiary, #ccc);
            border-radius: 50%;
            display: inline-block;
            animation: typing 1.4s infinite both;
        }

        .chatbot-typing span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .chatbot-typing span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.7; }
        }

        .chatbot-input {
            display: flex;
            padding: 10px;
            border-top: 1px solid var(--border-color, #eee);
            background-color: var(--bg-primary);
        }

        .chatbot-input input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid var(--border-color, #ddd);
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            background-color: var(--bg-primary);
            color: var(--text-primary);
        }

        .chatbot-input button {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            margin-left: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .chatbot-input button:hover {
            background-color: var(--primary-dark);
        }

        .chatbot-lead-form {
            background-color: var(--bg-secondary);
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
            align-self: flex-start;
        }

        .chatbot-lead-form p {
            margin-top: 0;
            margin-bottom: 10px;
            color: var(--text-primary);
        }

        .chatbot-lead-form .form-group {
            margin-bottom: 10px;
        }

        .chatbot-lead-form input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color, #ddd);
            border-radius: 5px;
            font-size: 14px;
            background-color: var(--bg-primary);
            color: var(--text-primary);
        }

        .chatbot-lead-form button {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .chatbot-lead-form button:hover {
            background-color: var(--primary-dark);
        }

        .chatbot-lead-form.loading {
            opacity: 0.7;
        }

        @media (max-width: 480px) {
            .chatbot-window {
                width: calc(100% - 40px);
                height: 60vh;
                bottom: 80px;
            }
        }
    `;
    document.head.appendChild(styleElement);
}

/**
 * Generate a unique user ID
 */
function generateUserId() {
    // Check if user ID already exists in localStorage
    let userId = localStorage.getItem('chatbot_user_id');

    if (!userId) {
        // Generate a new user ID
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chatbot_user_id', userId);
    }

    return userId;
}
