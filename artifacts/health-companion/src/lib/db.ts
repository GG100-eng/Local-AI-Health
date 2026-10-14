import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ChatMessage, JournalEntry } from "./types";

interface Schema extends DBSchema {
  messages: {
    key: string;
    value: ChatMessage;
    indexes: { "by-ts": number };
  };
  journal: {
    key: string;
    value: JournalEntry;
    indexes: { "by-ts": number };
  };
}

const DB_NAME = "health-companion";
const VERSION = 1;
let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;

export function getDb(): Promise<IDBPDatabase<Schema>> {
  if (!dbPromise) {
    dbPromise = openDB<Schema>(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("messages")) {
          const store = db.createObjectStore("messages", { keyPath: "id" });
          store.createIndex("by-ts", "ts");
        }
        if (!db.objectStoreNames.contains("journal")) {
          const store = db.createObjectStore("journal", { keyPath: "id" });
          store.createIndex("by-ts", "ts");
        }
      },
    });
  }
  return dbPromise;
}

// Chat messages -----------------------------------------------------------
export async function saveMessage(m: ChatMessage): Promise<void> {
  const db = await getDb();
  await db.put("messages", m);
}

export async function loadMessages(): Promise<ChatMessage[]> {
  const db = await getDb();
  return db.getAllFromIndex("messages", "by-ts");
}

export async function clearMessages(): Promise<void> {
  const db = await getDb();
  await db.clear("messages");
}

// Journal -----------------------------------------------------------------
export async function saveJournalEntry(e: JournalEntry): Promise<void> {
  const db = await getDb();
  await db.put("journal", e);
}

export async function loadJournalEntries(): Promise<JournalEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("journal", "by-ts");
  return all.reverse(); // newest first
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("journal", id);
}
