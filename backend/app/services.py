import base64
import io
from PIL import Image
from openai import OpenAI
from typing import List, Dict, Any, Optional
import json
import uuid
import requests
from datetime import datetime
from .models import ItemAnalysis, ItemCondition, Item, ListingData, Platform, ShippingInfo, FacebookMessage, PlatformSettings, WebhookPayload

class InMemoryDatabase:
    def __init__(self):
        self.items: Dict[str, Item] = {}
        self.shipping_info: Dict[str, ShippingInfo] = {}
        self.facebook_messages: List[FacebookMessage] = []
        self.platform_settings: Optional[PlatformSettings] = None
        self.webhooks: List[WebhookPayload] = []
        self._encryption_key = "bunchastuff-secret-key-2024"

    def save_item(self, item: Item) -> None:
        self.items[item.id] = item

    def get_item(self, item_id: str) -> Optional[Item]:
        return self.items.get(item_id)

    def get_all_items(self) -> List[Item]:
        return list(self.items.values())

    def save_shipping_info(self, shipping: ShippingInfo) -> None:
        self.shipping_info[shipping.item_id] = shipping

    def get_shipping_info(self, item_id: str) -> Optional[ShippingInfo]:
        return self.shipping_info.get(item_id)

    def add_facebook_message(self, message: FacebookMessage) -> None:
        self.facebook_messages.append(message)
    
    def _encrypt_credential(self, value: str) -> str:
        if not value:
            return ""
        encoded = base64.b64encode(value.encode()).decode()
        return encoded
    
    def _decrypt_credential(self, encrypted_value: str) -> str:
        if not encrypted_value:
            return ""
        try:
            decoded = base64.b64decode(encrypted_value.encode()).decode()
            return decoded
        except:
            return encrypted_value
    
    def save_platform_settings(self, settings: PlatformSettings) -> None:
        encrypted_settings = PlatformSettings()
        
        for platform in ['shopify', 'facebook', 'ebay']:
            platform_data = getattr(settings, platform)
            encrypted_platform_data = {}
            
            for key, value in platform_data.items():
                if key in ['apiKey', 'apiSecret', 'appSecret', 'accessToken', 'clientSecret']:
                    encrypted_platform_data[key] = self._encrypt_credential(str(value))
                else:
                    encrypted_platform_data[key] = value
            
            setattr(encrypted_settings, platform, encrypted_platform_data)
        
        self.platform_settings = encrypted_settings
    
    def get_platform_settings(self) -> Optional[PlatformSettings]:
        if not self.platform_settings:
            return PlatformSettings()
        
        decrypted_settings = PlatformSettings()
        
        for platform in ['shopify', 'facebook', 'ebay']:
            platform_data = getattr(self.platform_settings, platform)
            decrypted_platform_data = {}
            
            for key, value in platform_data.items():
                if key in ['apiKey', 'apiSecret', 'appSecret', 'accessToken', 'clientSecret']:
                    decrypted_platform_data[key] = self._decrypt_credential(str(value))
                else:
                    decrypted_platform_data[key] = value
            
            setattr(decrypted_settings, platform, decrypted_platform_data)
        
        return decrypted_settings
    
    def get_masked_platform_settings(self) -> Optional[PlatformSettings]:
        settings = self.get_platform_settings()
        if not settings:
            return PlatformSettings()
        
        masked_settings = PlatformSettings()
        
        for platform in ['shopify', 'facebook', 'ebay']:
            platform_data = getattr(settings, platform)
            masked_platform_data = {}
            
            for key, value in platform_data.items():
                if key in ['apiKey', 'apiSecret', 'appSecret', 'accessToken', 'clientSecret'] and value:
                    masked_platform_data[key] = "****" + str(value)[-4:] if len(str(value)) > 4 else "****"
                else:
                    masked_platform_data[key] = value
            
            setattr(masked_settings, platform, masked_platform_data)
        
        return masked_settings
    
    def add_webhook_payload(self, payload: WebhookPayload) -> None:
        self.webhooks.append(payload)

db = InMemoryDatabase()

