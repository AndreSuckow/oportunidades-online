import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,unlinkSync,rmdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {openDB} from '../server/db.js';

test('existing invitations migrate to viewer without losing data, and migration is repeatable',()=>{
 const directory=mkdtempSync(join(tmpdir(),'opportunities-migration-')),path=join(directory,'old.sqlite');
 let db=new DatabaseSync(path);
 try {
  db.exec("CREATE TABLE users(id TEXT PRIMARY KEY,google_sub TEXT UNIQUE NOT NULL,email TEXT NOT NULL,name TEXT NOT NULL,demo INTEGER NOT NULL DEFAULT 0); INSERT INTO users VALUES('owner','sub','owner@example.com','Titular',0); CREATE TABLE invites(id TEXT PRIMARY KEY,owner TEXT,email TEXT,token_hash TEXT,status TEXT,expires INTEGER,accepted_by TEXT,created TEXT); INSERT INTO invites VALUES('old','owner','guest@example.com','hash','accepted',0,'guest','2026-11-10');");
  db.close();db=openDB(path);
  assert.equal(db.prepare("SELECT role FROM invites WHERE id='old'").get().role,'viewer');
  assert.equal(db.prepare("SELECT accepted_by FROM invites WHERE id='old'").get().accepted_by,'guest');
  assert.equal(db.prepare("SELECT picture FROM users WHERE id='owner'").get().picture,'');
  assert.equal(db.prepare("SELECT name FROM users WHERE id='owner'").get().name,'Titular');
  db.close();db=openDB(path);assert.equal(db.prepare('SELECT count(*) AS n FROM invites').get().n,1);
 } finally {db.close();for(const file of [path,path+'-wal',path+'-shm']){try{unlinkSync(file);}catch(e){if(e.code!=='ENOENT')throw e;}}rmdirSync(directory);}
});
