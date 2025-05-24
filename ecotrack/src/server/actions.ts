// Server actions for authentication, user management, and communications
import { db } from "./db";
import { User } from "../utils/api";
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

// Session information stored in the database
interface Session {
  userId: string;
  token: string;
  expiresAt: Date;
  role: 'client' | 'manager' | 'logistic' | 'admin';
}

// Authentication actions
export const getAuth = async (token?: string) => {
  if (!token && process.env.NODE_ENV === 'development') {
    return {
      userId: "user-1",
      status: "authenticated" as const,
      role: 'client' as const,
    };
  }

  if (!token) {
    return { userId: null, status: 'unauthenticated' as const, role: null };
  }

  await db.session.deleteExpired();
  const session = await db.session.findByToken(token);
  if (session) {
    return {
      userId: session.user_id,
      status: 'authenticated' as const,
      role: session.role as Session['role'],
    };
  }

  return { userId: null, status: 'unauthenticated' as const, role: null };
};

// Email sending action
export const sendEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  // In a real application, you would integrate with an email service 
  // like SendGrid, Mailgun, AWS SES, etc.
  console.log(`Email sent to ${options.to}: ${options.subject}`);
  if (options.html) {
    console.log("HTML content:", options.html.substring(0, 100) + (options.html.length > 100 ? '...' : ''));
  } else if (options.text) {
    console.log("Text content:", options.text.substring(0, 100) + (options.text.length > 100 ? '...' : ''));
  }
  
  return { success: true, messageId: `msg_${Date.now()}` };
};

// Authentication and user management functions
export const signIn = async (email: string, password: string, totp?: string): Promise<{token: string, user: User, role: string}> => {
  await db.session.deleteExpired();
  const user = await db.user.findUnique({
    where: { email }
  });

  const passwordHash = (user as any)?.passwordHash || (user as any)?.password_hash;

  if (!user || !passwordHash || !(await bcrypt.compare(password, passwordHash))) {
    throw new Error("Invalid credentials");
  }

  const secret = (user as any).totpSecret || (user as any).totp_secret;
  if (secret && !speakeasy.totp.verify({ secret, encoding: 'base32', token: totp || '' })) {
    throw new Error('Invalid verification code');
  }

  const token = `token_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  // Determine role based on user data
  let role: 'client' | 'manager' | 'logistic' | 'admin' = 'client';
  if (user.isAdmin) {
    role = 'admin';
  } else if (email.endsWith('@manager.com')) {
    role = 'manager';
  } else if (email.endsWith('@logistic.com')) {
    role = 'logistic';
  }
  
  const session: Session = { userId: user.id, token, expiresAt, role };
  await db.session.create(session);
  
  return { token, user, role };
};

export const signUp = async (userData: {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}): Promise<{token: string, user: User, role: string}> => {
  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: userData.email }
  });
  
  if (existingUser) {
    throw new Error("Email already in use");
  }
  
  const passwordHash = await bcrypt.hash(userData.password, 10);
  const totpSecret = speakeasy.generateSecret({ length: 20 }).base32;
  const newUser = await db.user.create({
    name: userData.name,
    email: userData.email,
    passwordHash,
    totpSecret,
    companyName: userData.companyName || "",
    isAdmin: false,
    dashboardSettings: JSON.stringify([
      { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
      { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
      { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
    ])
  });
  
  // Generate a token and create session
  const token = `token_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  // Determine role based on email domain
  let role: 'client' | 'manager' | 'logistic' | 'admin' = 'client';
  if (userData.email.endsWith('@manager.com')) {
    role = 'manager';
  } else if (userData.email.endsWith('@logistic.com')) {
    role = 'logistic';
  } else if (userData.email.endsWith('@admin.com')) {
    role = 'admin';
  }
  
  // Create session
  const session: Session = {
    userId: newUser.id,
    token,
    expiresAt,
    role
  };

  await db.session.create(session);

  return { token, user: newUser, role };
};

export const signOut = async (token: string): Promise<void> => {
  await db.session.deleteByToken(token);
};

// Helper functions for API
export const requireAuth = async (token?: string) => {
  const auth = await getAuth(token);
  if (auth.status !== "authenticated") {
    throw new Error("Authentication required");
  }
  return auth;
};

export const requireAdmin = async (token?: string) => {
  const auth = await getAuth(token);
  if (auth.status !== "authenticated" || auth.role !== 'admin') {
    throw new Error("Admin privileges required");
  }
  return auth;
};

export const getUserById = async (userId: string) => {
  return db.user.findUnique({
    where: { id: userId }
  });
};

export const updateUser = async (userId: string, data: any) => {
  return db.user.update({
    where: { id: userId },
    data
  });
};

// Order-related actions
export const updateOrderPaymentStatus = async (orderId: string, status: string) => {
  return db.order.update({
    where: { id: orderId },
    data: { paymentStatus: status }
  });
};

// Export notifications to simulate real-time updates
export const sendPushNotification = async (userId: string, message: string) => {
  console.log(`[PUSH] Notification to user ${userId}: ${message}`);
  return { success: true };
};

export const sendSMS = async (phoneNumber: string, message: string) => {
  console.log(`[SMS] Message to ${phoneNumber}: ${message}`);
  return { success: true };
};