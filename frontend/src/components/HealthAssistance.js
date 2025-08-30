import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Mic, MicOff, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const HealthAssistance = ({ isOpen, onClose, userRole = 'patient' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechRef = useRef(null);

  // Welcome message based on user role
  const welcomeMessage = userRole === 'caregiver' 
    ? "Hello! I'm your AI health assistant. I can help you with patient care guidance, monitoring techniques, and general health information. How can I assist you today?"
    : "Hello! I'm your AI health assistant. I can help you with general health questions, lifestyle advice, and understanding when to seek medical help. How can I assist you today?";

  // Example questions based on user role
  const exampleQuestions = userRole === 'caregiver' 
    ? [
        "How can I help a patient with diabetes management?",
        "What are the signs of dehydration in elderly patients?",
        "How should I monitor blood pressure at home?",
        "What are best practices for medication administration?",
        "How can I improve patient communication?"
      ]
    : [
        "I have diabetes, can I eat sweets?",
        "What are the symptoms of high blood pressure?",
        "How much water should I drink daily?",
        "What exercises are good for heart health?",
        "When should I see a doctor for a headache?"
      ];

  // Initialize speech recognition with retry mechanism
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Clean up existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error aborting existing recognition:', error);
        }
      }
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        setRetryCount(0); // Reset retry count on success
        toast.success('Voice input received!');
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition failed. Please try again.';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone and try again.';
            break;
          case 'network':
            errorMessage = 'Network error detected. This might be a temporary issue. Please try again in a few seconds.';
            // Add retry mechanism for network errors
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              setTimeout(() => {
                console.log(`Retrying speech recognition (attempt ${retryCount + 1}/3)...`);
                initSpeechRecognition();
              }, 2000);
            } else {
              setRetryCount(0);
              toast.error('Multiple network errors detected. Please check your internet connection and try again later.');
            }
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. Please try again.';
            break;
          case 'bad-grammar':
            errorMessage = 'Speech recognition grammar error. Please try again.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported. Please try again.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
        }
        
        toast.error(errorMessage);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionRef.current.onaudiostart = () => {
        console.log('Audio capturing started');
      };

      recognitionRef.current.onaudioend = () => {
        console.log('Audio capturing ended');
      };

      recognitionRef.current.onsoundstart = () => {
        console.log('Sound detected');
      };

      recognitionRef.current.onsoundend = () => {
        console.log('Sound ended');
      };

      recognitionRef.current.onspeechstart = () => {
        console.log('Speech started');
      };

      recognitionRef.current.onspeechend = () => {
        console.log('Speech ended');
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechRef.current = window.speechSynthesis;
    }

    initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error aborting speech recognition:', error);
        }
      }
      if (speechRef.current && speechRef.current.speaking) {
        speechRef.current.cancel();
      }
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Browser is online');
      setRetryCount(0); // Reset retry count when back online
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Browser is offline');
      if (isListening) {
        stopListening();
        toast.error('Internet connection lost. Voice recognition stopped.');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isListening]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length, welcomeMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speak text using speech synthesis
  const speakText = (text) => {
    if (!voiceEnabled || !speechRef.current) return;

    // Stop any current speech
    if (speechRef.current.speaking) {
      speechRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current.speak(utterance);
  };

  // Start listening for voice input with retry mechanism
  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (!isOnline) {
      toast.error('You appear to be offline. Please check your internet connection.');
      return;
    }

    // Check if speech recognition is already running
    if (isListening) {
      stopListening();
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... Speak now!');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      
      if (error.name === 'NetworkError' || error.message.includes('network')) {
        toast.error('Network connection issue detected. Please check your internet and try again.');
        
        // Retry after a short delay
        setTimeout(() => {
          console.log('Retrying speech recognition after network error...');
          startListening();
        }, 1000);
      } else if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone permissions.');
      } else {
        toast.error('Failed to start voice recognition. Please try again.');
      }
    }
  };

  // Stop listening for voice input
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      setIsListening(false);
    }
  };

  // Test speech recognition functionality
  const testSpeechRecognition = () => {
    console.log('=== Speech Recognition Test ===');
    console.log('Browser online status:', navigator.onLine);
    console.log('Speech recognition supported:', !!(window.SpeechRecognition || window.webkitSpeechRecognition));
    console.log('Speech synthesis supported:', !!window.speechSynthesis);
    console.log('Current retry count:', retryCount);
    
    if (recognitionRef.current) {
      console.log('Speech recognition instance exists');
    } else {
      console.log('Speech recognition instance not found');
    }
    
    // Test network connectivity
    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' })
      .then(() => console.log('Network connectivity: OK'))
      .catch(() => console.log('Network connectivity: Failed'));
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/health-assistance', {
        question: textToSend,
        userContext: {
          role: userRole
        }
      });

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.data.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the AI response if voice is enabled
      speakText(response.data.data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">AI Health Assistant</h3>
              <p className="text-sm opacity-90">
                {userRole === 'caregiver' ? 'Caregiver Support' : 'Patient Support'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Network Status Indicator */}
            <div className="flex items-center space-x-1">
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} 
                   title={isOnline ? 'Online' : 'Offline'} />
            </div>
            
            {/* Voice Toggle Button */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full transition-colors ${
                voiceEnabled 
                  ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                  : 'bg-red-500 bg-opacity-20 hover:bg-opacity-30'
              }`}
              title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            {/* Debug Button (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={testSpeechRecognition}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
                title="Test Speech Recognition"
              >
                <span className="text-xs">🔧</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Example Questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(question)}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about health, symptoms, or care guidance..."
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              disabled={isLoading}
            />
            {/* Voice Input Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || !isOnline}
              className={`px-4 py-3 rounded-lg transition-colors flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop Listening' : 'Start Voice Input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Voice Status Indicators */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              {isListening && (
                <div className="flex items-center space-x-1 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-xs">Listening...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-xs">Speaking...</span>
                </div>
              )}
              {!isOnline && (
                <div className="flex items-center space-x-1 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-xs">Offline</span>
                </div>
              )}
              {retryCount > 0 && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <span className="text-xs">Retry: {retryCount}/3</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center">
              💡 This AI assistant provides general health information only. Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAssistance;
