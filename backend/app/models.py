from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class ItemCondition(str, Enum):
    NEW = "new"
    LIKE_NEW = "like_new"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class ListingStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    SOLD = "sold"

class Platform(str, Enum):
    SHOPIFY = "shopify"
    FACEBOOK = "facebook"
    EBAY = "ebay"

class ShippingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

class ItemAnalysis(BaseModel):
    title: str
    description: str
    category: str
    estimated_price: float
    condition: ItemCondition
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None
    keywords: List[str] = []

class ListingData(BaseModel):
    platform: Platform
    title: str
    description: str
    price: float
    category: str
    condition: ItemCondition
    images: List[str]
    shipping_cost: Optional[float] = None
    quantity: int = 1

class Item(BaseModel):
    id: str
    analysis: ItemAnalysis
    images: List[str]
    listings: List[ListingData] = []
    status: ListingStatus = ListingStatus.DRAFT
    created_at: datetime
    updated_at: datetime

class ShippingInfo(BaseModel):
    item_id: str
    buyer_name: str
    buyer_address: Dict[str, str]
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    status: ShippingStatus = ShippingStatus.PENDING
    created_at: datetime
    shipped_at: Optional[datetime] = None

class FacebookMessage(BaseModel):
    sender_id: str
    message: str
    item_id: Optional[str] = None
    auto_response: Optional[str] = None
    timestamp: datetime

class FacebookAutoRespondRequest(BaseModel):
    sender_id: str
    message: str
    item_id: Optional[str] = None

class ShippingLabelRequest(BaseModel):
    item_id: str
    buyer_name: str
    buyer_address: dict

class PhotoUploadResponse(BaseModel):
    success: bool
    item_id: str
    analysis: ItemAnalysis
    message: str

class ListingCreateRequest(BaseModel):
    item_id: str
    platforms: List[Platform]
    custom_title: Optional[str] = None
    custom_description: Optional[str] = None
    custom_price: Optional[float] = None

class ListingCreateResponse(BaseModel):
    success: bool
    item_id: str
    listings: List[ListingData]
    message: str

class PlatformSettings(BaseModel):
    shopify: Dict[str, Any] = {
        "apiKey": "",
        "apiSecret": "",
        "shopUrl": "",
        "enabled": False
    }
    facebook: Dict[str, Any] = {
        "appId": "",
        "appSecret": "",
        "accessToken": "",
        "enabled": False
    }
    ebay: Dict[str, Any] = {
        "clientId": "",
        "clientSecret": "",
        "devId": "",
        "enabled": False
    }

class WebhookPayload(BaseModel):
    platform: str
    event_type: str
    data: Dict[str, Any]
    timestamp: datetime
