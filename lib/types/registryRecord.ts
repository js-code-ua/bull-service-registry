export class ServiceInstance {
  id: string;
  timestamp: Date;

  constructor(id: string, timestamp: Date) {
    this.id = id;
    this.timestamp = timestamp;
  }
}

export class RegistryRecord {
  name: string;
  url: string;
  instances: Array<ServiceInstance>;

  constructor(name: string, url: string, instances: Array<ServiceInstance>) {
    this.name = name;
    this.url = url;
    this.instances = instances;
  }
}
