import { Property, Review, VisitRequest, Notification, Message, ChatSession } from '../types';

// Storage Keys
const PROPERTIES_KEY = 'realestate_properties';
const REVIEWS_KEY = 'realestate_reviews';
const VISITS_KEY = 'realestate_visits';
const NOTIFICATIONS_KEY = 'realestate_notifications';
const MESSAGES_KEY = 'realestate_messages';

// INITIAL SEED DATA
const initialProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'The Glasshouse Vista Villa',
    description: 'An architectural marvel featuring floor-to-ceiling structural glass, a cantilevered infinity pool, and sweeping 180-degree sunset views of the surrounding hills. Designed by award-winning modernist architects, this home seamlessly integrates indoor and outdoor living with smart home automation, a premium chef\'s kitchen, and custom walnut cabinetry throughout.',
    price: 2450000,
    location: '1428 Sunset Crest Dr, Beverly Hills',
    city: 'Los Angeles, CA',
    type: 'House',
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6200,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    sellerId: 'user-seller-1',
    sellerName: 'Sarah Jenkins (Horizon Homes)',
    sellerEmail: 'seller@example.com',
    yearBuilt: 2022,
    featured: true,
    amenities: ['Infinity Pool', 'Smart Automation', 'Home Cinema', 'Wine Cellar', 'Heated Floors', 'Tesla Charger'],
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() // 10 days ago
  },
  {
    id: 'prop-2',
    title: 'Urban Brick Skyline Loft',
    description: 'Located in the heart of Tribeca, this authentic pre-war industrial loft features original exposed red brick walls, 12-foot heavy timber ceilings, massive cast-iron windows, and wide-plank oak floors. The open-concept living space is perfect for art collectors and entertainers, featuring a professional-grade Sub-Zero kitchen and panoramic Manhattan skyline views.',
    price: 1250000,
    location: '482 Greenwich St, Penthouse B, Tribeca',
    city: 'New York, NY',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1850,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    sellerId: 'user-seller-1',
    sellerName: 'Sarah Jenkins (Horizon Homes)',
    sellerEmail: 'seller@example.com',
    yearBuilt: 1920,
    featured: true,
    amenities: ['Rooftop Access', 'Exposed Brick', 'Doorman', 'Private Elevator', 'Historic Character', 'Storage Unit'],
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'prop-3',
    title: 'Pacific Coast Sands Retreat',
    description: 'Experience true coastal luxury in this pristine beachside retreat with direct private access to the sand. Features double-height vaulted ceilings, a expansive teak sun deck with direct ocean views, a built-in outdoor kitchen, and fire pit. Wake up to the soothing sound of rolling waves and views of dolphins swimming along the coast.',
    price: 3890000,
    location: '23412 Malibu Colony Rd',
    city: 'Malibu, CA',
    type: 'Condo',
    bedrooms: 3,
    bathrooms: 3.5,
    sqft: 2900,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    sellerId: 'user-seller-1',
    sellerName: 'Sarah Jenkins (Horizon Homes)',
    sellerEmail: 'seller@example.com',
    yearBuilt: 2015,
    featured: true,
    amenities: ['Ocean Front', 'Private Beach', 'Teak Sun Deck', 'Fire Pit', 'Outdoor Kitchen', 'Hot Tub'],
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'prop-4',
    title: 'Minimalist Monolithic Haven',
    description: 'A striking architectural statement utilizing raw board-formed concrete, natural cedar cladding, and black steel details. This ultra-efficient smart home includes full solar integration, battery backup, dynamic double-insulated windows, and an indoor zen garden. Situated on a private greenbelt, it offers absolute privacy just minutes from downtown Austin.',
    price: 980000,
    location: '1804 Barton Hills Dr',
    city: 'Austin, TX',
    type: 'House',
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    sellerId: 'user-seller-1',
    sellerName: 'Sarah Jenkins (Horizon Homes)',
    sellerEmail: 'seller@example.com',
    yearBuilt: 2024,
    featured: false,
    amenities: ['Solar Panels', 'Smart Automation', 'Tesla Powerwall', 'Zen Garden', 'Private Greenbelt', 'Rainwater Harvesting'],
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'prop-5',
    title: 'Chonky Pine Lakeside Chalet',
    description: 'A luxurious alpine escape surrounded by towering sugar pines with breathtaking panoramic lake views. The chalet features an impressive stone double-sided fireplace, massive hand-peeled log columns, professional culinary kitchen, and a wraparound covered porch. Includes private boat slip on the shared dock and close proximity to premier ski runs.',
    price: 785000,
    location: '412 Lakeshore Blvd',
    city: 'Lake Tahoe, CA',
    type: 'Townhouse',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3100,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80',
    status: 'pending_approval', // Needs Admin approval!
    sellerId: 'user-seller-1',
    sellerName: 'Sarah Jenkins (Horizon Homes)',
    sellerEmail: 'seller@example.com',
    yearBuilt: 2018,
    featured: false,
    amenities: ['Lake View', 'Boat Dock', 'Stone Fireplace', 'Ski Access', 'Game Room', 'Hot Tub'],
    createdAt: new Date().toISOString()
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    propertyId: 'prop-1',
    propertyTitle: 'The Glasshouse Vista Villa',
    authorId: 'user-buyer-1',
    authorName: 'Alex Johnson',
    authorRole: 'buyer',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Absolutely spectacular property. The architectural integration of glass and natural hills is breathtaking. I scheduled a virtual tour with Sarah and was blown away by the lighting and layout. Highly recommended!',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'rev-2',
    propertyId: 'prop-1',
    propertyTitle: 'The Glasshouse Vista Villa',
    authorId: 'user-buyer-2',
    authorName: 'Eleanor Vance',
    authorRole: 'buyer',
    rating: 4,
    comment: 'The views are out of this world and the finishes are top tier. A tiny bit of traffic noise can be heard from the canyon, but the smart soundproofing windows cancel it out perfectly when closed.',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'rev-3',
    propertyId: 'prop-2',
    propertyTitle: 'Urban Brick Skyline Loft',
    authorId: 'user-buyer-1',
    authorName: 'Alex Johnson',
    authorRole: 'buyer',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Authentic Tribeca loft living at its absolute finest. The exposed beams and pre-war brick are full of character. Sarah was extremely professional in explaining the condo board requirements.',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

const initialVisits: VisitRequest[] = [
  {
    id: 'visit-1',
    propertyId: 'prop-1',
    propertyTitle: 'The Glasshouse Vista Villa',
    propertyImageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&auto=format&fit=crop&q=80',
    buyerId: 'user-buyer-1',
    buyerName: 'Alex Johnson',
    buyerEmail: 'buyer@example.com',
    sellerId: 'user-seller-1',
    date: '2026-07-02',
    time: '14:00',
    type: 'in-person',
    status: 'approved',
    notes: 'Would love to check out the soundproofing and cinema room. Will bring my financing pre-approval letter.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'visit-2',
    propertyId: 'prop-3',
    propertyTitle: 'Pacific Coast Sands Retreat',
    propertyImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&auto=format&fit=crop&q=80',
    buyerId: 'user-buyer-1',
    buyerName: 'Alex Johnson',
    buyerEmail: 'buyer@example.com',
    sellerId: 'user-seller-1',
    date: '2026-07-05',
    time: '11:00',
    type: 'virtual',
    status: 'pending',
    notes: 'Requesting a quick FaceTime walkthrough to see the direct beach path access.',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-buyer-1',
    title: 'Visit Request Approved',
    message: 'Your request for an In-Person tour at "The Glasshouse Vista Villa" on 2026-07-02 has been APPROVED by the seller.',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'user-seller-1',
    title: 'New Listing Inquiry',
    message: 'Alex Johnson requested a Virtual walkthrough for your listing "Pacific Coast Sands Retreat".',
    type: 'inquiry',
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    userId: 'user-admin-1',
    title: 'New Listing Pending Review',
    message: 'Seller Sarah Jenkins submitted "Chonky Pine Lakeside Chalet" for approval.',
    type: 'warning',
    read: false,
    createdAt: new Date().toISOString()
  }
];

// Seed messages for the dynamic chat system
const initialMessages: Message[] = [
  {
    id: 'msg-1',
    chatId: 'chat-prop-1-user-buyer-1',
    senderId: 'user-buyer-1',
    senderName: 'Alex Johnson',
    senderRole: 'buyer',
    text: 'Hi! I am really interested in the Glasshouse Vista Villa. Does it come fully furnished?',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'msg-2',
    chatId: 'chat-prop-1-user-buyer-1',
    senderId: 'ai',
    senderName: 'Aria (AI Concierge)',
    senderRole: 'ai',
    text: 'Hello Alex! Yes, the Glasshouse Vista Villa can be purchased fully furnished as shown in the staging photos. The custom minimalist furniture was curated by design group Studio Oak. Would you like me to help you schedule a virtual or in-person visit to experience the space?',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 2000).toISOString()
  }
];

