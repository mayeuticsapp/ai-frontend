import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { MessageCircle, Bot, Settings, Plus, Play, Users } from 'lucide-react'
import './App.css'

// Components
import ProvidersManager from './components/ProvidersManager'
import PersonalitiesManager from './components/PersonalitiesManager'
import ConversationViewer from './components/ConversationViewer'
import ConversationsList from './components/ConversationsList'

function App() {
  const [personalities, setPersonalities] = useState([]);
  const [providers, setProviders] = useState([]);

  const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

  useEffect(() => {
    if (!BACKEND_URL) {
      console.error("VITE_APP_BACKEND_URL is not defined. Please check your .env file.");
      return;
    }
    fetchPersonalities();
    fetchProviders();
  }, [BACKEND_URL]);

  const fetchPersonalities = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/personalities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPersonalities(data);
    } catch (error) {
      console.error("Error fetching personalities:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/providers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };
  const [activeTab, setActiveTab] = useState('conversations')
  const [providers, setProviders] = useState([])
  const [personalities, setPersonalities] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [loading, setLoading] = useState(true)

  // API base URL
  const API_BASE = '/api'

  // Fetch initial data
  useEffect(() => {
    fetchProviders()
    fetchPersonalities()
    fetchConversations()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch(`${API_BASE}/providers`)
      const data = await response.json()
      if (data.success) {
        setProviders(data.providers)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  const fetchPersonalities = async () => {
    try {
      const response = await fetch(`${API_BASE}/personalities`)
      const data = await response.json()
      if (data.success) {
        setPersonalities(data.personalities)
      }
    } catch (error) {
      console.error('Error fetching personalities:', error)
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE}/conversations`)
      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setLoading(false)
    }
  }

  const createNewConversation = async (title, topic, participantIds) => {
    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          topic,
          participants: participantIds
        })
      })
      const data = await response.json()
      if (data.success) {
        await fetchConversations()
        setSelectedConversation(data.conversation.id)
        setActiveTab('conversations')
        return data.conversation
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading AI Chat Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Chat Platform</h1>
          </div>
          <p className="text-gray-600">Gestisci provider AI, personalità e conversazioni tra intelligenze artificiali</p>
          
          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              {providers.length} Provider{providers.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {personalities.length} Personalit{personalities.length !== 1 ? 'à' : 'à'}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {conversations.length} Conversazion{conversations.length !== 1 ? 'i' : 'e'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversazioni
            </TabsTrigger>
            <TabsTrigger value="personalities" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personalità
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="new-chat" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuova Chat
            </TabsTrigger>
          </TabsList>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversations List */}
              <div className="lg:col-span-1">
                <ConversationsList 
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={setSelectedConversation}
                  onRefresh={fetchConversations}
                />
              </div>
              
              {/* Conversation Viewer */}
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <ConversationViewer 
                    conversationId={selectedConversation}
                    personalities={personalities}
                    onRefresh={fetchConversations}
                  />
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Seleziona una conversazione per visualizzarla</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Personalities Tab */}
          <TabsContent value="personalities">
            <PersonalitiesManager 
              personalities={personalities}
              providers={providers}
              onRefresh={fetchPersonalities}
            />
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers">
            <ProvidersManager 
              providers={providers}
              onRefresh={fetchProviders}
            />
          </TabsContent>

          {/* New Chat Tab */}
          <TabsContent value="new-chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Crea Nuova Conversazione
                </CardTitle>
                <CardDescription>
                  Avvia una nuova conversazione tra AI selezionando le personalità partecipanti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewConversationForm 
                  personalities={personalities}
                  onCreateConversation={createNewConversation}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// New Conversation Form Component
function NewConversationForm({ personalities, onCreateConversation }) {
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [selectedPersonalities, setSelectedPersonalities] = useState([])
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (title && selectedPersonalities.length >= 2) {
      setCreating(true)
      await onCreateConversation(title, topic, selectedPersonalities)
      setTitle('')
      setTopic('')
      setSelectedPersonalities([])
      setCreating(false)
    }
  }

  const togglePersonality = (personalityId) => {
    setSelectedPersonalities(prev => 
      prev.includes(personalityId) 
        ? prev.filter(id => id !== personalityId)
        : [...prev, personalityId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Titolo Conversazione</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="es. Discussione su TouristIQ"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Argomento (opzionale)</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Descrivi l'argomento della conversazione..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Seleziona Personalità (minimo 2)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {personalities.map(personality => (
            <div
              key={personality.id}
              onClick={() => togglePersonality(personality.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPersonalities.includes(personality.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: personality.color_theme }}
                />
                <div>
                  <h4 className="font-medium">{personality.display_name}</h4>
                  <p className="text-sm text-gray-600">{personality.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {personalities.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Nessuna personalità disponibile. Creane una nella sezione Personalità.
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={!title || selectedPersonalities.length < 2 || creating}
        className="w-full"
      >
        {creating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Creazione in corso...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Avvia Conversazione
          </>
        )}
      </Button>
    </form>
  )
}

export default App

