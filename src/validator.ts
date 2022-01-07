import algosdk, {Algodv2} from "algosdk";

import {SignerTransaction} from "./common-types";
import {AccountInformation} from "./account/accountTypes";

const CREATE_ENCODED = Uint8Array.from([99, 114, 101, 97, 116, 101]); // 'create'

export const OPT_IN_VALIDATOR_APP_PROCESS_TXN_COUNT = 1;

export async function generateOptIntoValidatorTxns({
  client,
  validatorAppID,
  initiatorAddr
}: {
  client: Algodv2;
  validatorAppID: number;
  initiatorAddr: string;
}): Promise<SignerTransaction[]> {
  const suggestedParams = await client.getTransactionParams().do();

  const appOptInTxn = algosdk.makeApplicationOptInTxnFromObject({
    from: initiatorAddr,
    appIndex: validatorAppID,
    suggestedParams
  });

  return [{txn: appOptInTxn, signers: [initiatorAddr]}];
}

export const OPT_OUT_VALIDATOR_APP_PROCESS_TXN_COUNT = 1;

export async function generateOptOutOfValidatorTxns({
  client,
  validatorAppID,
  initiatorAddr
}: {
  client: Algodv2;
  validatorAppID: number;
  initiatorAddr: string;
}): Promise<SignerTransaction[]> {
  const suggestedParams = await client.getTransactionParams().do();

  const appClearStateTxn = algosdk.makeApplicationClearStateTxnFromObject({
    from: initiatorAddr,
    appIndex: validatorAppID,
    suggestedParams
  });

  return [{txn: appClearStateTxn, signers: [initiatorAddr]}];
}

/**
 * Checks if an account is opted into the Validator app.
 *
 * @param params.validatorAppID The ID of the Validator App for the network.
 * @param params.accountAppsLocalState Array of app local states for an account.
 * @returns True if and only if the indicated account has opted into the Validator App.
 */
export function isOptedIntoValidator({
  validatorAppID,
  accountAppsLocalState
}: {
  validatorAppID: number;
  accountAppsLocalState: AccountInformation["apps-local-state"];
}): boolean {
  return accountAppsLocalState.some((appState) => appState.id === validatorAppID);
}
