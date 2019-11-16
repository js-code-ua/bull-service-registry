import { v4 as uuid } from 'uuid';
import * as io from 'socket.io-client';

import { redisOptions } from '../types/redisOptions.interface';
import { registerEvent, deregisterEvent } from '../types/constants';
import { RegistryEvent, RegisterEventData, DeregisterEventData } from '../types/registryEvent';
import { queueAction } from '../types/queueAction.enum';
import { RegistryBase } from '../server';

class RegistryClient extends RegistryBase {
    readonly name: string;
    readonly url: string;
    readonly instanceId: string;
    readonly timeout: number;
    readonly registryUrl: string;

    private client: SocketIOClient.Socket;

    constructor(
        serviceName: string,
        url: string,
        registryUrl: string,
        options?: redisOptions,
        timeout?: number,
    ) {
        super(options || { port: 6379, host: 'localhost' });

        this.name = serviceName;
        this.url = url;
        this.instanceId = uuid();
        this.registryUrl = registryUrl;
        this.timeout = timeout || 3000;

        this.client = this.connect(this.registryUrl);
    }

    private connect(registryUrl: string): SocketIOClient.Socket {
        return io(registryUrl, {
            query: {
                instanceId: this.instanceId,
                name: this.name,
            }
        });
    }

    private reconnect() {
        if (this.client.disconnected) {
            this.client = this.connect(this.registryUrl);
        }
    }

    public async register(): Promise<any> {
        this.reconnect();

        const Job = await this.registryQueue.add(
            new RegistryEvent<RegisterEventData>(
                queueAction.Register,
                new RegisterEventData(this.name, this.instanceId, this.url)
            )
        );

        await new Promise((resolve, reject) => {
            this.client.on(registerEvent(this.instanceId), resolve);
            setTimeout(reject, this.timeout);
        });

        return { done: true };
    }

    public async deregister(): Promise<any> {
        this.reconnect();

        const event = deregisterEvent(this.instanceId);

        this.registryQueue.add(
            new RegistryEvent<DeregisterEventData>(
                queueAction.Deregister,
                new DeregisterEventData(this.instanceId, this.name)
            )
        );

        await new Promise((resolve, reject) => {
            this.client.once(event, resolve);
            setTimeout(reject, this.timeout);
        });

        return { done: true }
    }

    public async getServiceByName(name: string): Promise<object> {
        const registryRow = await this.getRecordSet();

        if (!registryRow) {
            throw new Error('Registry Entity is unavaliable!')
        }

        return registryRow[name] || null;
    }
}

export default RegistryClient;