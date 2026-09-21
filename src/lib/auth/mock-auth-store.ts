import "server-only";
import { randomUUID } from "crypto";

/**
 * In-memory mock user directory, mirroring the pattern already used for
 * classes/bookings (InMemoryClassStore in lib/services/booking-service.ts).
 * DEV/MOCK ONLY: passwords are stored in plain text in memory, purely to
 * simulate credential checking without a real backend. This code path is
 * only ever reachable when NEXT_PUBLIC_USE_MOCK_DATA is not explicitly
 * "false" — see lib/auth/auth-service.ts's getAuthService() factory, which
 * is the single place that decides Mock vs Supabase.
 */
export interface MockAuthUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string;
}

class MockAuthStore {
  private static instance: MockAuthStore;
  users: Map<string, MockAuthUser> = new Map();

  private constructor() {}

  static get(): MockAuthStore {
    if (!MockAuthStore.instance) {
      MockAuthStore.instance = new MockAuthStore();
    }
    return MockAuthStore.instance;
  }

  findByEmail(email: string): MockAuthUser | undefined {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.users.values()).find((u) => u.email === normalized);
  }

  findById(id: string): MockAuthUser | undefined {
    return this.users.get(id);
  }

  create(input: { email: string; password: string; firstName: string; lastName: string }): MockAuthUser {
    const user: MockAuthUser = {
      id: randomUUID(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      // Mock mode skips real email delivery, so accounts are marked
      // unverified but the verify-email screen simulates the wait; a
      // "resend" click in mock mode immediately marks it verified so the
      // rest of the flow (login → dashboard) can be exercised end to end.
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  markVerified(id: string): void {
    const user = this.users.get(id);
    if (user) user.emailVerified = true;
  }

  updatePassword(id: string, password: string): void {
    const user = this.users.get(id);
    if (user) user.password = password;
  }

  delete(id: string): void {
    this.users.delete(id);
  }
}

export function getMockAuthStore(): MockAuthStore {
  return MockAuthStore.get();
}
