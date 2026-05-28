import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, User, ChevronLeft, Inbox, Clock, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

export default function Chat() {
  const { peerId } = useParams();
  const navigate = useNavigate();
  const { user, authenticatedFetch } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [inputText, setInputText] = useState('');
  
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchInbox();
    // Poll for new inbox listings
    const inboxInterval = setInterval(fetchInbox, 10000);
    return () => clearInterval(inboxInterval);
  }, []);

  useEffect(() => {
    if (peerId) {
      fetchChatThread(peerId);
      // Poll for new messages in active thread
      const threadInterval = setInterval(() => fetchChatThread(peerId, true), 5000);
      return () => clearInterval(threadInterval);
    } else {
      setMessages([]);
      setActivePeer(null);
    }
  }, [peerId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchInbox = async () => {
    try {
      const res = await authenticatedFetch('/messages/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);

        // If no peerId is active but we have conversations, navigate to the first one automatically
        if (!peerId && data.length > 0) {
          navigate(`/chat/${data[0].peer._id}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInbox(false);
    }
  };

  const fetchChatThread = async (id, isBackground = false) => {
    if (!isBackground) setLoadingChat(true);
    try {
      // 1. Fetch messages
      const res = await authenticatedFetch(`/messages/thread/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        
        // 2. Resolve peer info
        if (data.length > 0) {
          const firstMsg = data[0];
          // Determine which user is the peer
          const peerObject = firstMsg.userId._id === user.id ? firstMsg.mentorId : firstMsg.userId;
          setActivePeer(peerObject);
        } else {
          // If thread is empty, fetch user info from server
          const userRes = await authenticatedFetch('/auth/me');
          // If we can't get it from thread, find peer details from conversations listing
          const found = conversations.find(c => c.peer._id === id);
          if (found) {
            setActivePeer(found.peer);
          } else {
            // Fetch verified mentors list to see if peer is a mentor
            const mentorsRes = await authenticatedFetch('/mentors');
            if (mentorsRes.ok) {
              const mentorsData = await mentorsRes.json();
              const foundMentor = mentorsData.find(m => m._id === id);
              if (foundMentor) {
                setActivePeer(foundMentor);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to query message logs.');
    } finally {
      if (!isBackground) setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !peerId) return;

    setSending(true);
    setErrorMsg('');
    try {
      const res = await authenticatedFetch('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          peerId,
          contentText: inputText
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        fetchInbox(); // Refresh sidebar timestamps
      } else {
        throw new Error('Message dispatch failed.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex overflow-hidden shadow-sm h-[600px]">
      
      {/* Inbox sidebar */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${peerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200/85 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-extrabold text-slate-800">Private Consultations</h2>
          <button
            onClick={() => { fetchInbox(); if (peerId) fetchChatThread(peerId); }}
            className="text-slate-400 hover:text-slate-700"
            title="Refresh Chats"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingInbox ? (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">Loading consultations...</div>
          ) : conversations.length > 0 ? (
            conversations.map(conv => {
              const isSelected = peerId === conv.peer._id;
              return (
                <button
                  key={conv.peer._id}
                  onClick={() => navigate(`/chat/${conv.peer._id}`)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                    isSelected ? 'bg-primary-50/60 border-r-4 border-primary-500' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                    {conv.peer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{conv.peer.name}</h4>
                      <span className="text-[8px] text-slate-400 font-medium">
                        {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate leading-relaxed">
                      {conv.lastMessage.contentText}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-400">No Consultation History</p>
              <p className="text-[10px] text-slate-400 max-w-[180px] mx-auto leading-relaxed">
                {user.role === 'mentor' 
                  ? 'Student queries will populate here once they initiate chats.' 
                  : 'Start a consultation from the startup pathway directory.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Message Room Panel */}
      <div className={`flex-1 flex flex-col overflow-hidden bg-slate-50/50 ${!peerId ? 'hidden md:flex' : 'flex'}`}>
        {peerId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200/80 bg-white flex items-center space-x-3">
              <button
                onClick={() => navigate('/chat')}
                className="md:hidden p-1 rounded hover:bg-slate-100 text-slate-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                {activePeer ? activePeer.name.substring(0, 2).toUpperCase() : '??'}
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  {activePeer ? activePeer.name : 'Resolving Profile...'}
                </h3>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                  {activePeer?.role === 'mentor' ? 'Verified Mentor' : 'Startup Scholar'}
                </p>
              </div>
            </div>

            {/* Error banners */}
            {errorMsg && (
              <div className="p-2.5 bg-red-50 border-b border-red-150 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                messages.map(msg => {
                  const isSelf = msg.senderType === (user.role === 'mentor' ? 'mentor' : 'user');
                  return (
                    <div key={msg._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3.5 rounded-xl text-xs leading-relaxed shadow-sm ${
                        isSelf 
                          ? 'bg-primary-600 text-white rounded-br-none' 
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                      }`}>
                        <p className="whitespace-pre-line">{msg.contentText}</p>
                        <span className={`block text-[9px] mt-1 text-right ${isSelf ? 'text-primary-100' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs italic font-medium">
                  Say hello! Start your conversation thread.
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex space-x-2">
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Clock className="w-10 h-10 text-slate-300 mb-2" />
            <h3 className="text-xs font-bold text-slate-700">No active thread</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Select a message log on the sidebar directory to open.</p>
          </div>
        )}
      </div>

    </div>
  );
}
