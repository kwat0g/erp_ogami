import bcrypt from 'bcryptjs';
import { query, queryOne } from './db';
import { User } from '@/types/database';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT id, email, username, password, first_name as firstName, 
           last_name as lastName, role, department, is_active as isActive,
           last_login as lastLogin, created_at as createdAt, updated_at as updatedAt
    FROM users 
    WHERE email = ? AND is_active = TRUE
  `;
  return queryOne<User>(sql, [email]);
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const sql = `
    SELECT id, email, username, password, first_name as firstName, 
           last_name as lastName, role, department, is_active as isActive,
           last_login as lastLogin, created_at as createdAt, updated_at as updatedAt
    FROM users 
    WHERE username = ? AND is_active = TRUE
  `;
  return queryOne<User>(sql, [username]);
}

export async function findUserById(id: string): Promise<User | null> {
  const sql = `
    SELECT id, email, username, password, first_name as firstName, 
           last_name as lastName, role, department, is_active as isActive,
           last_login as lastLogin, created_at as createdAt, updated_at as updatedAt
    FROM users 
    WHERE id = ? AND is_active = TRUE
  `;
  return queryOne<User>(sql, [id]);
}

export async function updateLastLogin(userId: string): Promise<void> {
  const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
  await query(sql, [userId]);
}

export async function createSession(userId: string, token: string, expiresAt: Date): Promise<void> {
  const sql = 'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)';
  await query(sql, [userId, token, expiresAt]);
}

export async function findSessionByToken(token: string): Promise<any | null> {
  const sql = `
    SELECT s.id, s.user_id as userId, s.token, s.expires_at as expiresAt,
           u.email, u.username, u.first_name as firstName, u.last_name as lastName,
           u.role, u.department, u.employee_id as employeeId
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = TRUE
  `;
  return queryOne(sql, [token]);
}

export async function deleteSession(token: string): Promise<void> {
  const sql = 'DELETE FROM sessions WHERE token = ?';
  await query(sql, [token]);
}

export async function deleteExpiredSessions(): Promise<void> {
  const sql = 'DELETE FROM sessions WHERE expires_at < NOW()';
  await query(sql);
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  if (userRole === 'ADMIN') return true;
  return requiredRoles.includes(userRole);
}