// DATABASE CORE WITH LOCAL STORAGE SYNCRONIZATION
export const dbService = {
  // --- PROPERTIES ---
  getProperties(): Property[] {
    const data = localStorage.getItem(PROPERTIES_KEY);
    if (!data) {
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(initialProperties));
      return initialProperties;
    }
    return JSON.parse(data);
  },

  saveProperty(property: Omit<Property, 'id' | 'createdAt' | 'status'>): Property {
    const properties = this.getProperties();
    const newProperty: Property = {
      ...property,
      id: `prop-${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending_approval', // listings default to pending admin approval
      createdAt: new Date().toISOString()
    };
    properties.unshift(newProperty);
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));

    // Notify admins about new listing
    this.addNotification({
      userId: 'user-admin-1',
      title: 'New Listing Pending Review',
      message: `A new property listing "${newProperty.title}" ($${newProperty.price.toLocaleString()}) by ${newProperty.sellerName} requires your approval.`,
      type: 'warning'
    });

    return newProperty;
  },

  approveProperty(propertyId: string): Property[] {
    const properties = this.getProperties();
    const updated = properties.map(p => {
      if (p.id === propertyId) {
        // Send notification to the seller
        this.addNotification({
          userId: p.sellerId,
          title: 'Property Listing Approved',
          message: `Congratulations! Your listing "${p.title}" has been reviewed and APPROVED by the platform administration. It is now active on the public market.`,
          type: 'success'
        });
        return { ...p, status: 'active' as const };
      }
      return p;
    });
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated));
    return updated;
  },

  rejectProperty(propertyId: string): Property[] {
    const properties = this.getProperties();
    const target = properties.find(p => p.id === propertyId);
    if (target) {
      this.addNotification({
        userId: target.sellerId,
        title: 'Listing Update Needed',
        message: `Your listing "${target.title}" was declined by the platform administrator. Please review your photos and description accuracy before re-submitting.`,
        type: 'warning'
      });
    }
    const updated = properties.filter(p => p.id !== propertyId);
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated));
    return updated;
  },

  updatePropertyStatus(propertyId: string, status: 'active' | 'sold' | 'rented'): Property[] {
    const properties = this.getProperties();
    const updated = properties.map(p => {
      if (p.id === propertyId) {
        return { ...p, status };
      }
      return p;
    });
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- REVIEWS ---
  getReviews(propertyId?: string): Review[] {
    const data = localStorage.getItem(REVIEWS_KEY);
    const reviews: Review[] = data ? JSON.parse(data) : initialReviews;
    if (!data) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(initialReviews));
    }
    if (propertyId) {
      return reviews.filter(r => r.propertyId === propertyId);
    }
    return reviews;
  },

  addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...review,
      id: `rev-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newReview);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

    // Notify seller
    const properties = this.getProperties();
    const property = properties.find(p => p.id === review.propertyId);
    if (property) {
      this.addNotification({
        userId: property.sellerId,
        title: 'New Property Review',
        message: `${review.authorName} left a ${review.rating}-star review on "${property.title}": "${review.comment.substring(0, 45)}..."`,
        type: 'info'
      });
    }

    return newReview;
  },

  // --- VISITS ---
  getVisits(userId?: string, role?: 'buyer' | 'seller'): VisitRequest[] {
    const data = localStorage.getItem(VISITS_KEY);
    const visits: VisitRequest[] = data ? JSON.parse(data) : initialVisits;
    if (!data) {
      localStorage.setItem(VISITS_KEY, JSON.stringify(initialVisits));
    }
    
    if (userId && role) {
      if (role === 'buyer') {
        return visits.filter(v => v.buyerId === userId);
      } else {
        return visits.filter(v => v.sellerId === userId);
      }
    }
    return visits;
  },

  addVisitRequest(visit: Omit<VisitRequest, 'id' | 'createdAt' | 'status'>): VisitRequest {
    const visits = this.getVisits();
    const newVisit: VisitRequest = {
      ...visit,
      id: `visit-${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    visits.unshift(newVisit);
    localStorage.setItem(VISITS_KEY, JSON.stringify(visits));

    // Notify seller
    this.addNotification({
      userId: visit.sellerId,
      title: 'New Tour Request',
      message: `${visit.buyerName} requested a ${visit.type} tour for "${visit.propertyTitle}" on ${visit.date} at ${visit.time}.`,
      type: 'inquiry'
    });

    return newVisit;
  },

  updateVisitStatus(visitId: string, status: 'approved' | 'rejected' | 'completed'): VisitRequest[] {
    const visits = this.getVisits();
    const updated = visits.map(v => {
      if (v.id === visitId) {
        // Notify buyer of status update
        const statusMap = {
          approved: { title: 'Tour Approved! 🎉', type: 'success' as const, text: 'has been approved' },
          rejected: { title: 'Tour Invitation Update', type: 'warning' as const, text: 'has been declined' },
          completed: { title: 'Tour Completed 🏡', type: 'info' as const, text: 'has been marked as completed. Please leave a review!' }
        };
        
        this.addNotification({
          userId: v.buyerId,
          title: statusMap[status].title,
          message: `Your tour request for "${v.propertyTitle}" on ${v.date} ${statusMap[status].text} by the agent.`,
          type: statusMap[status].type
        });

        return { ...v, status };
      }
      return v;
    });
    localStorage.setItem(VISITS_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- NOTIFICATIONS ---
  getNotifications(userId: string): Notification[] {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifs: Notification[] = data ? JSON.parse(data) : initialNotifications;
    if (!data) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initialNotifications));
    }
    return notifs.filter(n => n.userId === userId || n.userId === 'all');
  },

  addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifs: Notification[] = data ? JSON.parse(data) : initialNotifications;
    
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Math.random().toString(36).substring(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    return newNotif;
  },

  markNotificationsAsRead(userId: string): void {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifs: Notification[] = data ? JSON.parse(data) : initialNotifications;
    const updated = notifs.map(n => n.userId === userId ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  // --- MESSAGES ---
  getMessages(chatId: string): Message[] {
    const data = localStorage.getItem(MESSAGES_KEY);
    const msgs: Message[] = data ? JSON.parse(data) : initialMessages;
    if (!data) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialMessages));
    }
    return msgs.filter(m => m.chatId === chatId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  addMessage(msg: Omit<Message, 'id' | 'createdAt'>): Message {
    const data = localStorage.getItem(MESSAGES_KEY);
    const msgs: Message[] = data ? JSON.parse(data) : initialMessages;
    
    const newMsg: Message = {
      ...msg,
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    msgs.push(newMsg);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
    return newMsg;
  },

  getChatsForUser(userId: string, role: 'buyer' | 'seller'): ChatSession[] {
    const properties = this.getProperties();
    const data = localStorage.getItem(MESSAGES_KEY);
    const msgs: Message[] = data ? JSON.parse(data) : initialMessages;
    
    // Group by chatId
    const uniqueChatIds = Array.from(new Set(msgs.map(m => m.chatId)));
    const sessions: ChatSession[] = [];
    
    for (const chatId of uniqueChatIds) {
      const chatMsgs = msgs.filter(m => m.chatId === chatId);
      if (chatMsgs.length === 0) continue;
      
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      
      // Parse details from chatId format: "chat-prop-1-user-buyer-1" or custom
      const parts = chatId.split('-');
      // Expected parts: "chat", "prop", "propId", "user", "buyerId"
      const propId = parts.length >= 3 ? `${parts[1]}-${parts[2]}` : 'prop-1';
      const buyerId = parts.length >= 5 ? `${parts[3]}-${parts[4]}` : 'user-buyer-1';
      
      const prop = properties.find(p => p.id === propId);
      if (!prop) continue;
      
      // Filter sessions relevant to the requested user and role
      if (role === 'buyer' && buyerId !== userId) continue;
      if (role === 'seller' && prop.sellerId !== userId) continue;
      
      sessions.push({
        id: chatId,
        propertyId: propId,
        propertyTitle: prop.title,
        buyerId,
        buyerName: chatMsgs.find(m => m.senderRole === 'buyer')?.senderName || 'Anonymous Buyer',
        sellerId: prop.sellerId,
        sellerName: prop.sellerName,
        lastMessageText: lastMsg.text,
        lastMessageTime: lastMsg.createdAt
      });
    }
    
    return sessions.sort((a,b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }
};
