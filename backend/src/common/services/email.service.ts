import { Injectable, Logger } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor() {
    // Initialize Brevo API client
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY || '',
    );
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Verify Your SimpleChat Account';
      sendSmtpEmail.sender = {
        name: 'SimpleChat.Bot',
        email: 'noreply@simplechat.bot',
      };
      sendSmtpEmail.to = [{ email, name: email.split('@')[0] }];
      sendSmtpEmail.htmlContent = this.getVerificationEmailTemplate(verificationUrl);

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`✅ Verification email sent to ${email} (Message ID: ${result.body.messageId})`);
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to ${email}:`, error.message);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset link
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Reset Your SimpleChat Password';
      sendSmtpEmail.sender = {
        name: 'SimpleChat.Bot',
        email: 'noreply@simplechat.bot',
      };
      sendSmtpEmail.to = [{ email, name: email.split('@')[0] }];
      sendSmtpEmail.htmlContent = this.getPasswordResetEmailTemplate(resetUrl);

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`✅ Password reset email sent to ${email} (Message ID: ${result.body.messageId})`);
    } catch (error) {
      this.logger.error(`❌ Failed to send password reset email to ${email}:`, error.message);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Email verification HTML template
   */
  private getVerificationEmailTemplate(verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <div style="background-color: white; width: 80px; height: 80px; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                💬
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to SimpleChat!</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Verify your email to get started</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi there! 👋
              </p>
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for signing up for SimpleChat. To complete your registration and start using your chat widget, please verify your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}"
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: #ffffff;
                              text-decoration: none;
                              padding: 16px 40px;
                              border-radius: 8px;
                              font-size: 16px;
                              font-weight: 600;
                              display: inline-block;
                              box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                This link will expire in <strong>24 hours</strong>. If you didn't create an account with SimpleChat, you can safely ignore this email.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

              <!-- Alternative link -->
              <p style="color: #718096; font-size: 13px; line-height: 1.6; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; font-size: 13px; word-break: break-all; margin: 10px 0 0 0;">
                ${verificationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
                <strong>SimpleChat</strong> - AI-Powered Customer Support
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} SimpleChat. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Password reset HTML template
   */
  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <div style="background-color: white; width: 80px; height: 80px; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                🔒
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Secure your SimpleChat account</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi there! 👋
              </p>
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We received a request to reset your SimpleChat password. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}"
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: #ffffff;
                              text-decoration: none;
                              padding: 16px 40px;
                              border-radius: 8px;
                              font-size: 16px;
                              font-weight: 600;
                              display: inline-block;
                              box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 4px;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

              <!-- Alternative link -->
              <p style="color: #718096; font-size: 13px; line-height: 1.6; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; font-size: 13px; word-break: break-all; margin: 10px 0 0 0;">
                ${resetUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
                <strong>SimpleChat</strong> - AI-Powered Customer Support
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} SimpleChat. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
