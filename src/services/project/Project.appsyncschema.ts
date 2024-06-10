import { IAppSyncBody } from '@/services/aws/appsync/appsync.input';
import { AppsyncIdoActionInput } from '@/services/project/project.input';

const IDO_ACTION_SCHEMA: IAppSyncBody<AppsyncIdoActionInput> = {
  query: `mutation idoAction($input: IIdoActionInput!) {
      idoAction(input: $input) {
        action_at
        action_type
        invested_total
        invested_wallet
        project__id
      }
    }
  `,
  operationName: 'idoAction',
};
export { IDO_ACTION_SCHEMA };
