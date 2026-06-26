import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, Notification } from '../types';
import { dbService } from '../data/mockData';
import { authService } from '../lib/firebase';
import { 
  Building2, 
  Bell, 
  User, 
  LogOut, 
  ShieldAlert, 
  Store, 
  CircleUser, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquareCode
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  openChatDrawer: () => void;
  refreshTrigger: number;
  openAuthModal?: (mode: 'signin' | 'signup') => void;
}

export default function Navbar({ currentUser, onUserChange, openChatDrawer, refreshTrigger, openAuthModal }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    if (currentUser) {
      const notifs = dbService.getNotifications(currentUser.id);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser, refreshTrigger]);

  const handleRoleSwitch = (role: UserRole) => {
    const updatedUser = authService.switchRole(role);
    onUserChange(updatedUser);
    setShowRoleSwitcher(false);
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    await authService.signOut();
    onUserChange(null);
    setShowRoleSwitcher(false);
    setShowNotifications(false);
  };

  const handleMarkNotificationsRead = () => {
    if (currentUser) {
      dbService.markNotificationsAsRead(currentUser.id);
      // Trigger update
      const notifs = dbService.getNotifications(currentUser.id);
      setNotifications(notifs);
      setUnreadCount(0);
    }
  };

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'inquiry':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-gray-900 leading-none">Real Estate</h1>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">PLATFORM PORTAL</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-4">
          
          {/* AI CHAT SHORTCUT */}
          {currentUser && currentUser.role === 'buyer' && (
            <button 
              onClick={openChatDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors"
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>AI Agent Chat</span>
            </button>
          )}

          {/* DYNAMIC ROLE INDICATOR / SWITCHER */}
          {currentUser && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowRoleSwitcher(!showRoleSwitcher);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  currentUser.role === 'admin' 
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50' 
                    : currentUser.role === 'seller' 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50'
                }`}
              >
                {currentUser.role === 'admin' && <ShieldAlert className="w-3.5 h-3.5" />}
                {currentUser.role === 'seller' && <Store className="w-3.5 h-3.5" />}
                {currentUser.role === 'buyer' && <CircleUser className="w-3.5 h-3.5" />}
                
                <span className="capitalize">{currentUser.role} View</span>
                <span className="text-[9px] opacity-60 px-1 rounded bg-black/5">Switch</span>
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <p className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Simulate Role</p>
                  
                  <button 
                    onClick={() => handleRoleSwitch('buyer')}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      currentUser.role === 'buyer' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CircleUser className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-xs leading-none">Buyer Account</p>
                      <p className="text-[9px] text-gray-400">Search & request visits</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleRoleSwitch('seller')}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      currentUser.role === 'seller' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="font-semibold text-xs leading-none">Seller Account</p>
                      <p className="text-[9px] text-gray-400">List and manage inquiries</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleRoleSwitch('admin')}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      currentUser.role === 'admin' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <div>
                      <p className="font-semibold text-xs leading-none">Admin Monitor</p>
                      <p className="text-[9px] text-gray-400">Approve properties & stats</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATION BELL */}
          {currentUser && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowRoleSwitcher(false);
                  if (!showNotifications) {
                    handleMarkNotificationsRead();
                  }
                }}
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 px-4 py-2.5">
                    <p className="text-xs font-bold text-gray-900">Notifications</p>
                    <span className="text-[10px] text-gray-400 font-medium">{notifications.length} total</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="mx-auto w-8 h-8 text-slate-200 mb-1" />
                        <p className="text-xs text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 transition-colors ${notif.read ? 'bg-white' : 'bg-blue-50/20'}`}
                        >
                          <div className="flex gap-2.5">
                            <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-gray-800 leading-tight">{notif.title}</p>
                              <p className="text-[11px] text-gray-500 leading-normal">{notif.message}</p>
                              <p className="text-[9px] text-gray-400">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USER PROFILE INFO & LOGOUT */}
          {currentUser ? (
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-gray-900 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{currentUser.email}</p>
              </div>
              
              <img 
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-gray-100 object-cover"
              />

              <button 
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuthModal?.('signin')}
                className="text-xs font-bold text-gray-700 hover:text-indigo-600 transition-all py-1.5 px-3 rounded-lg hover:bg-gray-50 border border-transparent cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal?.('signup')}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all py-1.5 px-3.5 rounded-lg shadow-xs hover:shadow-md cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
