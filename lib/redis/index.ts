import * as Redis from 'redis';
import { promisify } from 'util';

export class RedisWrapper {
  private client: Redis.RedisClient;

  getAsync: Function;
  setAsync: Function;

  constructor(options?: Redis.ClientOpts) {
    this.client = this.initClient(options);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
  }

  private initClient(options?: Redis.ClientOpts): Redis.RedisClient {
    const client = options ? Redis.createClient(options) : Redis.createClient();

    client.on('error', function(err) {
      console.log('RedisError: ' + err);
    });

    return client;
  }
}
