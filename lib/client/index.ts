import { v4 as uuid } from 'uuid';
import * as bullQueue from 'bull';
import * as io from 'socket.io-client';

import { redisOptions } from '../types/redisOptions.interface';
import { queueName, registerEvent } from '../types/constants';
import { RegistryEvent, RegisterEventData } from '../types/registryEvent';
import { queueAction } from '../types/queueAction.enum';

class RegistryClient {
    name: string;
    url: string;
    instanceId: string;

    private registryQueue: bullQueue.Queue;
    private client: SocketIOClient.Socket;

    constructor(
        serviceName: string,
        url: string,
        registryUrl: string,
        redisUrl?: string,
        options?: redisOptions,
    ) {
        this.name = serviceName;
        this.url = url;
        this.instanceId = uuid();

        this.registryQueue = this.initQueue(redisUrl, options);
        this.client = this.connect(registryUrl);
    }

    private initQueue(redisUrl?: string, options?: redisOptions): bullQueue.Queue {
        if (redisUrl) {
            return new bullQueue(queueName, redisUrl);
        }
        else if (options) {
            return new bullQueue(queueName, { redis: options });
        }
        return new bullQueue(queueName);
    }

    private connect(registryUrl: string): SocketIOClient.Socket {
        return io(registryUrl, {
            query: {
                instanceId: this.instanceId,
                name: this.name,
            }
        });
    }

    async register(): Promise<any> {
        const Job = await this.registryQueue.add(
            new RegistryEvent<RegisterEventData>(
                queueAction.Register,
                new RegisterEventData(this.name, this.instanceId, this.url)
            )
        );

        return new Promise((resolve, reject) => {
            this.client.on(registerEvent(this.instanceId), resolve);
            setTimeout(reject, 3000);
        });
    }
}

export default RegistryClient;