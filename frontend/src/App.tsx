import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import HomePage from '@/pages/HomePage'
import ItemsPage from '@/pages/ItemsPage'
import ItemDetailPage from '@/pages/ItemDetailPage'
import ShippingPage from '@/pages/ShippingPage'
import MessagesPage from '@/pages/MessagesPage'
import SettingsPage from '@/pages/SettingsPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
