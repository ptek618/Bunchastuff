import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, DollarSign, Tag, Palette, Calendar, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Item {
  id: string
  analysis: {
    title: string
    description: string
    category: string
    estimated_price: number
    condition: string
    brand?: string
    color?: string
    keywords: string[]
  }
  images: string[]
  listings: any[]
  status: string
  created_at: string
  updated_at: string
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingListings, setCreatingListings] = useState(false)
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customPrice, setCustomPrice] = useState('')

  useEffect(() => {
    if (id) {
      fetchItem(id)
    }
  }, [id])

  const fetchItem = async (itemId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/items/${itemId}`)
      if (!response.ok) {
        throw new Error('Item not found')
      }
      const itemData = await response.json()
      setItem(itemData)
      setCustomTitle(itemData.analysis.title)
      setCustomDescription(itemData.analysis.description)
      setCustomPrice(itemData.analysis.estimated_price.toString())
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load item details',
        variant: 'destructive'
      })
      navigate('/items')
    } finally {
      setLoading(false)
    }
  }

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform])
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform))
    }
  }

  const createListings = async () => {
    if (!item || selectedPlatforms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one platform',
        variant: 'destructive'
      })
      return
    }

    setCreatingListings(true)

    try {
      const response = await fetch(`${API_URL}/api/create-listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_id: item.id,
          platforms: selectedPlatforms,
          custom_title: customTitle !== item.analysis.title ? customTitle : null,
          custom_description: customDescription !== item.analysis.description ? customDescription : null,
          custom_price: parseFloat(customPrice) !== item.analysis.estimated_price ? parseFloat(customPrice) : null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Created ${result.listings.length} listings successfully`
        })
        fetchItem(item.id) // Refresh item data
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create listings',
        variant: 'destructive'
      })
    } finally {
      setCreatingListings(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Item not found</h2>
        <Button onClick={() => navigate('/items')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
      </div>
    )
  }

  const platforms = [
    { id: 'shopify', name: 'Shopify', description: 'Your online store' },
    { id: 'facebook', name: 'Facebook Marketplace', description: 'Local and social selling' },
    { id: 'ebay', name: 'eBay', description: 'Global auction platform' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/items')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Item Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item Information */}
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
            <CardDescription>Automatically generated item information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{item.analysis.title}</h3>
              <p className="text-gray-600 mt-1">{item.analysis.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  ${item.analysis.estimated_price}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-blue-600" />
                <span>{item.analysis.category}</span>
              </div>
              {item.analysis.brand && (
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span>{item.analysis.brand}</span>
                </div>
              )}
              {item.analysis.color && (
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-orange-600" />
                  <span>{item.analysis.color}</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Condition</Label>
              <Badge className="ml-2">
                {item.analysis.condition.replace('_', ' ')}
              </Badge>
            </div>

            <div>
              <Label className="text-sm font-medium">Keywords</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.analysis.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Create Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Create Listings</CardTitle>
            <CardDescription>Generate listings for multiple platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Platforms</Label>
              <div className="space-y-3">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={(checked) => 
                        handlePlatformChange(platform.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor={platform.id} className="font-medium">
                        {platform.name}
                      </Label>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Custom Title (optional)</Label>
                <Input
                  id="title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Override AI-generated title"
                />
              </div>

              <div>
                <Label htmlFor="price">Custom Price (optional)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Override AI-suggested price"
                />
              </div>

              <div>
                <Label htmlFor="description">Custom Description (optional)</Label>
                <Textarea
                  id="description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Override AI-generated description"
                  rows={3}
                />
              </div>
            </div>

            <Button 
              onClick={createListings} 
              disabled={creatingListings || selectedPlatforms.length === 0}
              className="w-full"
            >
              {creatingListings ? 'Creating Listings...' : 'Create Listings'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Listings */}
      {item.listings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
            <CardDescription>Your current listings across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {item.listings.map((listing, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{listing.platform}</h4>
                    <Badge>{listing.condition}</Badge>
                  </div>
                  <h5 className="font-medium">{listing.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{listing.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-semibold text-green-600">${listing.price}</span>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Listing
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
