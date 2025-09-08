export const schema = {
  version: 2,
  stores: {
    // compound index: unique uuid, plus quick per-user chronological queries
    dataItems: '&uuid, userId, timestamp, name, value, [userId+timestamp]'
  }
}
