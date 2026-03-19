import os
import secrets
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional
from datetime import datetime, timedelta, timezone

load_dotenv()


class DatabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        self.client: Client = create_client(url, key)

    def create_user(self, email: str, password_hash: str) -> dict:
        """Create user with verification token (0 credits by default from DB)"""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

        data = {
            "email": email,
            "password_hash": password_hash,
            "email_verified": False,
            "verification_token": token,
            "token_expires_at": expires_at.isoformat()
        }
        response = self.client.table("users").insert(data).execute()
        return response.data[0]

    def get_user_by_email(self, email: str) -> Optional[dict]:
        response = self.client.table("users").select("*").eq("email", email).execute()
        if not response.data:
            return None
        return response.data[0]

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        response = self.client.table("users").select("*").eq("id", user_id).execute()
        if not response.data:
            return None
        return response.data[0]

    def get_user_by_verification_token(self, token: str) -> Optional[dict]:
        """Find user by verification token"""
        response = self.client.table("users").select("*").eq("verification_token", token).execute()
        if not response.data:
            return None
        return response.data[0]

    def verify_user_email(self, user_id: str) -> bool:
        """Mark email as verified, clear token, award credits"""
        try:
            self.client.table("users").update({
                "email_verified": True,
                "verification_token": None,
                "token_expires_at": None,
                "credits": 3
            }).eq("id", user_id).execute()
            return True
        except Exception:
            return False

    def regenerate_verification_token(self, user_id: str) -> Optional[str]:
        """Generate new verification token for user"""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

        try:
            self.client.table("users").update({
                "verification_token": token,
                "token_expires_at": expires_at.isoformat()
            }).eq("id", user_id).execute()
            return token
        except Exception:
            return None

    def get_user_credits(self, user_id: str) -> int:
        user = self.get_user_by_id(user_id)
        if not user:
            return 0
        return user.get("credits", 0)

    def deduct_credit(self, user_id: str) -> bool:
        """Deduct one credit from user. Returns True if successful, False if no credits."""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        current_credits = user.get("credits", 0)
        if current_credits <= 0:
            return False

        self.client.table("users").update({"credits": current_credits - 1}).eq("id", user_id).execute()
        return True
