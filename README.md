# bull-service-registry
services registry based on redis and bull queue

# To install bull-service-registry use this cmd:
```bash
npm i bull-service-registry --save
```
# Or using Yarn:
```bash
yarn add bull-service-registry
```
# Registry Server
```js
import { RegistryServer } from 'bull-service-registry';

const redisOptions = {
   port: 6379,
   host: 'localhost',
};
const port = 3001;

const registryServer = new RegistryServer(port, redisOptions);
```

# Registry Client
```js
import { RegistryClient } from 'bull-service-registry';

const redisOptions = {
   port: 6379,
   host: 'localhost',
};
const timeout = 3000; // ms
const registryClient = new RegistryClient(
      'test-service-name',
      'http://localhost:8080', // service url
      'http://localhost:3001', // registry server url
      redisOptions,
      timeout // registry() / deregistry() actions timeout
);

await registryClient.register(); // { done: true }

const serviceMeta = await registryClient.getServiceByName('test-service-name');
/*

{ name: 'test-service-name',
  url: 'http://localhost:8080',
  instances:
   [ { id: 'e2571486-9251-47d8-87b7-a53137dcfce7',
       timestamp: '2019-11-16T13:08:36.700Z' } ] 
}

*/

await registryClient.deregister() // { done: true }

const serviceMeta = await registryClient.getServiceByName('test-service-name'); // null
```
