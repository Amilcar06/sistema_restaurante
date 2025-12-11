import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.emails_from_email = settings.EMAILS_FROM_EMAIL
        self.emails_from_name = settings.EMAILS_FROM_NAME
        self.smtp_tls = settings.SMTP_TLS
        self.smtp_ssl = settings.SMTP_SSL

    def _send(self, to_email: str, subject: str, html_content: str):
        """
        Send an email using SMTP.
        """
        if not self.smtp_host:
            logger.warning("SMTP configuration not found. Email not sent.")
            logger.info(f"Would have sent email to {to_email} with subject '{subject}'")
            return

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{self.emails_from_name} <{self.emails_from_email}>"
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        try:
            if self.smtp_ssl:
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port)
            else:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port)
                if self.smtp_tls:
                    server.starttls()

            if self.smtp_user and self.smtp_password:
                server.login(self.smtp_user, self.smtp_password)

            server.sendmail(self.emails_from_email, to_email, msg.as_string())
            server.quit()
            logger.info(f"Email sent successfully to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            # In production, you might want to re-raise or handle this differently
            # For now, we log it so the API doesn't crash
            pass

    def send_password_recovery_email(self, to_email: str, token: str):
        """
        Send password recovery email with the reset link.
        """
        # In a real app, use a frontend URL from config
        # Assuming frontend runs on localhost:5173 for development
        # or use a configured FRONTEND_URL setting
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        
        subject = "Recuperación de Contraseña - GastroSmart AI"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #FF6B35;">Recuperación de Contraseña</h2>
                    <p>Hola,</p>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña en GastroSmart AI.</p>
                    <p>Para continuar, haz clic en el siguiente botón:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Restablecer Contraseña</a>
                    </div>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    <p>El enlace expirará en 30 minutos.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">GastroSmart AI - Sistema Integral de Control Gastronómico</p>
                </div>
            </body>
        </html>
        """
        
        self._send(to_email, subject, html_content)

email_service = EmailService()
