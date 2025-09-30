import nodemailer from "nodemailer";

export async function sendEmail({
  from = process.env.APP_EMAIL,
  to = ["saramostafaelhadad830@gmail.com"],
  subject = "sarahaApp" ,
  text = "",
  html = "",
  attachments = [],
} = {}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"sarahaApp" <${from}>`,
    to: to,
    subject: subject,
    text: text, // plain‑text body
    html: html, // HTML body
    attachments:[

    ]
  });

}
