import {CONTRACT_VERSION} from "../../contract/constants";
import {tinymanContract_v1_1, tinymanContract_v2} from "../../contract/contract";
import {ContractVersionValue} from "../../contract/types";
import {
  BASE_MINIMUM_BALANCE,
  MINIMUM_BALANCE_REQUIRED_PER_ASSET,
  MINIMUM_BALANCE_REQUIRED_PER_APP,
  MINIMUM_BALANCE_REQUIRED_PER_INT_SCHEMA_VALUE,
  MINIMUM_BALANCE_REQUIRED_PER_BYTE_SCHEMA
} from "../../util/constant";

/**
 * @returns Minimum balance for a pool account
 */
export function getPoolAccountMinBalance(
  // Local state uint count and Local state byte slice count changes between different contract versions
  contractVersion: ContractVersionValue,
  isAlgoPool: boolean
) {
  const {
    schema: {numLocalInts, numLocalByteSlices}
  } =
    contractVersion === CONTRACT_VERSION.V1_1 ? tinymanContract_v1_1 : tinymanContract_v2;

  let fee =
    BASE_MINIMUM_BALANCE +
    MINIMUM_BALANCE_REQUIRED_PER_ASSET + // min balance to create asset
    MINIMUM_BALANCE_REQUIRED_PER_ASSET + // fee + min balance to opt into asset 1
    MINIMUM_BALANCE_REQUIRED_PER_APP + // min balance to opt into validator app
    MINIMUM_BALANCE_REQUIRED_PER_INT_SCHEMA_VALUE * numLocalInts +
    MINIMUM_BALANCE_REQUIRED_PER_BYTE_SCHEMA * numLocalByteSlices;

  if (!isAlgoPool) {
    fee += MINIMUM_BALANCE_REQUIRED_PER_ASSET; // min balance to opt into asset 2
  }

  return fee;
}
