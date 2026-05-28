import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ShieldAlert, Sparkles, Send, User, CheckCircle2, Clock, Inbox } from 'lucide-react';

export default function MentorDashboard() {
  const { user, authenticatedFetch } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    // Set up polling to check for new inquiries
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPeer) {
      fetchMessages(selectedPeer._id);
    }
  }, [selectedPeer]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await authenticatedFetch('/messages/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async (peerId) => {
    setLoadingChat(true);
    try {
      const res = await authenticatedFetch(`/messages/thread/${peerId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load thread messages', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedPeer) return;

    setSubmitting(true);
    try {
      const res = await authenticatedFetch('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          peerId: selectedPeer._id,
          contentText: replyText
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, newMsg]);
        setReplyText('');
        fetchConversations(); // Update side panel last message
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      {!user?.isApprovedMentor && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-950">Awaiting Administrator Verification</h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Your expert account is registered, but not yet verified. Standard users will not see you in the advisor directory, and you cannot accept new inquiries until an admin approves your profile.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Expert Advisor Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {user?.name}
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Manage incoming text inquiries, submit startup advice, and monitor mentee milestones.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-1">
          {user?.skills.map(s => (
            <span key={s} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-xs font-semibold">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Main Workspace grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        {/* Left Side: Mentees / Inquiry Threads */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Inbox className="w-4 h-4 text-slate-500" />
              <span>Incoming Mentee Inquiries</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConv ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">Loading inbox...</div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => {
                const isSelected = selectedPeer?._id === conv.peer._id;
                return (
                  <button
                    key={conv.peer._id}
                    onClick={() => setSelectedPeer(conv.peer)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                      isSelected ? 'bg-primary-50/60 border-r-4 border-primary-500' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {conv.peer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {conv.peer.name}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate leading-relaxed">
                        {conv.lastMessage.contentText}
                      </p>
                      
                      {/* Matching skills badge */}
                      <div className="flex gap-1 mt-1.5 overflow-hidden">
                        {conv.peer.skills.map(s => (
                          <span key={s} className="px-1 py-0.2 bg-slate-100 text-slate-500 rounded text-[9px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-12 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-400">No active inquiries</p>
                <p className="text-[10px] text-slate-400">Student queries matching your expertise will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Window & Submission Box */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {selectedPeer ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {selectedPeer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {selectedPeer.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Student Account • {selectedPeer.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages Logs */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4">
                {loadingChat ? (
                  <div className="flex items-center justify-center h-full">
                    <Clock className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                ) : (
                  messages.map(msg => {
                    const isSelf = msg.senderType === 'mentor';
                    return (
                      <div key={msg._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3.5 rounded-xl text-xs leading-relaxed shadow-sm ${
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
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Text Area Form for sending advice */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
                <div className="relative rounded-lg shadow-sm border border-slate-300 focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500">
                  <textarea
                    rows={3}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="block w-full border-0 p-3 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none resize-none"
                    placeholder={`Compose your advice to ${selectedPeer.name}...`}
                  />
                  <div className="flex items-center justify-between p-2 bg-slate-50 border-t border-slate-100 rounded-b-lg">
                    <span className="text-[10px] text-slate-400 font-semibold px-2">
                      Submit clear, step-by-step guidance
                    </span>
                    <button
                      type="submit"
                      disabled={submitting || !replyText.trim()}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <span>Send Response</span>
                      <Send className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/20 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Inquiry Workspace</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Select an incoming student inquiry from the left list to review history and submit text responses.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
