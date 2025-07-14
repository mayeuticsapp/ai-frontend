import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Plus, Settings, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react'

function ProvidersManager({ providers, onRefresh }) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [testing, setTesting] = useState(null)

  const handleAddProvider = async (providerData) => {
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerData)
      })
      const data = await response.json()
      if (data.success) {
        onRefresh()
        setShowAddDialog(false)
      } else {
        alert(`Errore: ${data.error}`)
      }
    } catch (error) {
      alert(`Errore: ${error.message}`)
    }
  }

  const handleTestProvider = async (providerId) => {
    setTesting(providerId)
    try {
      const response = await fetch(`/api/providers/${providerId}/test`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        alert(`Test riuscito! Risposta: ${data.response}`)
      } else {
        alert(`Test fallito: ${data.error}`)
      }
    } catch (error) {
      alert(`Errore nel test: ${error.message}`)
    }
    setTesting(null)
  }

  const handleDeleteProvider = async (providerId) => {
    if (confirm('Sei sicuro di voler eliminare questo provider?')) {
      try {
        const response = await fetch(`/api/providers/${providerId}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          onRefresh()
        } else {
          alert(`Errore: ${data.error}`)
        }
      } catch (error) {
        alert(`Errore: ${error.message}`)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Provider AI</h2>
          <p className="text-gray-600">Gestisci i provider di intelligenza artificiale</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuovo Provider AI</DialogTitle>
              <DialogDescription>
                Aggiungi un nuovo provider di intelligenza artificiale
              </DialogDescription>
            </DialogHeader>
            <ProviderForm onSubmit={handleAddProvider} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(provider => (
          <Card key={provider.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {provider.name}
                    {provider.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Attivo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inattivo
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {provider.api_type.toUpperCase()} • {provider.default_model}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestProvider(provider.id)}
                    disabled={testing === provider.id}
                  >
                    {testing === provider.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProvider(provider)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProvider(provider.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Tokens:</span>
                  <span>{provider.max_tokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span>{provider.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Personalità:</span>
                  <span>{provider.personalities_count}</span>
                </div>
                {provider.api_base_url && (
                  <div className="text-xs text-gray-500 truncate">
                    URL: {provider.api_base_url}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun provider configurato</h3>
            <p className="text-gray-600 mb-4">Aggiungi il tuo primo provider AI per iniziare</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Provider
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Provider Dialog */}
      {editingProvider && (
        <Dialog open={!!editingProvider} onOpenChange={() => setEditingProvider(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifica Provider</DialogTitle>
              <DialogDescription>
                Modifica le impostazioni del provider {editingProvider.name}
              </DialogDescription>
            </DialogHeader>
            <ProviderForm 
              provider={editingProvider}
              onSubmit={async (data) => {
                try {
                  const response = await fetch(`/api/providers/${editingProvider.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                  })
                  const result = await response.json()
                  if (result.success) {
                    onRefresh()
                    setEditingProvider(null)
                  } else {
                    alert(`Errore: ${result.error}`)
                  }
                } catch (error) {
                  alert(`Errore: ${error.message}`)
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Provider Form Component
function ProviderForm({ provider, onSubmit }) {
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    api_type: provider?.api_type || 'openai',
    api_base_url: provider?.api_base_url || '',
    api_key: provider?.api_key || '',
    default_model: provider?.default_model || 'gpt-4',
    max_tokens: provider?.max_tokens || 1000,
    temperature: provider?.temperature || 0.7
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const apiTypes = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'google', label: 'Google (Gemini)' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome Provider</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="es. OpenAI GPT-4"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tipo API</label>
        <select
          value={formData.api_type}
          onChange={(e) => setFormData({...formData, api_type: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {apiTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">API Key</label>
        <input
          type="password"
          value={formData.api_key}
          onChange={(e) => setFormData({...formData, api_key: e.target.value})}
          placeholder="Inserisci la tua API key"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Modello Predefinito</label>
        <input
          type="text"
          value={formData.default_model}
          onChange={(e) => setFormData({...formData, default_model: e.target.value})}
          placeholder="es. gpt-4, claude-3-sonnet-20240229"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL Base API (opzionale)</label>
        <input
          type="url"
          value={formData.api_base_url}
          onChange={(e) => setFormData({...formData, api_base_url: e.target.value})}
          placeholder="es. https://api.openai.com/v1"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Max Tokens</label>
          <input
            type="number"
            value={formData.max_tokens}
            onChange={(e) => setFormData({...formData, max_tokens: parseInt(e.target.value)})}
            min="1"
            max="4000"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Temperature</label>
          <input
            type="number"
            value={formData.temperature}
            onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
            min="0"
            max="2"
            step="0.1"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {provider ? 'Aggiorna Provider' : 'Crea Provider'}
      </Button>
    </form>
  )
}

export default ProvidersManager

