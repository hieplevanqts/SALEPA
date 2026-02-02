import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { MessageSquare, Send, Clock, User, ShoppingBag } from 'lucide-react';
import type { SelfServiceOrder } from '../../../../lib/fashion-shop-lib/store';

interface MessageInboxProps {
  onOrderClick: (order: SelfServiceOrder) => void;
}

export function MessageInbox({ onOrderClick }: MessageInboxProps) {
  const { selfServiceOrders, addMessageToOrder } = useStore();
  const { t } = useTranslation();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Get orders with messages, sorted by latest message
  const ordersWithMessages = selfServiceOrders
    .filter(order => order.messages && order.messages.length > 0)
    .sort((a, b) => {
      const aLastMsg = a.messages?.[a.messages.length - 1];
      const bLastMsg = b.messages?.[b.messages.length - 1];
      if (!aLastMsg || !bLastMsg) return 0;
      return new Date(bLastMsg.timestamp).getTime() - new Date(aLastMsg.timestamp).getTime();
    });

  const selectedOrder = selectedOrderId 
    ? ordersWithMessages.find(o => o.id === selectedOrderId) 
    : null;

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedOrder?.messages]);

  const handleSendReply = () => {
    if (!selectedOrderId || !replyText.trim()) return;

    addMessageToOrder(selectedOrderId, {
      id: Date.now().toString(),
      sender: 'staff',
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
    });

    setReplyText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const getLastMessage = (order: SelfServiceOrder) => {
    if (!order.messages || order.messages.length === 0) return null;
    return order.messages[order.messages.length - 1];
  };

  const hasUnreadMessages = (order: SelfServiceOrder) => {
    const lastMsg = getLastMessage(order);
    return lastMsg?.sender === 'customer';
  };

  const getUnreadCount = (order: SelfServiceOrder) => {
    if (!order.messages) return 0;
    let count = 0;
    for (let i = order.messages.length - 1; i >= 0; i--) {
      if (order.messages[i].sender === 'customer') {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  return (
    <div className="w-96 bg-white border-l-2 border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 border-b-2 border-blue-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{t('messages') || 'Messages'}</h2>
            <p className="text-xs text-blue-100">
              {ordersWithMessages.length} {t('conversations') || 'conversations'}
            </p>
          </div>
        </div>
        {ordersWithMessages.filter(o => hasUnreadMessages(o)).length > 0 && (
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-xs font-medium">
            {ordersWithMessages.filter(o => hasUnreadMessages(o)).length} {t('unreadConversations') || 'unread'}
          </div>
        )}
      </div>

      {/* Content */}
      {ordersWithMessages.length === 0 ? (
        null
      ) : !selectedOrderId ? (
        /* Message List */
        <div className="flex-1 overflow-y-auto">
          {ordersWithMessages.map((order) => {
            const lastMsg = getLastMessage(order);
            const isUnread = hasUnreadMessages(order);
            const unreadCount = getUnreadCount(order);

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`p-4 border-b border-gray-200 cursor-pointer transition-all hover:bg-gray-50 ${
                  isUnread ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isUnread ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      #{order.id.slice(-4)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {order.customerName || t('customer')}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        {order.tableName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {lastMsg && new Date(lastMsg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {unreadCount > 0 && (
                      <div className="mt-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>

                <p className={`text-sm ${isUnread ? 'text-blue-900 font-medium' : 'text-gray-600'} line-clamp-2`}>
                  {lastMsg?.sender === 'customer' ? '👤 ' : '👨‍💼 '}
                  {lastMsg?.text}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrderClick(order);
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('viewOrder')} →
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Chat View */
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ←
                </button>
                <div>
                  <div className="font-semibold text-sm">
                    {selectedOrder?.customerName || t('customer')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('order')} #{selectedOrder?.id.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => selectedOrder && onOrderClick(selectedOrder)}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
              >
                {t('viewOrder')}
              </button>
            </div>

            {/* Order Summary */}
            <div className="mt-2 bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{selectedOrder?.tableName}</span>
                <span className="font-bold text-green-600">
                  {selectedOrder?.total.toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {selectedOrder?.messages?.map((message) => {
              const isStaff = message.sender === 'staff';
              return (
                <div
                  key={message.id}
                  className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      isStaff
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div
                      className={`text-xs mt-1 ${
                        isStaff ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {/* Reply Input */}
          <div className="bg-white border-t-2 border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('typeMessage')}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('pressEnterToSend') || 'Press Enter to send'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}