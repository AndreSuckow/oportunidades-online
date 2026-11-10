import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
export const id = () => randomUUID();
export const token = () => randomBytes(32).toString('base64url');
export const hash = value => createHash('sha256').update(value).digest('hex');
export function openDB(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, google_sub TEXT UNIQUE NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL, demo INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), csrf TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS oauth(hash TEXT PRIMARY KEY, verifier TEXT NOT NULL, nonce TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL, data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1);
    CREATE INDEX IF NOT EXISTS records_owner ON records(owner,kind);
    CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, mime TEXT NOT NULL, content BLOB NOT NULL, created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS invites(id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES users(id), email TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL, status TEXT NOT NULL, expires INTEGER NOT NULL, accepted_by TEXT REFERENCES users(id), created TEXT NOT NULL);
    CREATE UNIQUE INDEX IF NOT EXISTS unique_active_invite ON invites(owner,email) WHERE status IN ('pending','accepted','sending');
  `);
  if (!db.prepare('PRAGMA table_info(invites)').all().some(c=>c.name==='role')) db.exec("ALTER TABLE invites ADD COLUMN role TEXT NOT NULL DEFAULT 'viewer' CHECK(role IN ('viewer','contributor'))");
  if (!db.prepare('PRAGMA table_info(users)').all().some(c=>c.name==='picture')) db.exec("ALTER TABLE users ADD COLUMN picture TEXT NOT NULL DEFAULT ''");
  return db;
}
export function workspaceRole(db,user,owner) {
  if(user===owner)return 'owner';
  return db.prepare("SELECT role FROM invites WHERE owner=? AND accepted_by=? AND status='accepted'").get(owner,user)?.role || null;
}
export function canRead(db, user, owner) {
  return user === owner || !!db.prepare("SELECT id FROM invites WHERE owner=? AND accepted_by=? AND status='accepted'").get(owner, user);
}
export function reserveInvite(db, owner, email, role='viewer') {
  if(!['viewer','contributor'].includes(role)) throw Object.assign(new Error('Perfil inválido.'),{status:400});
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare("UPDATE invites SET status='expired' WHERE status IN ('pending','sending') AND expires < ?").run(Date.now());
    const count = db.prepare("SELECT count(*) AS n FROM invites WHERE owner=? AND status IN ('pending','accepted','sending')").get(owner).n;
    if (count >= 3) throw Object.assign(new Error('Você já tem três convites ativos. Revogue um para convidar outra pessoa.'), { status: 409 });
    if (db.prepare("SELECT id FROM invites WHERE owner=? AND email=? AND status IN ('pending','accepted','sending')").get(owner,email)) throw Object.assign(new Error('Este e-mail já está convidado.'), {status:409});
    const raw = token(), invitation = { id:id(), owner, email, status:'sending', expires:Date.now()+7*86400000, created:new Date().toISOString() };
    db.prepare('INSERT INTO invites(id,owner,email,token_hash,status,expires,created) VALUES(?,?,?,?,?,?,?)').run(invitation.id,owner,email,hash(raw),invitation.status,invitation.expires,invitation.created);
    db.prepare('UPDATE invites SET role=? WHERE id=?').run(role,invitation.id);
    db.exec('COMMIT'); return {...invitation,role,raw};
  } catch(e) { db.exec('ROLLBACK'); throw e; }
}
export function acceptInvite(db, raw, user) {
  const invite = db.prepare('SELECT * FROM invites WHERE token_hash=?').get(hash(raw));
  if (!invite || invite.expires < Date.now() || !['pending','accepted'].includes(invite.status)) throw Object.assign(new Error('Convite expirado ou revogado. Peça um novo convite.'),{status:410});
  if (invite.email !== user.email.toLowerCase() || invite.owner === user.id) throw Object.assign(new Error('Entre com a conta Google do e-mail que recebeu este convite.'),{status:403});
  if(invite.status==='accepted' && invite.accepted_by!==user.id) throw Object.assign(new Error('Convite já utilizado.'),{status:403});
  db.prepare("UPDATE invites SET status='accepted', accepted_by=? WHERE id=?").run(user.id,invite.id);
  return {owner:invite.owner};
}
export function listRecords(db, owner, kind) { return db.prepare('SELECT * FROM records WHERE owner=? AND kind=? ORDER BY rowid DESC').all(owner,kind).map(r=>({...JSON.parse(r.data), id:r.id, version:r.version})); }
