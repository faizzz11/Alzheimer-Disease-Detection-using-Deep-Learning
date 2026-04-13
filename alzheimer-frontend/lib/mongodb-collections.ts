import getMongoClient from "@/lib/mongodb";
import type { Account, User } from "@/models/User";

function dbName() {
  return process.env.MONGODB_DB_NAME ?? "zenit";
}

export async function getCollections() {
  const client = await getMongoClient();
  const db = client.db(dbName());
  return {
    users: db.collection<User>("users"),
    accounts: db.collection<Account>("accounts"),
    shopEntitlements: db.collection("shop_entitlements"),
    payments: db.collection("payments"),
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { users } = await getCollections();
    return users.findOne({ email });
  } catch {
    return null;
  }
}
