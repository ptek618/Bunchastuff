# Bunchastuff - AI-Powered Bulk Item Listing Platform

A comprehensive mobile and web application that uses AI to analyze photos, create listings across multiple platforms (Shopify, Facebook, eBay), and manage the entire selling process from listing to shipping.

## Features

- **AI Photo Analysis**: Take photos and automatically extract item information
- **Multi-Platform Listings**: Create listings on Shopify, Facebook Marketplace, and eBay
- **Auto Facebook Responder**: Automated responses to Facebook inquiries
- **Shipping Management**: Complete shipping workflow once items sell
- **Bulk Operations**: Designed for high-volume sellers with varying item conditions
- **Mobile & Web**: Full-featured mobile app and web interface

## Architecture

- **Backend**: FastAPI with Python
- **Frontend**: React with TypeScript (responsive for mobile)
- **AI Integration**: OpenAI Vision API for photo analysis
- **Platform APIs**: Shopify, Facebook Graph API, eBay API
- **Database**: PostgreSQL for production, in-memory for development

## Getting Started

### Backend
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Integrations

- Shopify Admin API
- Facebook Graph API & Marketplace API
- eBay Trading API
- OpenAI Vision API for photo analysis
