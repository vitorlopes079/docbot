import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "noreply@repodoc.tech")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


class EmailService:
    RESEND_API_URL = "https://api.resend.com/emails"

    async def send_verification_email(self, to_email: str, token: str) -> bool:
        """Send verification email via Resend API"""
        verification_url = f"{FRONTEND_URL}/verify-email?token={token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #1e1e1e; color: #d4d4d4; padding: 40px; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #252526; border-radius: 8px; padding: 40px; }}
                .logo {{ text-align: center; margin-bottom: 30px; }}
                h1 {{ color: #ffffff; font-size: 24px; margin-bottom: 16px; text-align: center; }}
                p {{ color: #a0a0a0; line-height: 1.6; }}
                .button {{ display: inline-block; background-color: #0078d4; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 500; margin: 24px 0; }}
                .button:hover {{ background-color: #106ebe; }}
                .button-container {{ text-align: center; }}
                .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #3c3c3c; font-size: 12px; color: #6e6e6e; }}
                .link {{ color: #0078d4; word-break: break-all; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#0078d4" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <h1>Verify your email address</h1>
                <p>Thanks for signing up for RepoDoc! Please verify your email address to activate your account and receive your free credits.</p>
                <div class="button-container">
                    <a href="{verification_url}" class="button">Verify Email Address</a>
                </div>
                <p>This link will expire in 24 hours.</p>
                <p style="font-size: 13px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p class="link" style="font-size: 13px;">{verification_url}</p>
                <div class="footer">
                    <p>If you didn't create an account with RepoDoc, you can safely ignore this email.</p>
                    <p>RepoDoc - AI-Powered Documentation Generator</p>
                </div>
            </div>
        </body>
        </html>
        """

        payload = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Verify your RepoDoc email address",
            "html": html_content
        }

        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.RESEND_API_URL,
                    json=payload,
                    headers=headers
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
