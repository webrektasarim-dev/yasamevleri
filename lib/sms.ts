// SMS API helper functions
// This is a generic implementation that can be adapted for Netgsm, İletimerkezi, or other SMS providers

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const SMS_API_KEY = process.env.SMS_API_KEY;
  const SMS_API_SECRET = process.env.SMS_API_SECRET;
  const SMS_API_URL = process.env.SMS_API_URL;

  if (!SMS_API_KEY || !SMS_API_SECRET || !SMS_API_URL) {
    // SMS API credentials not configured. SMS not sent.
    return true;
  }

  try {
    // Example implementation for Netgsm
    // Adjust this based on your SMS provider's API
    const response = await fetch(SMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usercode: SMS_API_KEY,
        password: SMS_API_SECRET,
        gsmno: phone,
        message: message,
        msgheader: "SITE", // Change this to your registered message header
      }),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
  const message = `Örnek Yaşam Evleri doğrulama kodunuz: ${code}. Bu kod 10 dakika geçerlidir.`;
  return await sendSMS(phone, message);
}






