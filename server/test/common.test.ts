import * as request from 'supertest';
import FireFly, {
  FireFlyOrganizationResponse,
  FireFlyStatusResponse,
  FireFlyVerifierResponse,
} from '@hyperledger/firefly-sdk';
import server from '../src/server';
import { firefly } from '../src/clients/firefly';

jest.mock('@hyperledger/firefly-sdk');
const mockFireFly = firefly as jest.MockedObject<FireFly>;

describe('Common Operations', () => {
  test('List organizations', async () => {
    const orgs = [
      { id: 'org1' } as FireFlyOrganizationResponse,
      { id: 'org2' } as FireFlyOrganizationResponse,
    ];

    mockFireFly.getOrganizations.mockResolvedValueOnce(orgs);

    await request(server)
      .get('/api/common/organizations')
      .expect(200)
      .expect([{ id: 'org1' }, { id: 'org2' }]);

    expect(mockFireFly.getOrganizations).toHaveBeenCalledWith();
  });

  test('List organizations without self', async () => {
    const status = { org: { id: 'org1' } } as FireFlyStatusResponse;
    const orgs = [
      { id: 'org1' } as FireFlyOrganizationResponse,
      { id: 'org2' } as FireFlyOrganizationResponse,
    ];

    mockFireFly.getStatus.mockResolvedValueOnce(status);
    mockFireFly.getOrganizations.mockResolvedValueOnce(orgs);

    await request(server)
      .get('/api/common/organizations?exclude_self=true')
      .expect(200)
      .expect([{ id: 'org2' }]);

    expect(mockFireFly.getStatus).toHaveBeenCalledWith();
    expect(mockFireFly.getOrganizations).toHaveBeenCalledWith();
  });

  test('Get self', async () => {
    const status = { org: { id: 'org1' } } as FireFlyStatusResponse;

    mockFireFly.getStatus.mockResolvedValueOnce(status);

    await request(server).get('/api/common/organizations/self').expect(200).expect({ id: 'org1' });

    expect(mockFireFly.getStatus).toHaveBeenCalledWith();
  });

  test('List verifiers', async () => {
    const orgs = [{ id: 'org1', did: 'did:org1' } as FireFlyOrganizationResponse];
    const verifiers = [{ identity: 'org1', value: '0x123' } as FireFlyVerifierResponse];

    mockFireFly.getOrganizations.mockResolvedValueOnce(orgs);
    mockFireFly.getVerifiers.mockResolvedValueOnce(verifiers);

    await request(server)
      .get('/api/common/verifiers')
      .expect(200)
      .expect([{ did: 'did:org1', value: '0x123' }]);

    expect(mockFireFly.getOrganizations).toHaveBeenCalledWith();
    expect(mockFireFly.getVerifiers).toHaveBeenCalledWith('default');
  });
});
