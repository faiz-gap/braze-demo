import React from 'react';

const ChatIcon = () => <svg className="w-5 h-5" stroke="currentColor" fill="none" viewBox="0 0 20 20" strokeWidth="2"><path d="M18 4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1l3 3v-3h9a2 2 0 0 0 2-2V4z" /></svg>;

const ChatButton = () => {
  return (
    <button className="fixed bottom-6 right-6 bg-brand-green text-white px-6 py-4 rounded-4xl 
                     border-none cursor-pointer flex items-center gap-2 text-base font-medium 
                     shadow-chat-button hover:bg-brand-green-darker hover:-translate-y-0.5 hover:shadow-chat-button-hover 
                     transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-opacity-50">
      <ChatIcon />
      <span>Chat with us</span>
    </button>
  );
};

export default ChatButton;