import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { MessageCircle, Send, Bot, User, Play, Pause, RotateCcw, Zap } from 'lucide-react'

function ConversationViewer({ conversationId, personalities, onRefresh }) {
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [userMessage, setUserMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [autoRounds, setAutoRounds] = useState(3)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (conversationId) {
      fetchConversation()
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      const data = await response.json()
      if (data.success) {
        setConversation(data.conversation)
        setMessages(data.messages)
        setParticipants(data.participants)
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
    setLoading(false)
  }

  const sendUserMessage = async () => {
    if (!userMessage.trim()) return
    
    setSending(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: userMessage,
          sender_type: 'user'
        })
      })
      const data = await response.json()
      if (data.success) {
        setUserMessage('')
        await fetchConversation()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
    setSending(false)
  }

  const sendAIMessage = async (personalityId, content) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality_id: personalityId,
          content: content,
          sender_type: 'ai'
        })
      })
      const data = await response.json()
      if (data.success) {
        await fetchConversation()
      }
    } catch (error) {
      console.error('Error sending AI message:', error)
    }
  }

  const startAutoConversation = async () => {
    setAutoMode(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/auto-continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rounds: autoRounds
        })
      })
      const data = await response.json()
      if (data.success) {
        await fetchConversation()
      }
    } catch (error) {
      console.error('Error starting auto conversation:', error)
    }
    setAutoMode(false)
  }

  const getPersonalityById = (id) => {
    return participants.find(p => p.id === id) || personalities.find(p => p.id === id)
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento conversazione...</p>
        </div>
      </Card>
    )
  }

  if (!conversation) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Conversazione non trovata</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {conversation.title}
            </CardTitle>
            <CardDescription>
              {conversation.topic && `${conversation.topic} • `}
              {participants.length} partecipanti • {messages.length} messaggi
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConversation}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={autoRounds}
                onChange={(e) => setAutoRounds(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={startAutoConversation}
                disabled={autoMode || participants.length < 2}
              >
                {autoMode ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                    Auto...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1" />
                    Auto
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Participants */}
        <div className="flex gap-2 mt-2">
          {participants.map(participant => (
            <Badge 
              key={participant.id}
              variant="secondary"
              className="flex items-center gap-1"
              style={{ 
                backgroundColor: `${participant.color_theme}20`,
                borderColor: participant.color_theme,
                color: participant.color_theme
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: participant.color_theme }}
              />
              {participant.display_name}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nessun messaggio ancora. Inizia la conversazione!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble 
                key={message.id}
                message={message}
                personality={getPersonalityById(message.personality_id)}
                isLast={index === messages.length - 1}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendUserMessage()}
              placeholder="Scrivi un messaggio per guidare la conversazione..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <Button 
              onClick={sendUserMessage}
              disabled={!userMessage.trim() || sending}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Quick AI Response Buttons */}
          {participants.length > 0 && (
            <div className="flex gap-2 mt-2">
              {participants.map(participant => (
                <Button
                  key={participant.id}
                  variant="outline"
                  size="sm"
                  onClick={() => sendAIMessage(participant.id, "Continua la conversazione basandoti sui messaggi precedenti.")}
                  className="text-xs"
                  style={{ borderColor: participant.color_theme }}
                >
                  <Bot className="h-3 w-3 mr-1" />
                  {participant.display_name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Message Bubble Component
function MessageBubble({ message, personality, isLast }) {
  const isUser = message.sender_type === 'user'
  const isAI = message.sender_type === 'ai'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Sender Info */}
        {!isUser && personality && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: personality.color_theme }}
            >
              {personality.display_name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {personality.display_name}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.created_at)}
            </span>
          </div>
        )}
        
        {/* Message Content */}
        <div 
          className={`px-4 py-2 rounded-lg ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : personality 
                ? 'border-2 bg-white'
                : 'bg-gray-100 text-gray-800'
          }`}
          style={
            !isUser && personality 
              ? { 
                  borderColor: personality.color_theme,
                  backgroundColor: `${personality.color_theme}08`
                }
              : {}
          }
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {/* User message timestamp */}
          {isUser && (
            <div className="text-xs text-blue-100 mt-1 text-right">
              {formatTimestamp(message.created_at)}
            </div>
          )}
          
          {/* AI metadata */}
          {isAI && message.metadata && (
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
              {message.metadata.model && (
                <span>Modello: {message.metadata.model}</span>
              )}
              {message.metadata.usage && message.metadata.usage.total_tokens && (
                <span className="ml-2">Token: {message.metadata.usage.total_tokens}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default ConversationViewer

