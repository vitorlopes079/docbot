from pydantic import BaseModel, EmailStr


class SendVerificationEmailRequest(BaseModel):
    email: EmailStr
    token: str


class EmailResponse(BaseModel):
    success: bool
    message: str
