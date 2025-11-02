import Settings from "@/models/Settings";

interface NotificationData {
  to: string;
  subject?: string;
  message: string;
  type: 'email' | 'sms' | 'push';
}

// Check if notification type is enabled
export async function isNotificationEnabled(
  category: 'emailNotifications' | 'smsNotifications' | 'pushNotifications',
  type: string
): Promise<boolean> {
  try {
    const settings = await Settings.findOne({ type: 'notification' });
    
    if (!settings || !settings.settings) {
      return true; // Default: enabled
    }

    const categorySettings = settings.settings[category];
    
    if (!categorySettings || !categorySettings.enabled) {
      return false;
    }

    return categorySettings[type] !== false;
  } catch (error) {
    console.error('Error checking notification settings:', error);
    return true; // On error, allow notification
  }
}

// Send email notification (example - implement with your email service)
export async function sendEmailNotification(data: NotificationData): Promise<boolean> {
  try {
    // Check if email notifications are enabled
    const enabled = await isNotificationEnabled('emailNotifications', 'enabled');
    if (!enabled) {
      console.log('Email notifications are disabled');
      return false;
    }

    // TODO: Implement actual email sending
    // Example: using nodemailer, SendGrid, etc.
    console.log('📧 Email notification:', data);
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Send SMS notification (example - implement with your SMS service)
export async function sendSMSNotification(data: NotificationData): Promise<boolean> {
  try {
    // Check if SMS notifications are enabled
    const enabled = await isNotificationEnabled('smsNotifications', 'enabled');
    if (!enabled) {
      console.log('SMS notifications are disabled');
      return false;
    }

    // TODO: Implement actual SMS sending
    console.log('📱 SMS notification:', data);
    
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

// Notify on new dues created
export async function notifyNewDues(userEmail: string, duesInfo: any) {
  const enabled = await isNotificationEnabled('emailNotifications', 'newDues');
  if (!enabled) return;

  await sendEmailNotification({
    to: userEmail,
    subject: 'Yeni Aidat Dönemi',
    message: `${duesInfo.period.month}/${duesInfo.period.year} dönemi için aidat oluşturuldu. Tutar: ${duesInfo.amount}₺`,
    type: 'email',
  });
}

// Notify on payment confirmation
export async function notifyPaymentConfirmation(userEmail: string, paymentInfo: any) {
  const emailEnabled = await isNotificationEnabled('emailNotifications', 'paymentConfirmation');
  
  if (emailEnabled) {
    await sendEmailNotification({
      to: userEmail,
      subject: 'Ödeme Onayı',
      message: `${paymentInfo.amount}₺ tutarındaki ödemeniz başarıyla alınmıştır.`,
      type: 'email',
    });
  }
}

// Notify on reservation status change
export async function notifyReservationStatus(userEmail: string, reservationInfo: any) {
  const emailEnabled = await isNotificationEnabled('emailNotifications', 'reservationStatus');
  const smsEnabled = await isNotificationEnabled('smsNotifications', 'reservationConfirmation');

  const statusText = reservationInfo.status === 'approved' ? 'onaylandı' : 'reddedildi';
  const message = `${reservationInfo.title} rezervasyonunuz ${statusText}.`;

  if (emailEnabled) {
    await sendEmailNotification({
      to: userEmail,
      subject: 'Rezervasyon Durumu',
      message,
      type: 'email',
    });
  }

  if (smsEnabled && reservationInfo.phone) {
    await sendSMSNotification({
      to: reservationInfo.phone,
      message,
      type: 'sms',
    });
  }
}

// Notify on new announcement
export async function notifyNewAnnouncement(announcement: any, allUserEmails: string[]) {
  const enabled = await isNotificationEnabled('emailNotifications', 'announcements');
  if (!enabled) return;

  const isUrgent = announcement.priority === 'urgent';
  const smsEnabled = await isNotificationEnabled('smsNotifications', 'urgentAnnouncements');

  // Send email to all users
  for (const email of allUserEmails) {
    await sendEmailNotification({
      to: email,
      subject: isUrgent ? `🚨 ACİL: ${announcement.title}` : announcement.title,
      message: announcement.content,
      type: 'email',
    });
  }

  // If urgent, also send SMS (if enabled)
  if (isUrgent && smsEnabled) {
    // TODO: Get user phones and send SMS
  }
}

// Get password policy requirements as text
export async function getPasswordPolicyText(): Promise<string> {
  try {
    const settings = await Settings.findOne({ type: 'security' });
    const policy = settings?.settings?.passwordPolicy || {
      minLength: 6,
      requireUppercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    };

    const requirements = [];
    requirements.push(`En az ${policy.minLength} karakter`);
    if (policy.requireUppercase) requirements.push('En az 1 büyük harf');
    if (policy.requireNumbers) requirements.push('En az 1 rakam');
    if (policy.requireSpecialChars) requirements.push('En az 1 özel karakter');

    return requirements.join(', ');
  } catch (error) {
    return 'En az 6 karakter';
  }
}

