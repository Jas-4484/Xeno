# Mini CRM Platform Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials (MongoDB, Google OAuth, JWT, etc).
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm run dev
   ```

## API Endpoints
- `/api/auth/google` - Google OAuth login
- `/api/customers` - Customer ingestion & listing
- `/api/orders` - Order ingestion & listing
- `/api/campaigns` - Campaign creation, listing, stats
- `/api/delivery/receipt` - Delivery receipt API
- `/api/ai/suggest-messages` - AI message suggestions

## Environment Variables
See `.env.example` for all required variables.
