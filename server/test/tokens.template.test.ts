import * as request from 'supertest';
import * as _ from 'underscore';
import server from '../src/server';
import { formatTemplate } from '../src/utils';

describe('Templates: Tokens', () => {
  test('Token pool template', () => {
    return request(server)
      .get('/api/tokens/template/pools')
      .expect(200)
      .expect((resp) => {
        const compiled = _.template(resp.body);
        expect(
          compiled({
            name: 'pool1',
            symbol: 'P1',
            type: 'fungible',
            address: undefined,
          }),
        ).toBe(
          formatTemplate(`
            const pool = await firefly.createTokenPool({
              name: 'pool1',
              symbol: 'P1',
              type: 'fungible',
              config: {
                address: undefined,
              }
            });
            return { type: 'token_pool', id: pool.id };
        `),
        );
      });
  });

  test('Mint template', () => {
    return request(server)
      .get('/api/tokens/template/mint')
      .expect(200)
      .expect((resp) => {
        const compiled = _.template(resp.body);
        expect(
          compiled({
            pool: 'pool1',
            amount: 10,
            messagingMethod: null,
          }),
        ).toBe(
          formatTemplate(`
            const transfer = await firefly.mintTokens({
              pool: 'pool1',
              amount: '10',
            });
            return { type: 'token_transfer', id: transfer.localId };
        `),
        );
      });
  });

  test('Burn template', () => {
    return request(server)
      .get('/api/tokens/template/burn')
      .expect(200)
      .expect((resp) => {
        const compiled = _.template(resp.body);
        expect(
          compiled({
            pool: 'pool1',
            tokenIndex: '1',
            amount: 1,
            messagingMethod: null,
          }),
        ).toBe(
          formatTemplate(`
            const burn = await firefly.burnTokens({
              pool: 'pool1',
              tokenIndex: '1',
              amount: '1',
            });
            return { type: 'token_transfer', id: transfer.localId };
        `),
        );
      });
  });

  test('Transfer template', () => {
    return request(server)
      .get('/api/tokens/template/transfer')
      .expect(200)
      .expect((resp) => {
        const compiled = _.template(resp.body);
        expect(
          compiled({
            pool: 'pool1',
            amount: 1,
            tokenIndex: '1',
            to: '0x111',
            messagingMethod: null,
          }),
        ).toBe(
          formatTemplate(`
            const transfer = await firefly.transferTokens({
              pool: 'pool1',
              to: '0x111',
              tokenIndex: '1',
              amount: '1',
            });
            return { type: 'token_transfer', id: transfer.localId };
        `),
        );
      });
  });
});
