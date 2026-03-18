import Ably from 'ably';

let client: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (!client) {
    client = new Ably.Realtime({ authUrl: '/api/ably-token' });
  }
  return client;
}

export function destroyAblyClient() {
  if (client) {
    client.close();
    client = null;
  }
}
