from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uuid
from datetime import datetime
import os

from .models import (
    Item, ItemAnalysis, ListingCreateRequest, ListingCreateResponse,
    PhotoUploadResponse, Platform, ShippingInfo, FacebookMessage, FacebookAutoRespondRequest, ShippingLabelRequest
)
from .services import (
    ai_analyzer, listing_generator, facebook_responder, shipping_manager, db
)

app = FastAPI(title="Bunchastuff API", description="AI-powered bulk item listing platform")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/upload-photo", response_model=PhotoUploadResponse)
async def upload_photo(file: UploadFile = File(...)):
    """Upload a photo and get AI analysis of the item"""
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_data = await file.read()
        
        analysis = await ai_analyzer.analyze_photo(image_data)
        
        item_id = str(uuid.uuid4())
        item = Item(
            id=item_id,
            analysis=analysis,
            images=[f"item_{item_id}_1.jpg"],  # Mock image path
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.save_item(item)
        
        return PhotoUploadResponse(
            success=True,
            item_id=item_id,
            analysis=analysis,
            message="Photo analyzed successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/create-listings", response_model=ListingCreateResponse)
async def create_listings(request: ListingCreateRequest):
    """Create listings for multiple platforms"""
    try:
        item = db.get_item(request.item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        listings = listing_generator.create_listings(
            item=item,
            platforms=request.platforms,
            custom_title=request.custom_title,
            custom_description=request.custom_description,
            custom_price=request.custom_price
        )
        
        item.listings = listings
        item.updated_at = datetime.now()
        db.save_item(item)
        
        return ListingCreateResponse(
            success=True,
            item_id=request.item_id,
            listings=listings,
            message=f"Created {len(listings)} listings successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Listing creation failed: {str(e)}")

@app.get("/api/items")
async def get_items():
    """Get all items"""
    items = db.get_all_items()
    return {"items": items}

@app.get("/api/items/{item_id}")
async def get_item(item_id: str):
    """Get specific item"""
    item = db.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.post("/api/facebook/auto-respond")
async def facebook_auto_respond(request: FacebookAutoRespondRequest):
    """Generate auto-response for Facebook messages"""
    try:
        response = facebook_responder.generate_auto_response(request.message, request.item_id)
        
        fb_message = FacebookMessage(
            sender_id=request.sender_id,
            message=request.message,
            item_id=request.item_id,
            auto_response=response,
            timestamp=datetime.now()
        )
        db.add_facebook_message(fb_message)
        
        return {
            "success": True,
            "response": response,
            "message": "Auto-response generated"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-response failed: {str(e)}")

@app.post("/api/shipping/create-label")
async def create_shipping_label(request: ShippingLabelRequest):
    """Create shipping label for sold item"""
    try:
        item = db.get_item(request.item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        shipping_info = shipping_manager.create_shipping_label(
            item_id=request.item_id,
            buyer_info={"name": request.buyer_name, "address": request.buyer_address}
        )
        
        return {
            "success": True,
            "shipping_info": shipping_info,
            "message": "Shipping label created"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shipping label creation failed: {str(e)}")

@app.get("/api/shipping/{item_id}")
async def get_shipping_info(item_id: str):
    """Get shipping information for item"""
    shipping_info = db.get_shipping_info(item_id)
    if not shipping_info:
        raise HTTPException(status_code=404, detail="Shipping info not found")
    return shipping_info

@app.put("/api/shipping/{item_id}/status")
async def update_shipping_status(item_id: str, status: str, tracking_number: Optional[str] = None):
    """Update shipping status"""
    try:
        shipping_manager.update_shipping_status(item_id, status, tracking_number)
        return {"success": True, "message": "Shipping status updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status update failed: {str(e)}")

@app.get("/api/facebook/messages")
async def get_facebook_messages():
    """Get all Facebook messages and auto-responses"""
    return {"messages": db.facebook_messages}
