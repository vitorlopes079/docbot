# Auth Service

Authentication service for DocBot. Handles user registration, login, and JWT token management.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |
| GET | `/auth/me` | Get current user info (requires token) |
| GET | `/health` | Health check |

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables in `.env`:
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
```

4. Run the service:
```bash
uvicorn main:app --reload --port 8006
```

## API Usage

### Register
```bash
curl -X POST http://localhost:8006/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret123"}'
```

### Login
```bash
curl -X POST http://localhost:8006/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret123"}'
```

### Get Current User
```bash
curl http://localhost:8006/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Docker

Build and run:
```bash
docker build -t auth-service .
docker run -p 8006:8006 --env-file .env auth-service
```

## Database Schema

The service uses the Supabase `users` table:
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
