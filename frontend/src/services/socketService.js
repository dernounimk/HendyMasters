// frontend/src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.initialized = false;
    this.currentToken = null;
    this.pendingEvents = [];
    this.reconnectTimer = null;
    this.eventCallbacks = new Map();
  }

  initialize(token) {
    if (!token) {
      console.log('No token provided, skipping socket initialization');
      return false;
    }

    if (this.initialized && this.socket && this.isConnected) {
      console.log('Socket already initialized and connected');
      return true;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.currentToken = token;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    console.log('Initializing socket connection to:', socketUrl);
    
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      autoConnect: true
    });

    this._setupEventHandlers();
    
    return true;
  }

  _setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.initialized = true;
      
      this._flushPendingEvents();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        setTimeout(() => {
          if (this.currentToken && !this.isConnected) {
            console.log('Attempting manual reconnection...');
            this.initialize(this.currentToken);
          }
        }, 3000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
        }
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed permanently');
    });

    // ✅ إعادة تطبيق المستمعين المحفوظين
    this.socket.on('connect', () => {
      this.eventCallbacks.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          if (this.socket && !this.socket.hasListeners(event)) {
            this.socket.on(event, callback);
          }
        });
      });
    });

    // ✅ استلام الإشعارات الجديدة
    this.socket.on('notification:new', (notification) => {
      console.log('📢 New notification received:', notification);
      const callbacks = this.eventCallbacks.get('notification:new') || [];
      callbacks.forEach(callback => callback(notification));
    });

    // ✅ استلام الرسائل الجديدة
    this.socket.on('message:new', (data) => {
      console.log('💬 New message received');
      const callbacks = this.eventCallbacks.get('message:new') || [];
      callbacks.forEach(callback => callback(data));
    });

    // ✅ تحديث حالة القراءة
    this.socket.on('messages:read', (data) => {
      console.log('📖 Messages marked as read');
      const callbacks = this.eventCallbacks.get('messages:read') || [];
      callbacks.forEach(callback => callback(data));
    });

    // ✅ إشعارات الكتابة
    this.socket.on('typing:start', (data) => {
      const callbacks = this.eventCallbacks.get('typing:start') || [];
      callbacks.forEach(callback => callback(data));
    });

    this.socket.on('typing:stop', (data) => {
      const callbacks = this.eventCallbacks.get('typing:stop') || [];
      callbacks.forEach(callback => callback(data));
    });

    // ✅ تحديث حالة المستخدمين
    this.socket.on('users:online', (users) => {
      const callbacks = this.eventCallbacks.get('users:online') || [];
      callbacks.forEach(callback => callback(users));
    });
  }

  _flushPendingEvents() {
    if (this.pendingEvents.length > 0 && this.isConnected) {
      console.log(`Flushing ${this.pendingEvents.length} pending events`);
      const events = [...this.pendingEvents];
      this.pendingEvents = [];
      
      events.forEach(({ event, data, callback }) => {
        this.emit(event, data, callback);
      });
    }
  }

  on(event, callback) {
    if (!event || typeof callback !== 'function') return;
    
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    
    this.eventCallbacks.get(event).add(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (!event) return;
    
    if (callback && this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).delete(callback);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else if (!callback) {
      this.eventCallbacks.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  emit(event, data, callback) {
    if (!this.socket) {
      console.warn(`Socket not initialized, cannot emit ${event}`);
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: 'Socket not initialized' });
      }
      return false;
    }
    
    if (this.isConnected) {
      if (callback && typeof callback === 'function') {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
      return true;
    } else {
      console.warn(`Socket not connected, queuing event: ${event}`);
      this.pendingEvents.push({ event, data, callback });
      return false;
    }
  }

  // ✅ دالة للحصول على المستخدمين المسموح بالتواصل معهم
  getAllowedRecipients() {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve([]);
        return;
      }

      this.socket.emit('messaging:allowed-recipients', {}, (response) => {
        if (response?.success) {
          resolve(response.data);
        } else {
          resolve([]);
        }
      });

      setTimeout(() => {
        resolve([]);
      }, 5000);
    });
  }

  // ✅ دالة للتحقق من صلاحية المراسلة
  checkMessagingPermission(userId) {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve({ allowed: false, reason: 'غير متصل بالخادم' });
        return;
      }

      this.socket.emit('messaging:check', { userId }, (response) => {
        if (response?.allowed !== undefined) {
          resolve(response);
        } else {
          resolve({ allowed: false, reason: 'فشل التحقق' });
        }
      });

      setTimeout(() => {
        resolve({ allowed: false, reason: 'انتهت مهلة الاتصال' });
      }, 10000);
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.initialized = false;
    this.currentToken = null;
    this.eventCallbacks.clear();
    this.pendingEvents = [];
    this.reconnectAttempts = 0;
    
    console.log('Socket disconnected and cleaned up');
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  isInitialized() {
    return this.initialized;
  }
}

export default new SocketService();