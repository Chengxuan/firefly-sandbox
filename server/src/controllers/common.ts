import { Get, InternalServerError, JsonController, Param, QueryParam } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { firefly } from '../clients/firefly';
import { FFStatus, Organization, Plugin, Plugins, Transaction, Verifier } from '../interfaces';
const DEFAULT_NAMESPACE = process.env.FF_DEFAULT_NAMESPACE || 'default';
/**
 * Common Operations - API Server
 */
@JsonController('/common')
@OpenAPI({ tags: ['Common'] })
export class CommonController {
  @Get('/organizations')
  @ResponseSchema(Organization, { isArray: true })
  @OpenAPI({ summary: 'List all organizations in network' })
  async organizations(@QueryParam('exclude_self') exclude_self: boolean): Promise<Organization[]> {
    let orgs = await firefly.getOrganizations();
    if (exclude_self) {
      const status = await firefly.getStatus();
      orgs = orgs.filter((o) => o.id !== status.org.id);
    }
    return orgs.map((o) => ({ id: o.id, did: o.did, name: o.name }));
  }

  @Get('/organizations/self')
  @ResponseSchema(Organization)
  @OpenAPI({ summary: 'Look up local organization' })
  async self(): Promise<Organization> {
    const status = await firefly.getStatus();
    return { id: status.org?.id, did: status.org?.did, name: status.org?.name};
  }

  @Get('/verifiers')
  @ResponseSchema(Verifier, { isArray: true })
  @OpenAPI({ summary: 'List verifiers (such as Ethereum keys) for all organizations in network' })
  async verifiers(): Promise<Verifier[]> {
    try {
      const orgs = await firefly.getOrganizations();
      let verifiers = await firefly.getVerifiers(DEFAULT_NAMESPACE);
      if (verifiers.length === 0) {
        // attempt to query legacy ff_system verifiers
        verifiers = await firefly.getVerifiers('ff_system');
      }
      const result: Verifier[] = [];
      for (const v of verifiers) {
        const o = orgs.find((o) => o.id === v.identity);
        if (o !== undefined) {
          result.push({ did: o.did, type: v.type, value: v.value });
        }
      }
      return result;
    } catch (err) {
      if (err.message == "FF10187: Namespace does not exist") {
        return [];
      }
      throw new InternalServerError(err.message);
    }
  }

  @Get('/verifiers/self')
  @ResponseSchema(Verifier, { isArray: true })
  @OpenAPI({ summary: 'List verifiers (such as Ethereum keys) for local organization' })
  async verifierSelf(): Promise<Verifier[]> {
    const status = await firefly.getStatus();
    const verifiers = await firefly.getVerifiers(DEFAULT_NAMESPACE);
    const result: Verifier[] = [];
    for (const v of verifiers) {
      if (status.org?.id === v.identity) {
        result.push({ did: status.org?.did, type: v.type, value: v.value });
      }
    }
    return result;
  }

  @Get('/plugins')
  @ResponseSchema(Plugins)
  @OpenAPI({ summary: 'List plugins on the FireFly node' })
  async plugins(): Promise<Plugins> {
    const status = await firefly.getStatus();
    return {
      blockchain: status.plugins.blockchain as Plugin[],
      tokens: status.plugins.tokens as Plugin[],
    };
  }

  @Get('/transactions/:id')
  @ResponseSchema(Transaction)
  @OpenAPI({ summary: 'Look up a FireFly transaction by ID' })
  async transaction(@Param('id') id: string): Promise<Transaction> {
    const tx = await firefly.getTransaction(id);
    return {
      id: tx.id,
      type: tx.type,
    };
  }

  @Get('/firefly/status')
  @ResponseSchema(FFStatus)
  @OpenAPI({ summary: 'Look up FireFly status' })
  async ffStatus(): Promise<FFStatus> {
    const status = await firefly.getStatus();
    if ("multiparty" in status) {
      return {
        multiparty: status.multiparty?.enabled,
        namespace: DEFAULT_NAMESPACE,
      };
    } else {
      // Assume multiparty mode if `multiparty` key is missing from status
      return {
        multiparty: true,
        namespace: DEFAULT_NAMESPACE,
      }
    }
  }
}
