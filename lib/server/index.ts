import * as io from 'socket.io';
import * as ioRedis from 'socket.io-redis';
import * as bullQueue from 'bull';

import { redisOptions } from '../types/redisOptions.interface';
import { queueName, registerEvent } from '../types/constants';
import connectionMiddleware from './middlewares/connection';
import { queueAction } from '../types/queueAction.enum';
import { RegistryEvent } from '../types/registryEvent';

class RegistryService {
    private server: io.Server;
    private registryQueue: bullQueue.Queue;

    constructor(
        port: number,
        options: redisOptions,
    ) {
        this.server = io(port);
        this.server.adapter(ioRedis({
            host: options.host,
            port: options.port,
        }));
        this.server.use(connectionMiddleware);

        this.registryQueue = this.initQueue(options);
        this.registryQueue.process((job) => {
            switch (job.data.type) {
                case queueAction.Register:
                    this.register(job.data);
                    break;
                case queueAction.Deregister:
                    this.deregister(job.data);
                    break;
                default:
                    console.log('Unknown queue action type!');
            }
        })
    }

    private initQueue(options?: redisOptions): bullQueue.Queue {
        if (options) {
            return new bullQueue(queueName, { redis: options });
        }
        return new bullQueue(queueName);
    }

    private register(data: RegistryEvent) {
        // register into redis
        this.server.emit(registerEvent(data.payload.id));
    }

    private deregister(data: RegistryEvent) {
        // deregister
        // report if needed
    }
}

export default RegistryService;