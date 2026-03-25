import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export const sendVerificationEmail = async ({ name, email, verificationUrl }) => {
  
  try {
    await transporter.sendMail({
      from: `"Curio" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify your Curio email 📧',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Curio, ${name}! 🎉</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="
               display: inline-block;
               padding: 12px 24px;
               background-color: #000;
               color: #fff;
               text-decoration: none;
               border-radius: 4px;
               margin: 20px 0;
             ">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666;">${verificationUrl}</p>
          <p>Link expires in <strong>24 hours.</strong></p>
          <hr/>
          <p style="color: #999; font-size: 12px;">
            If you didn't create a Curio account, ignore this email.
          </p>
        </div>
      `,
    })
    console.log(`Verification email sent to ${email} ✅`)
  } catch (error) {
    console.error('Send verification email error:', error.message)
    throw error
  }
}