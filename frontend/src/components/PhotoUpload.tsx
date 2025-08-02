import { useState, useRef } from 'react'
import { Camera, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface AnalysisResult {
  success: boolean
  item_id: string
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
  message: string
}

export default function PhotoUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive'
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/api/upload-photo`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result: AnalysisResult = await response.json()

      if (result.success) {
        toast({
          title: 'Photo analyzed successfully!',
          description: `Found: ${result.analysis.title} - $${result.analysis.estimated_price}`
        })
        navigate(`/items/${result.item_id}`)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            ) : (
              <Camera className="h-8 w-8 text-gray-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isUploading ? 'Analyzing photo...' : 'Upload a photo'}
            </h3>
            <p className="text-gray-600">
              {isUploading 
                ? 'AI is analyzing your item...' 
                : 'Drag and drop or click to select an image'
              }
            </p>
          </div>
          
          <Button 
            onClick={openFileDialog} 
            disabled={isUploading}
            className="mx-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Processing...' : 'Choose File'}
          </Button>
        </div>
      </div>

      {/* Mobile Camera Button */}
      <div className="md:hidden">
        <Button 
          onClick={openFileDialog} 
          disabled={isUploading}
          className="w-full"
          size="lg"
        >
          <Camera className="h-5 w-5 mr-2" />
          Take Photo
        </Button>
      </div>
    </div>
  )
}
