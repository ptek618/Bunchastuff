import { useState, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface FacebookMessage {
  sender_id: string
  message: string
  item_id?: string
  auto_response?: string
  timestamp: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<FacebookMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [testingResponse, setTestingResponse] = useState(false)
  const { toast } = useToast()

  const [testMessage, setTestMessage] = useState({
    sender_id: 'test_user_123',
    message: '',
    item_id: ''
  })

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/facebook/messages`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const testAutoResponse = async () => {
    if (!testMessage.message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a test message',
        variant: 'destructive'
      })
      return
    }

    setTestingResponse(true)

    try {
      const response = await fetch(`${API_URL}/api/facebook/auto-respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: testMessage.sender_id,
          message: testMessage.message,
          item_id: testMessage.item_id || null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Auto-response generated!',
          description: 'Check the messages list below'
        })
        setTestMessage({...testMessage, message: ''})
        fetchMessages() // Refresh messages
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate response',
        variant: 'destructive'
      })
    } finally {
      setTestingResponse(false)
    }
  }

  const getMessageTypeIcon = (message: FacebookMessage) => {
    if (message.auto_response) {
      return <Bot className="h-4 w-4 text-blue-600" />
    }
    return <User className="h-4 w-4 text-gray-600" />
  }

  const getMessageTypeLabel = (message: FacebookMessage) => {
    return message.auto_response ? 'Auto-response' : 'Incoming message'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Facebook Auto-Responder</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Auto-Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Test Auto-Response</span>
            </CardTitle>
            <CardDescription>Test the AI auto-response system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sender_id">Sender ID</Label>
              <Input
                id="sender_id"
                value={testMessage.sender_id}
                onChange={(e) => setTestMessage({...testMessage, sender_id: e.target.value})}
                placeholder="Facebook user ID"
              />
            </div>

            <div>
              <Label htmlFor="item_id">Item ID (optional)</Label>
              <Input
                id="item_id"
                value={testMessage.item_id}
                onChange={(e) => setTestMessage({...testMessage, item_id: e.target.value})}
                placeholder="Related item ID"
              />
            </div>

            <div>
              <Label htmlFor="message">Test Message</Label>
              <Input
                id="message"
                value={testMessage.message}
                onChange={(e) => setTestMessage({...testMessage, message: e.target.value})}
                placeholder="Type a message to test auto-response..."
                onKeyPress={(e) => e.key === 'Enter' && testAutoResponse()}
              />
            </div>

            <Button 
              onClick={testAutoResponse} 
              disabled={testingResponse}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {testingResponse ? 'Generating Response...' : 'Test Auto-Response'}
            </Button>

            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Try these examples:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>"Is this still available?"</li>
                <li>"How much does it cost?"</li>
                <li>"What condition is it in?"</li>
                <li>"Can you ship this to me?"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Response Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Response Statistics</span>
            </CardTitle>
            <CardDescription>Auto-response performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
                <div className="text-sm text-blue-700">Total Messages</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {messages.filter(m => m.auto_response).length}
                </div>
                <div className="text-sm text-green-700">Auto-Responses</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="font-semibold">Response Types</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Availability inquiries</span>
                  <Badge variant="outline">Most common</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Price questions</span>
                  <Badge variant="outline">Common</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Condition questions</span>
                  <Badge variant="outline">Frequent</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Shipping inquiries</span>
                  <Badge variant="outline">Regular</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>Recent Facebook messages and auto-responses</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Test the auto-response system above to see messages here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.slice().reverse().map((message, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getMessageTypeIcon(message)}
                      <span className="font-medium text-sm">
                        {getMessageTypeLabel(message)}
                      </span>
                      <span className="text-xs text-gray-500">
                        from {message.sender_id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(message.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm"><strong>Message:</strong> {message.message}</p>
                    </div>
                    
                    {message.auto_response && (
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-sm"><strong>Auto-response:</strong> {message.auto_response}</p>
                      </div>
                    )}

                    {message.item_id && (
                      <div className="text-xs text-gray-600">
                        Related to item: {message.item_id}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
