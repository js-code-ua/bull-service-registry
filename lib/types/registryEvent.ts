import { queueAction } from './queueAction.enum';

export class EventData {
    name: string;
    id: string;
    url: string;

    constructor(name: string, id: string, url: string){
        this.name = name;
        this.id = id;
        this.url = url;
    }
}

export class RegistryEvent {
    type: queueAction;
    payload: EventData;

    constructor (type: queueAction, payload: EventData) {
        this.type = type;
        this.payload = payload;
    }
}