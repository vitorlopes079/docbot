from fastapi import FastAPI, HTTPException
from schemas import SendVerificationEmailRequest, EmailResponse
from services.email import EmailService

app = FastAPI()
email_service = EmailService()


@app.get("/health")
def health():
    return {"status": "ok", "service": "notification-service"}


@app.post("/email/verification", response_model=EmailResponse)
async def send_verification_email(request: SendVerificationEmailRequest):
    """Internal endpoint: Send verification email to user"""
    success = await email_service.send_verification_email(
        to_email=request.email,
        token=request.token
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send verification email")

    return EmailResponse(success=True, message="Verification email sent")
