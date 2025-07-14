import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Plus, Users, Edit, Trash2, Bot, Palette, Sparkles } from 'lucide-react'

function PersonalitiesManager({ personalities, providers, onRefresh }) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPersonality, setEditingPersonality] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const handleAddPersonality = async (personalityData) => {
    try {
      const response = await fetch('/api/personalities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalityData)
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

  const handleCreateFromTemplate = async (templateName, providerId, customName) => {
    try {
      const response = await fetch('/api/personalities/from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_name: templateName,
          provider_id: providerId,
          custom_name: customName
        })
      })
      const data = await response.json()
      if (data.success) {
        onRefresh()
        setSelectedTemplate(null)
      } else {
        alert(`Errore: ${data.error}`)
      }
    } catch (error) {
      alert(`Errore: ${error.message}`)
    }
  }

  const handleDeletePersonality = async (personalityId) => {
    if (confirm('Sei sicuro di voler eliminare questa personalità?')) {
      try {
        const response = await fetch(`/api/personalities/${personalityId}`, {
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
          <h2 className="text-2xl font-bold">Personalità AI</h2>
          <p className="text-gray-600">Gestisci le personalità delle intelligenze artificiali</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Da Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crea da Template</DialogTitle>
                <DialogDescription>
                  Scegli un template predefinito per creare rapidamente una personalità
                </DialogDescription>
              </DialogHeader>
              <TemplateSelector 
                providers={providers}
                onCreateFromTemplate={handleCreateFromTemplate}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuova Personalità
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuova Personalità AI</DialogTitle>
                <DialogDescription>
                  Crea una nuova personalità AI personalizzata
                </DialogDescription>
              </DialogHeader>
              <PersonalityForm 
                providers={providers}
                onSubmit={handleAddPersonality} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Personalities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalities.map(personality => (
          <Card key={personality.id} className="relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: personality.color_theme }}
            />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: personality.color_theme }}
                  >
                    {personality.display_name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{personality.display_name}</CardTitle>
                    <CardDescription className="text-sm">
                      {personality.provider_name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPersonality(personality)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePersonality(personality.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personality.description && (
                  <p className="text-sm text-gray-600">{personality.description}</p>
                )}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">PROMPT DI SISTEMA</h4>
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {personality.system_prompt}
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>ID: {personality.name}</span>
                  <Badge 
                    variant={personality.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {personality.is_active ? 'Attiva' : 'Inattiva'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {personalities.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna personalità configurata</h3>
            <p className="text-gray-600 mb-4">Crea la tua prima personalità AI per iniziare le conversazioni</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setSelectedTemplate(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Da Template
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crea Personalità
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Personality Dialog */}
      {editingPersonality && (
        <Dialog open={!!editingPersonality} onOpenChange={() => setEditingPersonality(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifica Personalità</DialogTitle>
              <DialogDescription>
                Modifica le impostazioni di {editingPersonality.display_name}
              </DialogDescription>
            </DialogHeader>
            <PersonalityForm 
              personality={editingPersonality}
              providers={providers}
              onSubmit={async (data) => {
                try {
                  const response = await fetch(`/api/personalities/${editingPersonality.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                  })
                  const result = await response.json()
                  if (result.success) {
                    onRefresh()
                    setEditingPersonality(null)
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

// Template Selector Component
function TemplateSelector({ providers, onCreateFromTemplate }) {
  const [templates, setTemplates] = useState({})
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [customName, setCustomName] = useState('')
  const [loading, setLoading] = useState(true)

  useState(() => {
    fetch('/api/personality-templates')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemplates(data.templates)
        }
        setLoading(false)
      })
  }, [])

  const handleCreate = () => {
    if (selectedTemplate && selectedProvider) {
      onCreateFromTemplate(selectedTemplate, parseInt(selectedProvider), customName || undefined)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Caricamento template...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Seleziona Template</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(templates).map(([key, template]) => (
            <div
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: template.color_theme }}
                >
                  {template.display_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium">{template.display_name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona un provider</option>
              {providers.filter(p => p.is_active).map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} ({provider.api_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nome Personalizzato (opzionale)</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={`Lascia vuoto per usare "${selectedTemplate}"`}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button 
            onClick={handleCreate}
            disabled={!selectedTemplate || !selectedProvider}
            className="w-full"
          >
            Crea da Template
          </Button>
        </>
      )}
    </div>
  )
}

// Personality Form Component
function PersonalityForm({ personality, providers, onSubmit }) {
  const [formData, setFormData] = useState({
    name: personality?.name || '',
    display_name: personality?.display_name || '',
    system_prompt: personality?.system_prompt || '',
    description: personality?.description || '',
    color_theme: personality?.color_theme || '#3B82F6',
    provider_id: personality?.provider_id || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome ID</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="es. geppo, manus"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nome Visualizzato</label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            placeholder="es. Geppo, Manus"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Provider</label>
        <select
          value={formData.provider_id}
          onChange={(e) => setFormData({...formData, provider_id: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Seleziona un provider</option>
          {providers.filter(p => p.is_active).map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name} ({provider.api_type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrizione</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Breve descrizione della personalità"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Colore Tema</label>
        <div className="flex gap-2 mb-2">
          {colors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({...formData, color_theme: color})}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color_theme === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <input
          type="color"
          value={formData.color_theme}
          onChange={(e) => setFormData({...formData, color_theme: e.target.value})}
          className="w-full h-10 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Prompt di Sistema</label>
        <textarea
          value={formData.system_prompt}
          onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
          placeholder="Definisci la personalità, il tono e il comportamento dell'AI..."
          rows={6}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        {personality ? 'Aggiorna Personalità' : 'Crea Personalità'}
      </Button>
    </form>
  )
}

export default PersonalitiesManager

