import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Settings, Facebook, ShoppingBag, Package, Brain } from 'lucide-react'

interface PlatformSettings {
  shopify: {
    apiKey: string
    apiSecret: string
    shopUrl: string
    enabled: boolean
  }
  facebook: {
    appId: string
    appSecret: string
    accessToken: string
    enabled: boolean
  }
  ebay: {
    clientId: string
    clientSecret: string
    devId: string
    enabled: boolean
  }
  openai: {
    apiKey: string
    enabled: boolean
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<PlatformSettings>({
    shopify: {
      apiKey: '',
      apiSecret: '',
      shopUrl: '',
      enabled: false
    },
    facebook: {
      appId: '',
      appSecret: '',
      accessToken: '',
      enabled: false
    },
    ebay: {
      clientId: '',
      clientSecret: '',
      devId: '',
      enabled: false
    },
    openai: {
      apiKey: '',
      enabled: false
    }
  })

  const [loading, setLoading] = useState(false)

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast({
        title: 'Settings Saved',
        description: 'Platform integrations have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async (platform: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/test/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings[platform as keyof PlatformSettings]),
      })

      if (!response.ok) {
        throw new Error('Connection test failed')
      }

      toast({
        title: 'Connection Successful',
        description: `${platform} integration is working correctly.`,
      })
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: `Unable to connect to ${platform}. Please check your credentials.`,
        variant: 'destructive',
      })
    }
  }

  const updatePlatformSetting = (platform: keyof PlatformSettings, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Platform Settings</h1>
      </div>
      
      <p className="text-gray-600">
        Configure your platform integrations to enable real-time monitoring and automated responses.
      </p>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>OpenAI Integration</span>
            </CardTitle>
            <CardDescription>
              Configure OpenAI API for AI-powered photo analysis and product identification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="openai-enabled"
                checked={settings.openai.enabled}
                onChange={(e) => updatePlatformSetting('openai', 'enabled', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="openai-enabled">Enable OpenAI Integration</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openai-api-key">API Key</Label>
              <Input
                id="openai-api-key"
                type="password"
                value={settings.openai.apiKey}
                onChange={(e) => updatePlatformSetting('openai', 'apiKey', e.target.value)}
                placeholder="Enter your OpenAI API key (sk-...)"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => handleTestConnection('openai')} variant="outline">
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <span>Shopify Integration</span>
            </CardTitle>
            <CardDescription>
              Connect your Shopify store to automatically sync listings and monitor sales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shopify-enabled"
                checked={settings.shopify.enabled}
                onChange={(e) => updatePlatformSetting('shopify', 'enabled', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="shopify-enabled">Enable Shopify Integration</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopify-api-key">API Key</Label>
                <Input
                  id="shopify-api-key"
                  type="password"
                  value={settings.shopify.apiKey}
                  onChange={(e) => updatePlatformSetting('shopify', 'apiKey', e.target.value)}
                  placeholder="Enter your Shopify API key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopify-api-secret">API Secret</Label>
                <Input
                  id="shopify-api-secret"
                  type="password"
                  value={settings.shopify.apiSecret}
                  onChange={(e) => updatePlatformSetting('shopify', 'apiSecret', e.target.value)}
                  placeholder="Enter your Shopify API secret"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopify-shop-url">Shop URL</Label>
              <Input
                id="shopify-shop-url"
                value={settings.shopify.shopUrl}
                onChange={(e) => updatePlatformSetting('shopify', 'shopUrl', e.target.value)}
                placeholder="your-shop.myshopify.com"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => handleTestConnection('shopify')} variant="outline">
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Facebook className="h-5 w-5" />
              <span>Facebook Integration</span>
            </CardTitle>
            <CardDescription>
              Connect Facebook Marketplace to monitor messages and automate responses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="facebook-enabled"
                checked={settings.facebook.enabled}
                onChange={(e) => updatePlatformSetting('facebook', 'enabled', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="facebook-enabled">Enable Facebook Integration</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook-app-id">App ID</Label>
                <Input
                  id="facebook-app-id"
                  value={settings.facebook.appId}
                  onChange={(e) => updatePlatformSetting('facebook', 'appId', e.target.value)}
                  placeholder="Enter your Facebook App ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook-app-secret">App Secret</Label>
                <Input
                  id="facebook-app-secret"
                  type="password"
                  value={settings.facebook.appSecret}
                  onChange={(e) => updatePlatformSetting('facebook', 'appSecret', e.target.value)}
                  placeholder="Enter your Facebook App Secret"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook-access-token">Access Token</Label>
              <Input
                id="facebook-access-token"
                type="password"
                value={settings.facebook.accessToken}
                onChange={(e) => updatePlatformSetting('facebook', 'accessToken', e.target.value)}
                placeholder="Enter your Facebook Access Token"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => handleTestConnection('facebook')} variant="outline">
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>eBay Integration</span>
            </CardTitle>
            <CardDescription>
              Connect eBay to sync listings and monitor auction activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ebay-enabled"
                checked={settings.ebay.enabled}
                onChange={(e) => updatePlatformSetting('ebay', 'enabled', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="ebay-enabled">Enable eBay Integration</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ebay-client-id">Client ID</Label>
                <Input
                  id="ebay-client-id"
                  value={settings.ebay.clientId}
                  onChange={(e) => updatePlatformSetting('ebay', 'clientId', e.target.value)}
                  placeholder="Enter your eBay Client ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ebay-client-secret">Client Secret</Label>
                <Input
                  id="ebay-client-secret"
                  type="password"
                  value={settings.ebay.clientSecret}
                  onChange={(e) => updatePlatformSetting('ebay', 'clientSecret', e.target.value)}
                  placeholder="Enter your eBay Client Secret"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebay-dev-id">Developer ID</Label>
              <Input
                id="ebay-dev-id"
                value={settings.ebay.devId}
                onChange={(e) => updatePlatformSetting('ebay', 'devId', e.target.value)}
                placeholder="Enter your eBay Developer ID"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => handleTestConnection('ebay')} variant="outline">
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}
