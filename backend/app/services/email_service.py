import html
import resend

from app.core.config import settings


def send_password_reset_email(
    email: str,
    reset_token: str,
) -> None:
    if not settings.RESEND_API_KEY:
        raise RuntimeError(
            "RESEND_API_KEY is not configured"
        )

    resend.api_key = settings.RESEND_API_KEY

    reset_url = (
        f"{settings.FRONTEND_RESET_URL}"
        f"?token={reset_token}"
    )

    safe_url = html.escape(
        reset_url,
        quote=True,
    )

    params = {
        "from": settings.EMAIL_FROM,
        "to": [email],
        "subject": "Reset your SignSpeak password",
        "html": f"""
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
          <h2>Reset your SignSpeak password</h2>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            <a
              href="{safe_url}"
              style="
                display:inline-block;
                padding:12px 18px;
                background:#16c8c4;
                color:#071014;
                text-decoration:none;
                border-radius:8px;
                font-weight:bold;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link will expire in
            {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.
          </p>

          <p>
            If you did not request this reset,
            you can ignore this email.
          </p>
        </div>
        """,
    }

    resend.Emails.send(params)
