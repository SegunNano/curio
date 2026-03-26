import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_APIKEY)

export const sendVerificationEmail = async ({ name, email, verificationUrl }) => {
  try {
    const response = await resend.emails.send({
      from: 'Curio <onboarding@resend.dev>', // free tier domain
      to: email,
      subject: 'Verify your Curio email 📧',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Curio, ${name}! 🎉</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:4px;margin:20px 0;">
            Verify Email
          </a>
          <p>Or copy this link: ${verificationUrl}</p>
          <p>Link expires in <strong>24 hours.</strong></p>
          <hr/>
          <p style="color:#999;font-size:12px;">If you didn't create a Curio account, ignore this email.</p>
        </div>
      `,
    })

    if (response.error) throw new Error(response.error.message)
    console.log(`Verification email sent to ${email} ✅`)
  } catch (error) {
    console.error('Send verification email error:', error.message)
    throw error
  }
}