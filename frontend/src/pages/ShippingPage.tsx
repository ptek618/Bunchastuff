import { useState, useEffect } from 'react'
import { Truck, Package, MapPin, Calendar, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ShippingInfo {
  item_id: string
  buyer_name: string
  buyer_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  tracking_number?: string
  carrier?: string
  status: string
  created_at: string
  shipped_at?: string
}

export default function ShippingPage() {
  const [shippingItems] = useState<ShippingInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingLabel, setCreatingLabel] = useState(false)
  const { toast } = useToast()

  const [newShipping, setNewShipping] = useState({
    item_id: '',
    buyer_name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  })

  useEffect(() => {
    setLoading(false)
  }, [])

  const createShippingLabel = async () => {
    if (!newShipping.item_id || !newShipping.buyer_name || !newShipping.street) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setCreatingLabel(true)

    try {
      const response = await fetch(`${API_URL}/api/shipping/create-label`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_id: newShipping.item_id,
          buyer_name: newShipping.buyer_name,
          buyer_address: {
            street: newShipping.street,
            city: newShipping.city,
            state: newShipping.state,
            zip: newShipping.zip,
            country: newShipping.country
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Shipping label created successfully'
        })
        setNewShipping({
          item_id: '',
          buyer_name: '',
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'US'
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create shipping label',
        variant: 'destructive'
      })
    } finally {
      setCreatingLabel(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading shipping information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Shipping Label */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Create Shipping Label</span>
            </CardTitle>
            <CardDescription>Generate shipping labels for sold items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="item_id">Item ID *</Label>
              <Input
                id="item_id"
                value={newShipping.item_id}
                onChange={(e) => setNewShipping({...newShipping, item_id: e.target.value})}
                placeholder="Enter item ID"
              />
            </div>

            <div>
              <Label htmlFor="buyer_name">Buyer Name *</Label>
              <Input
                id="buyer_name"
                value={newShipping.buyer_name}
                onChange={(e) => setNewShipping({...newShipping, buyer_name: e.target.value})}
                placeholder="Enter buyer's full name"
              />
            </div>

            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={newShipping.street}
                onChange={(e) => setNewShipping({...newShipping, street: e.target.value})}
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={newShipping.city}
                  onChange={(e) => setNewShipping({...newShipping, city: e.target.value})}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={newShipping.state}
                  onChange={(e) => setNewShipping({...newShipping, state: e.target.value})}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  value={newShipping.zip}
                  onChange={(e) => setNewShipping({...newShipping, zip: e.target.value})}
                  placeholder="ZIP Code"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={newShipping.country}
                  onChange={(e) => setNewShipping({...newShipping, country: e.target.value})}
                  placeholder="Country"
                />
              </div>
            </div>

            <Button 
              onClick={createShippingLabel} 
              disabled={creatingLabel}
              className="w-full"
            >
              {creatingLabel ? 'Creating Label...' : 'Create Shipping Label'}
            </Button>
          </CardContent>
        </Card>

        {/* Shipping Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Shipping Overview</span>
            </CardTitle>
            <CardDescription>Track your shipping performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-yellow-700">Pending</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-blue-700">Processing</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-green-700">Shipped</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-purple-700">Delivered</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="font-semibold">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Bulk Print Labels
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track All Packages
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Shipments */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
          <CardDescription>Track your current shipments</CardDescription>
        </CardHeader>
        <CardContent>
          {shippingItems.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active shipments</h3>
              <p className="text-gray-600">Create your first shipping label to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shippingItems.map((shipping, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-semibold">Item #{shipping.item_id}</h4>
                        <p className="text-sm text-gray-600">{shipping.buyer_name}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(shipping.status)}>
                      {shipping.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{shipping.buyer_address.city}, {shipping.buyer_address.state}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <span>{shipping.carrier || 'UPS'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(shipping.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {shipping.tracking_number && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tracking: {shipping.tracking_number}</span>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Track Package
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
