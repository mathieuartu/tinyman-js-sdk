import {waitForConfirmation} from "algosdk";

import {InitiatorSigner, SignerTransaction} from "../../util/commonTypes";
import TinymanError from "../../util/error/TinymanError";
import {V2PoolInfo} from "../../util/pool/poolTypes";
import {getTxnGroupID, sendAndWaitRawTransaction, sumUpTxnFees} from "../../util/util";
import {V2MintExecution, V2MintTxnIndices, V2MintType} from "../types";

export function signTxns({
  txGroup,
  initiatorSigner
}: {
  txGroup: SignerTransaction[];
  initiatorSigner: InitiatorSigner;
}): Promise<Uint8Array[]> {
  return initiatorSigner([txGroup]);
}

/**
 * Execute a mint operation with the desired quantities.
 *
 * @param params.client An Algodv2 client.
 * @param params.pool Information for the pool.
 * @param params.asset1In The quantity of the first asset being deposited.
 * @param params.asset2In The quantity of the second asset being deposited.
 * @param params.liquidityOut The quantity of liquidity tokens being withdrawn.
 * @param params.slippage The maximum acceptable slippage rate. Should be a number between 0 and 100
 *   and acts as a percentage of params.liquidityOut.
 * @param params.initiatorAddr The address of the account performing the mint operation.
 * @param params.initiatorSigner A function that will sign transactions from the initiator's
 *   account.
 */
export async function execute({
  client,
  pool,
  txGroup,
  signedTxns,
  mode
}: {
  client: any;
  pool: V2PoolInfo;
  txGroup: SignerTransaction[];
  signedTxns: Uint8Array[];
  mode: V2MintType;
}): Promise<V2MintExecution> {
  try {
    const [{confirmedRound, txnID}] = await sendAndWaitRawTransaction(client, [
      signedTxns
    ]);
    const appCallTxnId =
      txGroup[V2MintTxnIndices[mode].VALIDATOR_APP_CALL_TXN].txn.txID();
    const appCallTxnResponse = await waitForConfirmation(client, appCallTxnId, 1000);
    const assetOutInnerTxn = appCallTxnResponse["inner-txns"].find(
      (item) => item.txn.txn.type === "axfer"
    ).txn.txn;
    const fees = sumUpTxnFees(txGroup);
    const groupID = getTxnGroupID(txGroup);

    return {
      round: confirmedRound,
      /**
       * TODO: For FO swap, there can be one more txn with type `change`.
       * We should handle that case as well.
       * (see: https://docs.google.com/document/d/1O3QBkWmUDoaUM63hpniqa2_7G_6wZcCpkvCqVrGrDlc/edit# )
       */
      assetOut: {
        amount: assetOutInnerTxn.aamt,
        assetID: assetOutInnerTxn.xaid
      },
      fees,
      liquidityID: pool.liquidityTokenID!,
      txnID,
      groupID
    };
  } catch (error: any) {
    const parsedError = new TinymanError(
      error,
      "We encountered something unexpected while minting liquidity. Try again later."
    );

    if (parsedError.type === "SlippageTolerance") {
      parsedError.setMessage(
        "Minting failed due to too much slippage in the price. Please adjust the slippage tolerance and try again."
      );
    }

    throw parsedError;
  }
}
