import { queueAction } from './queueAction.enum';

export class RegisterEventData {
  name: string;
  id: string;
  url: string;

  constructor(name: string, id: string, url: string) {
    this.name = name;
    this.id = id;
    this.url = url;
  }
}

export class DeregisterEventData {
  instanceId: string;
  name: string;

  constructor(instanceId: string, name: string) {
    this.instanceId = instanceId;
    this.name = name;
  }
}

export class RegistryEvent<T> {
  type: queueAction;
  payload: any;

  constructor(type: queueAction, payload: T) {
    this.type = type;
    this.payload = payload;
  }
}
