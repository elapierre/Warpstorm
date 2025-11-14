// SyncEngine.ts
import axios from 'axios';
import { loadItemsFromDB, markItemSynced } from './../sqlite/db';
import { store, setItems } from './../sqlite/storeChanges';

export class SyncEngine {
  constructor(private apiUrl: string) {}

  async pushUpdates() {
    const items = await loadItemsFromDB();
    for (const item of items.filter((i) => i.synced === 0)) {
      try {
        await axios.post(`${this.apiUrl}/items`, item);
        markItemSynced(item.id); // update SQLite after success
      } catch (e) {
        console.warn('Failed to sync', item.id, e);
      }
    }
  }

  async pullUpdates(lastSync: string) {
    const { data } = await axios.get(`${this.apiUrl}/items?since=${lastSync}`);
    store.dispatch(setItems(data));
    // You could also persist these to SQLite here for offline
  }

  async sync(lastSync: string) {
    await this.pushUpdates();
    await this.pullUpdates(lastSync);
  }
}
