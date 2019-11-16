import { RegistryServer, RegistryClient } from '..';
import { expect } from 'chai';

describe('Itin client end server / register', function () {
    it('Register - Done', async function () {
        const tymeout: number = 3000;
        const redisOptions = {
            port: 6379,
            host: 'localhost',
        };
        const registryServer = new RegistryServer(3001, redisOptions);
        const registryClient = new RegistryClient(
            'test-register',
            'http://localhost',
            'http://localhost:3001',
            redisOptions,
            tymeout
        );

        await registryClient.register();

        const serviceMeta = await registryClient.getServiceByName('test-register');

        expect(Boolean(serviceMeta)).to.equal(true);
    });
});