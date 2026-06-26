/**
 * Types and interfaces for the Real Estate Platform
 */

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  phone?: string;
  companyName?: string;
  createdAt: string;
}

export type PropertyType = 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Penthouse';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  status: 'pending_approval' | 'active' | 'sold' | 'rented';
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  yearBuilt: number;
  featured: boolean;
  amenities: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  propertyTitle: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
}

export interface VisitRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImageUrl: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  date: string;
  time: string;
  type: 'virtual' | 'in-person';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'inquiry';
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string; // usually propertyId or propertyId + buyerId
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller' | 'ai';
  text: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessageText: string;
  lastMessageTime: string;
}
