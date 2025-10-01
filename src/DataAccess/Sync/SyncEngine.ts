import axios from 'axios';
import { loadItemsFromDB } from '../Persist/DB';
import { store, setItems } from '../Persist/StoreChanges';

export class SyncEngine {
  constructor(private apiUrl: string) {}

  async pushUpdates() {
    loadItemsFromDB(async (items) => {
      for (const item of items.filter((i) => i.synced === 0)) {
        try {
          await axios.post(`${this.apiUrl}/items`, item);
          // you could mark them synced in SQLite here
        } catch (e) {
          console.warn('Failed to sync', item.id, e);
        }
      }
    });
  }

  async pullUpdates(lastSync: string) {
    const { data } = await axios.get(`${this.apiUrl}/items?since=${lastSync}`);
    // update Redux directly
    store.dispatch(setItems(data));
    // also persist to SQLite if needed
  }

  async sync(lastSync: string) {
    await this.pushUpdates();
    await this.pullUpdates(lastSync);
  }
}
