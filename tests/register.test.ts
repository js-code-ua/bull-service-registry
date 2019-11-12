import { RegistryServer, RegistryClient } from '..';

describe('Actions', function () {
    it('Register', async function () {

        const registryServer = new RegistryServer(3001, {
            port: 6379,
            host: 'localhost',
        });

        const registryClient = new RegistryClient(
            'test',
            'http://localhost',
            'http://localhost:3001'
        );

        await registryClient.register();
    });
});