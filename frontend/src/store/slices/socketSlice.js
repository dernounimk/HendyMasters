// store/slices/socketSlice.js
export const createSocketSlice = (set, get) => ({
  // Socket state
  socket: null,
  isConnected: false,
  onlineUsers: [],
  
  // Connect to socket
  connectSocket: () => {
    // ستضيف منطق الاتصال بالسوكيت لاحقاً
    console.log('Socket connection will be implemented later');
    set({ isConnected: true });
  },
  
  // Disconnect socket
  disconnectSocket: () => {
    set({ 
      socket: null,
      isConnected: false,
      onlineUsers: []
    });
  },
  
  // Set online users
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  // Join chat room
  joinChatRoom: (chatId) => {
    // منطق الانضمام للغرفة
    console.log('Joining chat room:', chatId);
  },
  
  // Leave chat room
  leaveChatRoom: (chatId) => {
    console.log('Leaving chat room:', chatId);
  },
  
  // Send message
  sendMessage: (message) => {
    console.log('Sending message:', message);
  }
});