import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { MessageCircle, Trash2, RotateCcw, Clock, Users } from 'lucide-react'

function ConversationsList({ conversations, selectedConversation, onSelectConversation, onRefresh }) {
  const [deleting, setDeleting] = useState(null)

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation()
    if (confirm('Sei sicuro di voler eliminare questa conversazione?')) {
      setDeleting(conversationId)
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          onRefresh()
          if (selectedConversation === conversationId) {
            onSelectConversation(null)
          }
        } else {
          alert(`Errore: ${data.error}`)
        }
      } catch (error) {
        alert(`Errore: ${error.message}`)
      }
      setDeleting(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return 'Oggi'
    } else if (diffDays === 2) {
      return 'Ieri'
    } else if (diffDays <= 7) {
      return `${diffDays - 1} giorni fa`
    } else {
      return date.toLocaleDateString('it-IT')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Attiva'
      case 'paused': return 'In pausa'
      case 'completed': return 'Completata'
      default: return 'Sconosciuto'
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversazioni
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {conversations.length} conversazion{conversations.length !== 1 ? 'i' : 'e'} totali
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8 px-4">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessuna conversazione ancora</p>
              <p className="text-xs text-gray-400 mt-1">
                Crea una nuova conversazione per iniziare
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {conversations.map(conversation => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversation === conversation.id}
                  onSelect={() => onSelectConversation(conversation.id)}
                  onDelete={(e) => handleDeleteConversation(conversation.id, e)}
                  isDeleting={deleting === conversation.id}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Conversation Item Component
function ConversationItem({ 
  conversation, 
  isSelected, 
  onSelect, 
  onDelete, 
  isDeleting,
  formatDate,
  getStatusColor,
  getStatusText
}) {
  const participantIds = conversation.participants ? JSON.parse(conversation.participants) : []
  
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm line-clamp-1 flex-1 mr-2">
          {conversation.title}
        </h4>
        <div className="flex items-center gap-1">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getStatusColor(conversation.status)}`}
          >
            {getStatusText(conversation.status)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {conversation.topic && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {conversation.topic}
        </p>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {participantIds.length}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {conversation.message_count || 0}
          </span>
        </div>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(conversation.updated_at)}
        </span>
      </div>
    </div>
  )
}

export default ConversationsList

