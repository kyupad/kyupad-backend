import { withBaseResponse } from '@/interfaces/common.interface';
import { FungibleToken } from '@schemas/fungible_tokens.schema';

class FungibleTokenResponse extends withBaseResponse(FungibleToken, {}) {}

export { FungibleTokenResponse };
