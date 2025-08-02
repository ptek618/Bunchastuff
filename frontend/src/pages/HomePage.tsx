import { Camera, Package, MessageCircle, Truck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PhotoUpload from '@/components/PhotoUpload'

export default function HomePage() {

  const features = [
    {
      icon: Camera,
      title: 'AI Photo Analysis',
      description: 'Take photos and get instant AI-powered item analysis with pricing suggestions'
    },
    {
      icon: Package,
      title: 'Multi-Platform Listings',
      description: 'Create listings on Shopify, Facebook Marketplace, and eBay simultaneously'
    },
    {
      icon: MessageCircle,
      title: 'Auto Facebook Responder',
      description: 'Automated responses to Facebook inquiries to save time'
    },
    {
      icon: Truck,
      title: 'Shipping Management',
      description: 'Complete shipping workflow from label creation to delivery tracking'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Sell Items in <span className="text-blue-600">Bulk</span> with AI
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Take photos, let AI analyze your items, and create listings across multiple platforms instantly. 
          Perfect for bulk sellers with varying item conditions.
        </p>
      </div>

      {/* Photo Upload Section */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Camera className="h-6 w-6 text-blue-600" />
            <span>Start by Taking a Photo</span>
          </CardTitle>
          <CardDescription>
            Upload a photo of your item and let AI do the rest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUpload />
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold">1</div>
              <h3 className="font-semibold">Take Photo</h3>
              <p className="text-sm text-gray-600">Snap a picture of your item</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold">2</div>
              <h3 className="font-semibold">AI Analysis</h3>
              <p className="text-sm text-gray-600">Get instant analysis and pricing</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold">3</div>
              <h3 className="font-semibold">Create Listings</h3>
              <p className="text-sm text-gray-600">Generate listings for multiple platforms</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold">4</div>
              <h3 className="font-semibold">Manage Sales</h3>
              <p className="text-sm text-gray-600">Auto-respond and handle shipping</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
