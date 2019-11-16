import { RegistryServer, RegistryClient } from '..';
import { expect } from 'chai';

describe('Itin client end server / deregister', function () {
    it('Deregister - Done', async function () {
        const tymeout: number = 3000;
        const redisOptions = {
            port: 6379,
            host: 'localhost',
        };
        const registryServer = new RegistryServer(3002, redisOptions);
        const registryClient = new RegistryClient(
            'test-deregister',
            'http://localhost',
            'http://localhost:3002',
            redisOptions,
            tymeout
        );

        const r = await registryClient.register();
        console.log('register(): ', r);

        const d = await registryClient.deregister();
        console.log('deregister(): ', d);


        const serviceMeta = await registryClient.getServiceByName('test-deregister');
        expect(Boolean(serviceMeta)).to.equal(false);
    });
});