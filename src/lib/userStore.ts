import bcrypt from "bcryptjs";

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MINUTES = 10;

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

type AttemptInfo = {
  count: number;
  lockedUntil?: number;
};

const users = new Map<string, StoredUser>();
const loginAttempts = new Map<string, AttemptInfo>();
let incrementalId = 1;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export class UserExistsError extends Error {
  constructor() {
    super("USER_ALREADY_EXISTS");
    this.name = "UserExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("INVALID_CREDENTIALS");
    this.name = "InvalidCredentialsError";
  }
}

export class AccountLockedError extends Error {
  lockedUntil: Date;

  constructor(lockedUntil: Date) {
    super("ACCOUNT_LOCKED");
    this.name = "AccountLockedError";
    this.lockedUntil = lockedUntil;
  }
}

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(email);
  if (users.has(normalizedEmail)) {
    throw new UserExistsError();
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    id: `${incrementalId++}`,
    name,
    email: normalizedEmail,
    passwordHash,
  };

  users.set(normalizedEmail, user);
  loginAttempts.delete(normalizedEmail);

  return {
    id: user.id,
    name: user.name,
    email: normalizedEmail,
  };
}

const registerFailedAttempt = (email: string): AttemptInfo => {
  const normalized = normalizeEmail(email);
  const attempt = loginAttempts.get(normalized) ?? { count: 0 };
  attempt.count += 1;

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil =
      Date.now() + LOCK_DURATION_MINUTES * 60 * 1000;
  }

  loginAttempts.set(normalized, attempt);
  return attempt;
};

export async function verifyCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const attemptInfo = loginAttempts.get(normalizedEmail);

  if (
    attemptInfo?.lockedUntil !== undefined &&
    attemptInfo.lockedUntil > Date.now()
  ) {
    throw new AccountLockedError(new Date(attemptInfo.lockedUntil));
  }

  const user = users.get(normalizedEmail);
  if (!user) {
    registerFailedAttempt(normalizedEmail);
    throw new InvalidCredentialsError();
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const info = registerFailedAttempt(normalizedEmail);
    if (info.lockedUntil) {
      throw new AccountLockedError(new Date(info.lockedUntil));
    }
    throw new InvalidCredentialsError();
  }

  loginAttempts.delete(normalizedEmail);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function getLockExpiration(email: string) {
  const normalized = normalizeEmail(email);
  const info = loginAttempts.get(normalized);
  if (!info?.lockedUntil) {
    return undefined;
  }
  return new Date(info.lockedUntil);
}
