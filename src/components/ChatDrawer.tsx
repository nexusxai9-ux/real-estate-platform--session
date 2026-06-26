import React, { useState, useEffect, useRef } from 'react';
import { Property, Message, ChatSession, UserProfile } from '../types';
import { dbService } from '../data/mockData';
import { 
  X, 
  Send, 
  MessageSquare, 
  Sparkles, 
  User, 
  Bot, 
  CheckCheck, 
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  selectedPropertyContext?: Property | null;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function ChatDrawer({ isOpen, onClose, currentUser, selectedPropertyContext, refreshTrigger, onRefresh }: ChatDrawerProps) {
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested Quick Questions
  const QUICK_QUESTIONS = [
    'Is the price negotiable?',
    'What premium amenities are included?',
    'Can I schedule a walkthrough tour?',
    'Are there any good schools nearby?'
  ];

  // Load conversations on mount or trigger
  useEffect(() => {
    if (!currentUser) return;
    
    const role = currentUser.role === 'seller' ? 'seller' : 'buyer';
    const chats = dbService.getChatsForUser(currentUser.id, role);
    setConversations(chats);

    // Auto-select first chat or context property chat
    if (selectedPropertyContext) {
      const targetChatId = `chat-prop-${selectedPropertyContext.id}-user-${currentUser.id}`;
      // Check if session exists in DB, if not, create initial welcome message
      const existingMsgs = dbService.getMessages(targetChatId);
      if (existingMsgs.length === 0) {
        dbService.addMessage({
          chatId: targetChatId,
          senderId: 'ai',
          senderName: 'Aria (AI Concierge)',
          senderRole: 'ai',
          text: `Hello ${currentUser.name}! I am Aria, your AI Real Estate Assistant. I have all the details about "${selectedPropertyContext.title}" ($${selectedPropertyContext.price.toLocaleString()}) ready. What would you like to know about this listing?`
        });
      }
      
      // Refresh chats
      const updatedChats = dbService.getChatsForUser(currentUser.id, role);
      setConversations(updatedChats);
      setActiveSessionId(targetChatId);
    } else if (chats.length > 0 && !activeSessionId) {
      setActiveSessionId(chats[0].id);
    }
  }, [currentUser, selectedPropertyContext, isOpen, refreshTrigger]);

  // Load messages for active session
  useEffect(() => {
    if (activeSessionId) {
      const msgs = dbService.getMessages(activeSessionId);
      setMessages(msgs);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, refreshTrigger]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const activeSession = conversations.find(c => c.id === activeSessionId);
  
  const handleSendMessage = (textToSend: string) => {
    if (!currentUser || !activeSessionId || !textToSend.trim()) return;

    // Send user message
    const userMsg = dbService.addMessage({
      chatId: activeSessionId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role === 'seller' ? 'seller' : 'buyer',
      text: textToSend.trim()
    });

    setInputText('');
    onRefresh();

    // Trigger AI response if chatting as buyer
    if (currentUser.role === 'buyer') {
      setIsTyping(true);
      
      setTimeout(() => {
        // Fetch property information
        const allProps = dbService.getProperties();
        const propId = activeSessionId.split('-')[2] || 'prop-1'; // Parse property ID
        const property = allProps.find(p => p.id === propId) || allProps[0];
        
        let reply = '';
        const normText = textToSend.toLowerCase();

        // CONTEXT AWARE INTELLIGENT AI HEURISTICS
        if (normText.includes('negotiable') || normText.includes('price') || normText.includes('offer')) {
          reply = `The asking price for "${property.title}" is $${property.price.toLocaleString()}. While the sellers are focused on this price point, reasonable offers accompanied by bank pre-approval letters will be formally presented. I can help you book a visit to discuss terms with Sarah!`;
        } else if (normText.includes('amenity') || normText.includes('amenities') || normText.includes('pool') || normText.includes('features')) {
          reply = `Absolutely! "${property.title}" is fully loaded with top-tier convenience. It features: ${property.amenities.join(', ')}. Additionally, it contains a robust layout spanning ${property.sqft.toLocaleString()} square feet of luxury materials.`;
        } else if (normText.includes('tour') || normText.includes('visit') || normText.includes('walkthrough') || normText.includes('schedule')) {
          reply = `I would love to help you schedule a showing! Please close this chat panel, click the "Explore Details" button on the property card, and use our integrated "Schedule Private Visit" booking engine. Sarah is available this coming week!`;
        } else if (normText.includes('school') || normText.includes('district') || normText.includes('nearby')) {
          reply = `This location in ${property.city} sits in an excellent, highly-rated school district with premium primary and secondary academies within a 10-minute drive. It is a fantastic family-oriented neighborhood.`;
        } else if (normText.includes('built') || normText.includes('year') || normText.includes('old')) {
          reply = `"${property.title}" was custom-crafted in the year ${property.yearBuilt}. It is built with highly efficient structural elements and modern insulation.`;
        } else {
          reply = `Thank you for asking! "${property.title}" is located at ${property.location} in the beautiful ${property.city}. It features ${property.bedrooms} spacious bedrooms, ${property.bathrooms} elegant bathrooms, and premium build-quality. Let me know if you would like me to answer any specific design or staging questions!`;
        }

        dbService.addMessage({
          chatId: activeSessionId,
          senderId: 'ai',
          senderName: 'Aria (AI Concierge)',
          senderRole: 'ai',
          text: reply
        });

        setIsTyping(false);
        onRefresh();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* DRAWER CONTAINER */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* DRAWER HEADER */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Platform Communication Hub</h2>
              <p className="text-[10px] text-gray-300 font-mono">REAL-TIME INBOX</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DOUBLE PANEL LAYOUT */}
        <div className="flex flex-1 min-h-0">
          
          {/* LEFT MINI SIDEBAR: CHATS LIST */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
            <div className="p-2.5 border-b border-gray-100 bg-white">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-1 space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 px-2 text-gray-400">
                  <p className="text-[10px]">No active chats</p>
                </div>
              ) : (
                conversations.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setActiveSessionId(c.id)}
                    className={`w-full text-left p-2 rounded-lg transition-all text-xs ${
                      c.id === activeSessionId 
                        ? 'bg-white text-indigo-600 border border-indigo-100/80 font-bold shadow-xs' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <p className="truncate text-[11px] leading-tight font-extrabold">{c.propertyTitle}</p>
                    <p className="text-[9px] text-gray-400 truncate mt-0.5 font-medium leading-none">
                      {currentUser?.role === 'seller' ? `Client: ${c.buyerName}` : `Agent Chat`}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT VIEW: CONVERSATION DIALOG */}
          <div className="w-2/3 flex flex-col bg-white">
            {activeSession ? (
              <>
                {/* ACTIVE CHAT HEADER */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-900 leading-none truncate max-w-[140px]">{activeSession.propertyTitle}</h3>
                    <p className="text-[9px] text-indigo-600 font-bold mt-0.5 uppercase tracking-wider">
                      {currentUser?.role === 'seller' ? `Buyer: ${activeSession.buyerName}` : 'AI Real Estate Agent'}
                    </p>
                  </div>
                  
                  {currentUser?.role === 'buyer' && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 rounded">
                      <Sparkles className="w-2.5 h-2.5" /> AI Live
                    </span>
                  )}
                </div>

                {/* MESSAGES SCROLL WRAPPER */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/20">
                  {messages.map((m) => {
                    const isMe = m.senderId === currentUser?.id;
                    return (
                      <div 
                        key={m.id} 
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-0.5 px-1 font-semibold">
                          {!isMe && (m.senderRole === 'ai' ? <Bot className="w-3 h-3 text-indigo-500" /> : <User className="w-3 h-3" />)}
                          <span>{isMe ? 'You' : m.senderName}</span>
                        </div>
                        
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-normal shadow-2xs ${
                          isMe 
                            ? 'bg-gray-900 text-white rounded-tr-none' 
                            : m.senderRole === 'ai'
                              ? 'bg-indigo-50 border border-indigo-100/50 text-indigo-950 rounded-tl-none'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          <p>{m.text}</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* TYPING STATUS */}
                  {isTyping && (
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-0.5 px-1 font-semibold">
                        <Bot className="w-3 h-3 text-indigo-500" />
                        <span>Aria (AI Concierge)</span>
                      </div>
                      <div className="bg-indigo-50/60 border border-indigo-50 rounded-2xl px-3.5 py-2 text-xs flex gap-1 items-center rounded-tl-none">
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* BUYER QUICK QUESTIONS BAR */}
                {currentUser?.role === 'buyer' && messages.length > 0 && (
                  <div className="p-2 border-t border-gray-100 bg-white shrink-0">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-500" /> Ask Aria Quick-Questions:
                    </p>
                    <div className="flex flex-col gap-1">
                      {QUICK_QUESTIONS.slice(0, 3).map((qq, i) => (
                        <button 
                          key={i}
                          onClick={() => handleSendMessage(qq)}
                          className="w-full text-left px-2.5 py-1 text-[10px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all truncate"
                        >
                          {qq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MESSAGE INPUT FORM */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputText.trim()) {
                      handleSendMessage(inputText);
                    }
                  }}
                  className="p-3 border-t border-gray-100 bg-white flex gap-2 shrink-0"
                >
                  <input 
                    type="text"
                    placeholder="Write a message..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                  <button 
                    type="submit"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-900 hover:bg-black text-white shrink-0 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-xs font-bold text-gray-800">Select a Conversation</p>
                <p className="text-[10px] leading-relaxed max-w-[150px] mt-1 text-gray-400">Choose a property from the left pane to initialize communication with the listing representatives.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