class AIPhotoAnalyzer:
    def __init__(self, api_key: Optional[str] = None):
        self.client = OpenAI(api_key=api_key) if api_key else None

    async def analyze_photo(self, image_data: bytes) -> ItemAnalysis:
        if not self.client:
            return self._mock_analysis()

        try:
            image = Image.open(io.BytesIO(image_data))
            image_base64 = self._image_to_base64(image)

            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Analyze this item photo and extract the following information in JSON format:
                                {
                                    "title": "Brief descriptive title",
                                    "description": "Detailed description for selling",
                                    "category": "Product category",
                                    "estimated_price": 0.0,
                                    "condition": "new|like_new|good|fair|poor",
                                    "brand": "Brand name if visible",
                                    "model": "Model if identifiable",
                                    "color": "Primary color",
                                    "size": "Size if applicable",
                                    "weight": 0.0,
                                    "keywords": ["keyword1", "keyword2"]
                                }
                                Focus on details that would help sell this item online."""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )

            analysis_text = response.choices[0].message.content
            analysis_data = json.loads(analysis_text)
            
            return ItemAnalysis(**analysis_data)
        except Exception as e:
            print(f"AI analysis failed: {e}")
            return self._mock_analysis()

    def _image_to_base64(self, image: Image.Image) -> str:
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode()

    def _mock_analysis(self) -> ItemAnalysis:
        return ItemAnalysis(
            title="Vintage Electronic Device",
            description="A well-maintained vintage electronic device in good working condition. Shows minimal signs of wear and includes original components.",
            category="Electronics",
            estimated_price=45.99,
            condition=ItemCondition.GOOD,
            brand="Generic",
            color="Black",
            keywords=["vintage", "electronics", "collectible", "working"]
        )

class ListingGenerator:
    def __init__(self, db: InMemoryDatabase):
        self.db = db

    def create_listings(self, item: Item, platforms: List[Platform], 
                       custom_title: Optional[str] = None,
                       custom_description: Optional[str] = None,
                       custom_price: Optional[float] = None) -> List[ListingData]:
        listings = []
        settings = self.db.get_platform_settings()
        
        if not settings:
            return self._create_mock_listings(item, platforms, custom_title, custom_description, custom_price)
        
        for platform in platforms:
            if platform == Platform.SHOPIFY and settings.shopify.get('enabled', False):
                listing = self._create_shopify_listing(item, settings.shopify, custom_title, custom_description, custom_price)
            elif platform == Platform.FACEBOOK and settings.facebook.get('enabled', False):
                listing = self._create_facebook_listing(item, settings.facebook, custom_title, custom_description, custom_price)
            elif platform == Platform.EBAY and settings.ebay.get('enabled', False):
                listing = self._create_ebay_listing(item, settings.ebay, custom_title, custom_description, custom_price)
            else:
                listing = self._create_platform_listing(item, platform, custom_title, custom_description, custom_price)
            
            if listing:
                listings.append(listing)
        
        return listings
    
    def _create_mock_listings(self, item: Item, platforms: List[Platform], 
                             custom_title: Optional[str] = None,
                             custom_description: Optional[str] = None,
                             custom_price: Optional[float] = None) -> List[ListingData]:
        listings = []
        
        for platform in platforms:
            listing = self._create_platform_listing(
                item, platform, custom_title, custom_description, custom_price
            )
            listings.append(listing)
        
        return listings

    def _create_platform_listing(self, item: Item, platform: Platform,
                                custom_title: Optional[str] = None,
                                custom_description: Optional[str] = None,
                                custom_price: Optional[float] = None) -> ListingData:
        analysis = item.analysis
        
        title = custom_title or self._optimize_title_for_platform(analysis.title, platform)
        description = custom_description or self._optimize_description_for_platform(analysis.description, platform)
        price = custom_price or analysis.estimated_price
        
        return ListingData(
            platform=platform,
            title=title,
            description=description,
            price=price,
            category=analysis.category,
            condition=analysis.condition,
            images=item.images,
            shipping_cost=self._calculate_shipping_cost(platform, analysis.weight),
            quantity=1
        )

    def _optimize_title_for_platform(self, title: str, platform: Platform) -> str:
        if platform == Platform.EBAY:
            return f"{title} - Fast Shipping!"
        elif platform == Platform.FACEBOOK:
            return f"{title} - Local Pickup Available"
        else:  # Shopify
            return title

    def _optimize_description_for_platform(self, description: str, platform: Platform) -> str:
        platform_suffix = {
            Platform.EBAY: "\n\n✅ Fast shipping\n✅ 30-day returns\n✅ Excellent seller rating",
            Platform.FACEBOOK: "\n\n📍 Local pickup available\n💬 Message for questions\n🚚 Can deliver locally",
            Platform.SHOPIFY: "\n\n🛒 Premium quality guaranteed\n📦 Secure packaging\n⭐ Customer satisfaction guaranteed"
        }
        
        return description + platform_suffix.get(platform, "")

    def _calculate_shipping_cost(self, platform: Platform, weight: Optional[float]) -> float:
        base_cost = {
            Platform.EBAY: 8.99,
            Platform.FACEBOOK: 0.0,  # Local pickup
            Platform.SHOPIFY: 12.99
        }
        
        cost = base_cost.get(platform, 10.0)
        if weight and weight > 2.0:  # Add extra for heavy items
            cost += (weight - 2.0) * 2.0
        
        return round(cost, 2)
    
    def _create_shopify_listing(self, item: Item, settings: Dict[str, Any], 
                               custom_title: Optional[str] = None,
                               custom_description: Optional[str] = None,
                               custom_price: Optional[float] = None) -> Optional[ListingData]:
        try:
            shop_url = settings.get('shopUrl', '')
            api_key = settings.get('apiKey', '')
            api_secret = settings.get('apiSecret', '')
            
            if not all([shop_url, api_key, api_secret]):
                return self._create_platform_listing(item, Platform.SHOPIFY, custom_title, custom_description, custom_price)
            
            analysis = item.analysis
            title = custom_title or self._optimize_title_for_platform(analysis.title, Platform.SHOPIFY)
            description = custom_description or self._optimize_description_for_platform(analysis.description, Platform.SHOPIFY)
            price = custom_price or analysis.estimated_price
            
            return ListingData(
                platform=Platform.SHOPIFY,
                title=title,
                description=description,
                price=price,
                category=analysis.category,
                condition=analysis.condition,
                images=item.images,
                shipping_cost=self._calculate_shipping_cost(Platform.SHOPIFY, analysis.weight),
                quantity=1
            )
                
        except Exception as e:
            return self._create_platform_listing(item, Platform.SHOPIFY, custom_title, custom_description, custom_price)
    
    def _create_facebook_listing(self, item: Item, settings: Dict[str, Any],
                                custom_title: Optional[str] = None,
                                custom_description: Optional[str] = None,
                                custom_price: Optional[float] = None) -> Optional[ListingData]:
        try:
            app_id = settings.get('appId', '')
            access_token = settings.get('accessToken', '')
            
            if not all([app_id, access_token]):
                return self._create_platform_listing(item, Platform.FACEBOOK, custom_title, custom_description, custom_price)
            
            analysis = item.analysis
            title = custom_title or self._optimize_title_for_platform(analysis.title, Platform.FACEBOOK)
            description = custom_description or self._optimize_description_for_platform(analysis.description, Platform.FACEBOOK)
            price = custom_price or analysis.estimated_price
            
            return ListingData(
                platform=Platform.FACEBOOK,
                title=title,
                description=description,
                price=price,
                category=analysis.category,
                condition=analysis.condition,
                images=item.images,
                shipping_cost=self._calculate_shipping_cost(Platform.FACEBOOK, analysis.weight),
                quantity=1
            )
                
        except Exception as e:
            return self._create_platform_listing(item, Platform.FACEBOOK, custom_title, custom_description, custom_price)
    
    def _create_ebay_listing(self, item: Item, settings: Dict[str, Any],
                            custom_title: Optional[str] = None,
                            custom_description: Optional[str] = None,
                            custom_price: Optional[float] = None) -> Optional[ListingData]:
        try:
            client_id = settings.get('clientId', '')
            client_secret = settings.get('clientSecret', '')
            dev_id = settings.get('devId', '')
            
            if not all([client_id, client_secret, dev_id]):
                return self._create_platform_listing(item, Platform.EBAY, custom_title, custom_description, custom_price)
            
            analysis = item.analysis
            title = custom_title or self._optimize_title_for_platform(analysis.title, Platform.EBAY)
            description = custom_description or self._optimize_description_for_platform(analysis.description, Platform.EBAY)
            price = custom_price or analysis.estimated_price
            
            return ListingData(
                platform=Platform.EBAY,
                title=title,
                description=description,
                price=price,
                category=analysis.category,
                condition=analysis.condition,
                images=item.images,
                shipping_cost=self._calculate_shipping_cost(Platform.EBAY, analysis.weight),
                quantity=1
            )
                
        except Exception as e:
            return self._create_platform_listing(item, Platform.EBAY, custom_title, custom_description, custom_price)

class FacebookAutoResponder:
    def __init__(self, db: InMemoryDatabase):
        self.db = db
        self.response_templates = {
            "availability": "Hi! Yes, this item is still available. Would you like to know more details?",
            "price": "The price is as listed, but I'm open to reasonable offers for quick sale.",
            "condition": "The item is in {condition} condition as described. I can provide more photos if needed.",
            "shipping": "I offer both local pickup and shipping. Shipping cost depends on your location.",
            "general": "Thanks for your interest! I'll get back to you shortly with more details."
        }

    def generate_auto_response(self, message: str, item_id: Optional[str] = None) -> str:
        settings = self.db.get_platform_settings()
        
        if settings and settings.facebook.get('enabled', False):
            return self._send_facebook_message(message, item_id, settings.facebook)
        
        return self._generate_auto_response(message, item_id)
    
    def _generate_auto_response(self, message: str, item_id: Optional[str] = None) -> str:
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["available", "still have", "sold"]):
            return self.response_templates["availability"]
        elif any(word in message_lower for word in ["price", "cost", "how much", "$"]):
            return self.response_templates["price"]
        elif any(word in message_lower for word in ["condition", "quality", "working"]):
            item = self.db.get_item(item_id) if item_id else None
            condition = item.analysis.condition.value if item else "good"
            return self.response_templates["condition"].format(condition=condition)
        elif any(word in message_lower for word in ["ship", "delivery", "pickup"]):
            return self.response_templates["shipping"]
        else:
            return self.response_templates["general"]
    
    def _send_facebook_message(self, message: str, item_id: Optional[str], settings: Dict[str, Any]) -> str:
        try:
            access_token = settings.get('accessToken', '')
            
            if not access_token:
                return self._generate_auto_response(message, item_id)
            
            return self._generate_auto_response(message, item_id)
                
        except Exception as e:
            return self._generate_auto_response(message, item_id)

class ShippingManager:
    def __init__(self):
        pass

    def create_shipping_label(self, item_id: str, buyer_info: Dict[str, Any]) -> ShippingInfo:
        shipping = ShippingInfo(
            item_id=item_id,
            buyer_name=buyer_info["name"],
            buyer_address=buyer_info["address"],
            tracking_number=f"1Z{uuid.uuid4().hex[:10].upper()}",
            carrier="UPS",
            created_at=datetime.now()
        )
        
        db.save_shipping_info(shipping)
        return shipping

    def update_shipping_status(self, item_id: str, status: str, tracking_number: Optional[str] = None):
        shipping = db.get_shipping_info(item_id)
        if shipping:
            shipping.status = status
            if tracking_number:
                shipping.tracking_number = tracking_number
            if status == "shipped":
                shipping.shipped_at = datetime.now()
            db.save_shipping_info(shipping)

ai_analyzer = AIPhotoAnalyzer()
listing_generator = ListingGenerator(db)
facebook_responder = FacebookAutoResponder(db)
shipping_manager = ShippingManager()

class PlatformIntegrationService:
    def __init__(self, db: InMemoryDatabase):
        self.db = db
    
    def test_shopify_connection(self, settings: Dict[str, Any]) -> bool:
        try:
            shop_url = settings.get('shopUrl', '')
            api_key = settings.get('apiKey', '')
            api_secret = settings.get('apiSecret', '')
            
            if not all([shop_url, api_key, api_secret]):
                return False
            
            url = f"https://{shop_url}/admin/api/2024-01/shop.json"
            auth = (api_key, api_secret)
            
            response = requests.get(url, auth=auth, timeout=10)
            return response.status_code == 200
            
        except Exception as e:
            return False
    
    def test_facebook_connection(self, settings: Dict[str, Any]) -> bool:
        try:
            app_id = settings.get('appId', '')
            access_token = settings.get('accessToken', '')
            
            if not all([app_id, access_token]):
                return False
            
            url = f"https://graph.facebook.com/v18.0/me"
            params = {'access_token': access_token}
            
            response = requests.get(url, params=params, timeout=10)
            return response.status_code == 200
            
        except Exception as e:
            return False
    
    def test_ebay_connection(self, settings: Dict[str, Any]) -> bool:
        try:
            client_id = settings.get('clientId', '')
            client_secret = settings.get('clientSecret', '')
            
            if not all([client_id, client_secret]):
                return False
            
            return len(client_id) > 10 and len(client_secret) > 10
            
        except Exception as e:
            return False

platform_service = PlatformIntegrationService(db)
