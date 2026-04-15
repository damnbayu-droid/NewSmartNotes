'use server'

export async function sendSupportEmail(formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY is missing');
    return { success: false, error: 'Identity Bridge Failure: Email API key not found.' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Smart Notes Support <smart@notes.biz.id>',
        to: ['damnbayu@gmail.com'], // Notification destination
        reply_to: formData.email,
        subject: `[SUPPORT] ${formData.subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 40px; background-color: #f9fafb; border-radius: 20px;">
            <p style="text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; color: #7c3aed; font-size: 10px;">Support Matrix Notification</p>
            <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin-top: 10px; margin-bottom: 20px;">New Inquiry Received</h1>
            
            <div style="background-color: white; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; margin-bottom: 10px; font-size: 14px;"><strong>From:</strong> ${formData.name} (${formData.email})</p>
              ${formData.phone ? `<p style="margin: 0; margin-bottom: 10px; font-size: 14px;"><strong>Phone:</strong> ${formData.phone}</p>` : ''}
              <p style="margin: 0; margin-bottom: 20px; font-size: 14px;"><strong>Subject:</strong> ${formData.subject}</p>
              
              <div style="height: 1px; background-color: #f3f4f6; margin-bottom: 20px;"></div>
              
              <p style="margin: 0; font-style: italic; color: #4b5563; line-height: 1.6;">"${formData.message}"</p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Resend API error');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Email action error:', error);
    return { success: false, error: error.message };
  }
}
