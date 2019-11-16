import * as io from 'socket.io';
import * as ioRedis from 'socket.io-redis';
import * as bullQueue from 'bull';

import { redisOptions } from '../types/redisOptions.interface';
import { queueName, registerEvent, deregisterEvent, registryKey } from '../types/constants';
import { queueAction } from '../types/queueAction.enum';
import { RegistryEvent, RegisterEventData, DeregisterEventData } from '../types/registryEvent';

import connectionMiddleware from './middlewares/connection';
import connectionHandler from './events/connection';
import { RedisWrapper } from '../redis';
import { RegistryRecord, ServiceInstance } from '../types/registryRecord';

export class RegistryBase {
  private redis: RedisWrapper;
  private RegistryQueue: bullQueue.Queue;

  constructor(options: redisOptions) {
    this.redis = new RedisWrapper(options);
    this.RegistryQueue = this.initQueue(options);
  }

  private initQueue(options?: redisOptions): bullQueue.Queue {
    if (options) {
      return new bullQueue(queueName, { redis: options });
    }
    return new bullQueue(queueName);
  }

  get registryQueue() {
    return this.RegistryQueue;
  }

  public async getRecordSet() {
    const registryRow = JSON.parse(await this.redis.getAsync(registryKey));

    return registryRow;
  }

  public async setRecordSet(registryObject: object) {
    return await this.redis.setAsync(registryKey, JSON.stringify(registryObject));
  }
}

class RegistryService extends RegistryBase {
  private server: io.Server;

  constructor(port: number, options: redisOptions) {
    super(options);
    this.server = io(port);
    this.server.adapter(
      ioRedis({
        host: options.host,
        port: options.port,
      }),
    );
    this.server.use(connectionMiddleware);
    this.registryQueue.process(this.queueConsumer.bind(this));
    this.server.on('connection', connectionHandler(this.registryQueue));
  }

  private async register(data: RegistryEvent<RegisterEventData>): Promise<any> {
    try {
      const registryRow = await this.getRecordSet();
      const { name, id, url } = data.payload;

      if (registryRow) {
        if (registryRow[name]) {
          registryRow[name].instances.push(new ServiceInstance(id, new Date()));
          registryRow[name].url = url;

          await this.setRecordSet(registryRow);
        } else {
          registryRow[name] = new RegistryRecord(name, url, [new ServiceInstance(id, new Date())]);

          await this.setRecordSet(registryRow);
        }
      } else {
        await this.setRecordSet({
          [name]: new RegistryRecord(name, url, [new ServiceInstance(id, new Date())]),
        });
      }
      const event = registerEvent(data.payload.id);

      this.server.emit(event);
      console.log(`[Info]: ${event}`);
    } catch (e) {
      console.log('Register Error: ', e);
    }
  }

  private deregister = async (data: RegistryEvent<DeregisterEventData>) => {
    try {
      const { name, instanceId } = data.payload;
      const registryRow = await this.getRecordSet();
      const targetService = registryRow ? registryRow[name] : null;

      if (targetService) {
        if (targetService.instances.length > 1) {
          targetService.instances = targetService.instances.filter((x: ServiceInstance) => x.id !== instanceId);
        } else {
          delete registryRow[name];
        }
        await this.setRecordSet(registryRow);

        const event = deregisterEvent(instanceId);

        this.server.emit(event);
        console.log(`[Info]: ${event}`);
      }
    } catch (e) {
      console.log('Deregister Error: ', e);
    }
  };

  private queueConsumer(job: bullQueue.Job) {
    switch (job.data.type) {
      case queueAction.Register:
        return this.register(job.data);
      case queueAction.Deregister:
        return this.deregister(job.data);
      default:
        console.log('Unknown queue action type!');
        return Promise.reject('Unknown queue action type!');
    }
  }
}

export default RegistryService;
