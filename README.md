
# Spur AI Chat Agent - Backend

**Backend Repository Link:** [https://github.com/sahil-vanarse/Spur-Frontend](https://github.com/sahil-vanarse/Spur-Frontend)

**Live Demo API:** [https://spur-backend-qvca.onrender.com](https://spur-backend-qvca.onrender.com)

**Video Demo:** 

https://github.com/user-attachments/assets/7dcd94a8-a7b5-4bfb-912e-59b9d8031ec8

Backend server for the AI-powered customer support chat agent. Built with Node.js, TypeScript, Express, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- OpenAI API key OR Groq API key (or both)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and fill in your values:
   - `OPENAI_API_KEY`: Your OpenAI API key from https://platform.openai.com/api-keys
   - `GROQ_API_KEY`: Your Groq API key from https://console.groq.com/keys
   - `DATABASE_URL`: PostgreSQL connection string (with connection pooling)
   - `DIRECT_URL`: Direct PostgreSQL connection string (for migrations)
   - `SUPABASE_URL`: Supabase URL
   - `SUPABASE_ANON_KEY`: Supabase anon key

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```
   
   This will:
   - Create the database schema
   - Generate Prisma Client
   - Apply all migrations

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Server will start on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── migrations/            # Database migration files
├── src/
│   ├── controllers/
│   │   └── chat.controller.ts # Chat message handling logic
│   ├── routes/
│   │   └── chat.routes.ts     # API route definitions
│   ├── services/
│   │   └── llm.service.ts     # LLM integration (OpenAI/Groq)
│   ├── db.ts                  # Prisma client instance
│   └── index.ts               # Express app entry point
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

## 🔌 API Endpoints

### `POST /chat/message`
Send a user message and get AI response.

**Request Body:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-session-id",
  "provider": "groq"  // optional: "openai" or "groq" (default: groq)
}
```

**Response:**
```json
{
  "reply": "AI agent's response...",
  "sessionId": "uuid-session-id",
  "provider": "groq"
}
```

### `GET /chat/history/:sessionId`
Retrieve conversation history for a session.

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-uuid",
      "sender": "user",
      "text": "User message",
      "timestamp": "2025-12-23T00:00:00.000Z"
    },
    {
      "id": "msg-uuid",
      "sender": "ai",
      "text": "AI response",
      "timestamp": "2025-12-23T00:00:01.000Z"
    }
  ]
}
```

### `POST /chat/clear`
Clear all messages in a conversation.

**Request Body:**
```json
{
  "sessionId": "session-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation cleared."
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T00:00:00.000Z"
}
```

## 🗄️ Database Schema

```prisma
model Conversation {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         String       // "user" or "ai"
  text           String
  timestamp      DateTime     @default(now())
}
```

**Design Decisions:**
- **Normalized schema**: Separate tables for conversations and messages for better data integrity and querying
- **Cascade delete**: When a conversation is deleted, all its messages are automatically deleted
- **UUID primary keys**: For better scalability and security
- **Timestamps**: Track when conversations and messages were created

## 🤖 LLM Integration

### Supported Providers
1. **Groq** (Default)
   - Model: `llama-3.3-70b-versatile`
   - Fast inference, cost-effective
   - Free tier available

2. **OpenAI**
   - Model: `gpt-3.5-turbo`
   - High-quality responses
   - Requires paid API key

### How It Works
1. User message is received via API
2. Conversation history is fetched from database
3. History + new message sent to LLM with system prompt
4. LLM generates contextual response
5. Both user message and AI response saved to database
6. AI response returned to frontend

### System Prompt
The agent is configured with comprehensive knowledge about Spur:
- Complete pricing plans (₹799 - ₹31,999/month)
- All product features and capabilities
- 50+ integrations (Shopify, Stripe, Zoho, etc.)
- Security & compliance information
- Customer support details

### Error Handling
- API timeouts: Graceful error message to user
- Invalid API keys: Caught and logged
- Rate limits: Handled with user-friendly message
- Network errors: Retry logic and fallback

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma generate` - Regenerate Prisma Client

### Database Migrations
To create a new migration:
```bash
npx prisma migrate dev --name your_migration_name
```

To apply migrations in production:
```bash
npx prisma migrate deploy
```

## 🔒 Security

- ✅ No hardcoded secrets (all in `.env`)
- ✅ Environment variables for API keys
- ✅ Input validation on all endpoints
- ✅ CORS configured for frontend origin
- ✅ Error messages don't leak sensitive info
- ✅ Database credentials URL-encoded

## 🚢 Deployment

### Environment Variables
Make sure to set these in your deployment platform:
- `OPENAI_API_KEY`
- `GROQ_API_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Deployment Steps (Example: Render)
1. **Create new Web Service** on Render
2. **Connect GitHub repository** (`Spur-Backend`)
3. **Set Build Command**: `npm install && npx prisma generate`
4. **Set Start Command**: `npx ts-node src/index.ts`
5. **Add Environment Variables**: (Copy all from `.env` except `PORT`)
6. **Deploy!**

## 🐛 Troubleshooting

### "insufficient_quota" Error
- Your OpenAI API key has run out of credits
- Switch to Groq provider (free tier available)
- Add credits to your OpenAI account

### Database Connection Issues
- Check `DATABASE_URL` and `DIRECT_URL` are correct
- Ensure password is URL-encoded (# → %23, @ → %40, etc.)
- Verify database is accessible from your network

### Prisma Client Errors
- Run `npx prisma generate` to regenerate client
- Delete `node_modules` and reinstall: `npm install`

## 📝 Architecture Notes

### Separation of Concerns
- **Routes** (`chat.routes.ts`): Define API endpoints
- **Controllers** (`chat.controller.ts`): Handle request/response logic
- **Services** (`llm.service.ts`): Business logic (LLM calls)
- **Database** (`db.ts`): Prisma client singleton

### Why This Structure?
- Easy to test each layer independently
- Simple to add new channels (WhatsApp, Instagram, etc.)
- LLM provider can be swapped without changing controllers
- Database layer abstracted through Prisma

### Extensibility
To add a new LLM provider:
1. Add API key to `.env`
2. Initialize client in `llm.service.ts`
3. Add case in `generateReply()` function
4. Update `LLMProvider` type

To add a new channel:
1. Create new route file (e.g., `whatsapp.routes.ts`)
2. Create controller (e.g., `whatsapp.controller.ts`)
3. Reuse `llm.service.ts` for AI responses
4. Same database schema works for all channels

## 🎯 Trade-offs & Future Improvements

### Current Trade-offs
- **System prompt in code**: Knowledge base is hardcoded. Could move to database for dynamic updates.
- **No caching**: Every request hits LLM. Could add Redis for common queries.
- **No rate limiting**: Could add rate limiting per session/IP.
- **Single region**: Database in one region. Could add read replicas.


### Sahil Vanarse
