// Gmail API client for sending emails via OAuth

export interface GmailMessage {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

// Encode email to base64 URL-safe format
export const encodeEmail = (message: GmailMessage): string => {
  const emailHeaders = [
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    ...(message.cc ? [`Cc: ${message.cc}`] : []),
    ...(message.bcc ? [`Bcc: ${message.bcc}`] : []),
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
  ].join("\r\n");

  const emailBody = `${emailHeaders}\r\n\r\n${message.body}`;

  // Convert to base64 URL-safe
  const base64 = Buffer.from(emailBody).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

// Send email via Gmail API
export const sendEmailViaGmail = async (
  accessToken: string,
  message: GmailMessage,
): Promise<{ messageId: string; threadId: string }> => {
  const encodedMessage = encodeEmail(message);

  const response = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    },
  );

  if (response.status === 401) {
    throw new Error("Gmail authentication expired. Please re-authenticate.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to send email: ${error.error?.message || response.statusText}`,
    );
  }

  const result = await response.json();
  return {
    messageId: result.id,
    threadId: result.threadId,
  };
};

// Get user email address
export const getUserEmail = async (accessToken: string): Promise<string> => {
  const response = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/profile",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get user profile");
  }

  const result = await response.json();
  return result.emailAddress;
};
