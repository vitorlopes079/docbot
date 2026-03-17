import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional

load_dotenv()


class DatabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        self.client: Client = create_client(url, key)

    def create_user(self, email: str, password_hash: str) -> dict:
        data = {
            "email": email,
            "password_hash": password_hash
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
