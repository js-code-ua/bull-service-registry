import * as io from 'socket.io';
import * as ioRedis from 'socket.io-redis';
import * as bullQueue from 'bull';

import { redisOptions } from '../types/redisOptions.interface';
import { queueName, registerEvent, registryKey } from '../types/constants';
import { queueAction } from '../types/queueAction.enum';
import { RegistryEvent, RegisterEventData, DeregisterEventData } from '../types/registryEvent';

import connectionMiddleware from './middlewares/connection';
import connectionHandler from './events/connection';
import { RedisWrapper } from '../redis';
import { RegistryRecord, ServiceInstance } from '../types/registryRecord';

class RegistryService {
    private server: io.Server;
    private registryQueue: bullQueue.Queue;
    private redis: RedisWrapper;

    constructor(
        port: number,
        options: redisOptions,
    ) {
        this.redis = new RedisWrapper(options);
        this.server = io(port);
        this.server.adapter(ioRedis({
            host: options.host,
            port: options.port,
        }));
        this.server.use(connectionMiddleware);

        this.registryQueue = this.initQueue(options);
        this.registryQueue.process(this.queueConsumer.bind(this));

        this.server.on('connection', connectionHandler(this.registryQueue));
    }

    private initQueue(options?: redisOptions): bullQueue.Queue {
        if (options) {
            return new bullQueue(queueName, { redis: options });
        }
        return new bullQueue(queueName);
    }

    private async register(data: RegistryEvent<RegisterEventData>): Promise<any> {
        try {
            const registryRow = JSON.parse((await this.redis.getAsync(registryKey)));
            const { name, id, url } = data.payload;

            if (registryRow) {
                if (registryRow[name]) {
                    registryRow[name].instances.push(new ServiceInstance(id, new Date()));
                    registryRow[name].url = url;

                    await this.redis.setAsync(registryKey, JSON.stringify(registryRow));
                }
                else {
                    registryRow[name] = new RegistryRecord(
                        name,
                        url,
                        [new ServiceInstance(id, new Date())]
                    );

                    await this.redis.setAsync(registryKey, JSON.stringify(registryRow));
                }
            }
            else {
                await this.redis.setAsync(registryKey, JSON.stringify({
                    [name]: new RegistryRecord(
                        name,
                        url,
                        [new ServiceInstance(id, new Date())]
                    )
                }));
            }
            this.server.emit(registerEvent(data.payload.id));
        } catch (e) {
            console.log('Register Error: ', e);
        }
    }

    private async deregister(data: RegistryEvent<DeregisterEventData>) {
        try {
            const { name, instanceId } = data.payload;
        }
        catch (e) {
            console.log('Deregister Error: ', e)
        }
    }

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