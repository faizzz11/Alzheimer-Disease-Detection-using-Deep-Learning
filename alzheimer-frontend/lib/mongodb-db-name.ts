export function dbName() {
  return process.env.MONGODB_DB_NAME ?? "lr_hacks";
}
