import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            text: "Hi! I'm the Infinos AI assistant. Ask me anything about our dual-zone containers or AIoT platform!",
            isBot: true
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Comprehensive product knowledge base with concise responses
    const getFallbackResponse = (question) => {
        const lowerQuestion = question.toLowerCase();

        // Product Features & Solution
        if (lowerQuestion.includes('dual-zone') || lowerQuestion.includes('container') || lowerQuestion.includes('product') || lowerQuestion.includes('solution')) {
            return "InfinosTech's portable smart container is a 3-in-1 system: cool only, heat only, or dual-zone (hot & cold simultaneously).\n\n• Dual-zone temperature control with app monitoring\n• Lightweight, customizable, and AIoT-enabled\n• Built-in UV sanitization for hygiene\n• Eco-friendly organic coolants\n• Compatible with drones, EVs, bikes";
        }

        // AIoT Platform & Technology
        if (lowerQuestion.includes('aiot') || lowerQuestion.includes('platform') || lowerQuestion.includes('monitoring') || lowerQuestion.includes('track') || lowerQuestion.includes('app') || lowerQuestion.includes('smart')) {
            return "Our AIoT platform provides:\n\n• Real-time temperature & location tracking\n• Mobile app control for remote adjustments\n• Instant alerts for temperature deviations\n• Cloud-based analytics dashboard\n• Fleet management insights\n\nMonitor every delivery with complete visibility.";
        }

        // Temperature Specifications
        if (lowerQuestion.includes('temperature') || lowerQuestion.includes('range') || lowerQuestion.includes('degree') || lowerQuestion.includes('cooling') || lowerQuestion.includes('heating')) {
            return "Dual-Zone Temperature Range:\n\n• Cooling: 0°C to 10°C (vaccines, medicines, fresh produce)\n• Heating: 40°C to 80°C (hot meals, incubation)\n\nBoth zones operate independently and simultaneously with active temperature control.";
        }

        // Problem Statement
        if (lowerQuestion.includes('problem') || lowerQuestion.includes('why') || lowerQuestion.includes('need') || lowerQuestion.includes('waste')) {
            return "Key problems we solve:\n\n• 20-30% of perishable food lost due to poor temperature control\n• 50% vaccine waste from temperature failures\n• Heavy, power-hungry cold chain unsuitable for last-mile\n• Lack of eco-friendly alternatives to chemical coolants\n\nQuick commerce needs lightweight, smart solutions - that's InfinosTech.";
        }

        // Competitors & Differentiation
        if (lowerQuestion.includes('competitor') || lowerQuestion.includes('different') || lowerQuestion.includes('better') || lowerQuestion.includes('compare') || lowerQuestion.includes('advantage')) {
            return "InfinosTech vs Competitors:\n\n• Godrej ChotuKool: Heavy & electric-only → We're drone-compatible\n• Hi-Rapid Labs: No smart features → We have AIoT + dual-zone\n• Vaara: Bulky, not last-mile ready → We're portable & versatile\n• Ice Boxes: Passive cooling → We provide active control\n\nWe deliver both portability AND precision.";
        }

        // Market & Business Model
        if (lowerQuestion.includes('market') || lowerQuestion.includes('tam') || lowerQuestion.includes('sam') || lowerQuestion.includes('som') || lowerQuestion.includes('opportunity')) {
            return "Market Opportunity:\n\n• TAM: $16B (India's last-mile temp-controlled logistics)\n• SAM: $10B (Food delivery, quick commerce, B2B)\n• SOM: $3B (Last-mile food delivery with bikes/EVs)\n\nCustomers: Food & quick commerce companies\nUsers: Delivery partners\n\nStarting in India, scaling globally.";
        }

        // Pricing & Revenue Model
        if (lowerQuestion.includes('price') || lowerQuestion.includes('cost') || lowerQuestion.includes('pricing') || lowerQuestion.includes('buy') || lowerQuestion.includes('revenue') || lowerQuestion.includes('business model')) {
            return "B2B Revenue Model:\n\n• Portable AIoT Device: $30-$100/unit (30%)\n• AIoT Analytics SaaS: Platform access (20%)\n• Direct B2B Sales: Complete solutions (20%)\n• Subscriptions: Bulk orders (15%)\n• Coolant Refills: Ongoing revenue (15%)\n\nContact contact@infinostech.com for custom quotes.";
        }

        // Traction & Validations
        if (lowerQuestion.includes('traction') || lowerQuestion.includes('customer') || lowerQuestion.includes('pilot') || lowerQuestion.includes('purchase order') || lowerQuestion.includes('client')) {
            return "Proven Traction:\n\n✓ 3 Purchase Orders: Sepal, Mirai Millet, Blitz Food\n✓ Paid Pilots: Lavin Labs, Bluecloudsoftech, Agrighar Community\n✓ Active Discussions: Bharat Biotech, Vijay Diagnostics\n✓ ISF Junicorn Cohort 2 member\n✓ MOU with Yubhas Renewables\n\nEV and drone trials completed successfully in Hyderabad.";
        }

        // Patents & IP
        if (lowerQuestion.includes('patent') || lowerQuestion.includes('intellectual property') || lowerQuestion.includes('ip')) {
            return "Indian Patent filed in 2023 for our dual-zone temperature control technology. This protects our proprietary AIoT-enabled, sustainable logistics innovation.";
        }

        // Investment & Funding
        if (lowerQuestion.includes('investment') || lowerQuestion.includes('funding') || lowerQuestion.includes('raise') || lowerQuestion.includes('valuation') || lowerQuestion.includes('equity')) {
            return "Current Fundraising:\n\n• Raising: $360K USD (Convertible)\n• Valuation Cap: $7-9M\n\nUse of Funds:\n1. Scale manufacturing (20-30 units)\n2. Deploy with quick commerce partners\n3. Adapt for medical/vaccine logistics\n4. Build sales team\n\nFood is entry, healthcare is expansion. Contact: contact@infinostech.com";
        }

        // Vaccine & Medical Applications
        if (lowerQuestion.includes('vaccine') || lowerQuestion.includes('medical') || lowerQuestion.includes('healthcare') || lowerQuestion.includes('pharma') || lowerQuestion.includes('diagnosis')) {
            return "Healthcare Applications:\n\n• Vaccine-grade cooling (0-10°C) prevents 50% waste\n• Built-in UV sanitization for hygiene\n• Perfect for diagnosis labs & pharma transport\n• Supports rural healthcare & humanitarian aid\n\nIn discussions with Bharat Biotech. Demos done with Vijay Diagnostics.";
        }

        // Food Delivery Applications
        if (lowerQuestion.includes('food') || lowerQuestion.includes('meal') || lowerQuestion.includes('restaurant') || lowerQuestion.includes('delivery') || lowerQuestion.includes('quick commerce')) {
            return "Food & Quick Commerce:\n\n• Simultaneous hot (40-80°C) and cold (0-10°C) delivery\n• Prevents 20-30% perishable food loss\n• Perfect for bikes, EVs, last-mile delivery\n• Eco-friendly organic coolants\n• Real-time quality monitoring\n\nIdeal for food platforms, restaurants, and quick commerce.";
        }

        // Technology & Specifications
        if (lowerQuestion.includes('how') || lowerQuestion.includes('work') || lowerQuestion.includes('technology') || lowerQuestion.includes('specification') || lowerQuestion.includes('feature')) {
            return "Technology Features:\n\n• Battery-powered active cooling/heating\n• App-controlled temperature management\n• Organic coolants (eco-friendly)\n• Multi-insulated, lightweight design\n• Real-time AIoT cloud integration\n• Built-in UV sanitization\n• Sizes: 30L, 60L, 80L\n\nCompatible with drones, EVs, bikes, bicycles.";
        }

        // Battery & Power
        if (lowerQuestion.includes('battery') || lowerQuestion.includes('power') || lowerQuestion.includes('charge') || lowerQuestion.includes('portable')) {
            return "Portable Power:\n\n• Battery-powered (no constant electrical connection)\n• Extended runtime for full delivery cycles\n• Quick charging capability\n• Lightweight for drone compatibility\n• Works with bikes, EVs, 2-wheelers\n\nFor detailed specs: contact@infinostech.com";
        }

        // Sustainability & SDG
        if (lowerQuestion.includes('sustain') || lowerQuestion.includes('eco') || lowerQuestion.includes('green') || lowerQuestion.includes('environment') || lowerQuestion.includes('sdg')) {
            return "Sustainability Commitment:\n\n• UN SDG Goals: 9, 11, 13 (Industry, Cities, Climate)\n• Organic eco-friendly coolants\n• EV-compatible for green transport\n• Reduces food & vaccine waste\n• Scalable sustainable operations\n\nBuilding a sustainable logistics future.";
        }

        // Awards & Recognition
        if (lowerQuestion.includes('award') || lowerQuestion.includes('recognition') || lowerQuestion.includes('achievement') || lowerQuestion.includes('cohort')) {
            return "Recognition:\n\n• ISF Junicorn Cohort 2 member\n• MOU with Yubhas Renewables\n• Hitex Kisan Expo participant\n• Featured in Dalit Indian Chamber of Commerce\n\nGaining organic traction with strong partnerships.";
        }

        // Contact & Location
        if (lowerQuestion.includes('contact') || lowerQuestion.includes('reach') || lowerQuestion.includes('email') || lowerQuestion.includes('phone') || lowerQuestion.includes('location') || lowerQuestion.includes('where') || lowerQuestion.includes('office')) {
            return "Contact InfinosTech:\n\n📧 contact@infinostech.com\n🌐 www.infinostech.com\n📍 Hyderabad, India\n⏱️ Response: Within 24 hours\n\nServing clients globally. Let's discuss partnerships, pilots, or investments!";
        }

        // Drone & EV Compatibility
        if (lowerQuestion.includes('drone') || lowerQuestion.includes('ev') || lowerQuestion.includes('electric vehicle') || lowerQuestion.includes('bicycle') || lowerQuestion.includes('bike')) {
            return "Multi-Vehicle Compatibility:\n\n• Drones: Lightweight aerial transport\n• EVs: Seamless fleet integration\n• Bicycles/Bikes: 2-wheeler last-mile delivery\n• Flexible for modern logistics\n\nEV trials and drone tests completed in Hyderabad.";
        }

        // Use Cases
        if (lowerQuestion.includes('use case') || lowerQuestion.includes('application') || lowerQuestion.includes('who can use') || lowerQuestion.includes('industry')) {
            return "Use Cases:\n\n• Quick commerce & food delivery\n• Healthcare: vaccines & medical supplies\n• Fresh produce: farm-to-consumer\n• Restaurant hot/cold meal delivery\n• Pharmaceuticals\n• Diagnostic lab samples\n• Humanitarian aid\n• B2B industrial logistics\n\nAny temperature-controlled last-mile need.";
        }

        // Default comprehensive response
        return "Welcome to InfinosTech! 👋\n\nWe build sustainable, dual-zone, AIoT-enabled portable containers for last-mile logistics.\n\nAsk me about:\n• Product features\n• Temperature specs\n• Pricing & business model\n• Traction & customers\n• Investment opportunities\n• Use cases\n\nOr email: contact@infinostech.com";
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        // Add user message
        setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
        setIsLoading(true);

        // Use fallback responses (since API is having issues)
        setTimeout(() => {
            const response = getFallbackResponse(userMessage);
            setMessages(prev => [...prev, { text: response, isBot: true }]);
            setIsLoading(false);
        }, 800); // Simulate thinking time
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            <button
                className="chatbot-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Chatbot"
            >
                {isOpen ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
            </button>

            <div className="chatbot-window">
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-avatar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                                <path d="M4.93 19.07a10 10 0 1 1 14.14 0" />
                                <circle cx="12" cy="12" r="4" />
                            </svg>
                        </div>
                        <span>Infinos Assistant</span>
                    </div>
                </div>

                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                            {msg.text}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message bot loading">
                            <span>●</span><span>●</span><span>●</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chatbot-input-area">
                    <button className="icon-btn" title="Add attachment">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about our products..."
                        disabled={isLoading}
                    />
                    <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;