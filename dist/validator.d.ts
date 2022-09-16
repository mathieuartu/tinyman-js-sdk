import { Algodv2 } from "algosdk";
import { SignerTransaction, SupportedNetwork } from "./util/commonTypes";
export declare const OPT_IN_VALIDATOR_APP_PROCESS_TXN_COUNT = 1;
/**
 * Get the Validator App ID for a network.
 *
 * @param network "mainnet" | "testnet".
 *
 * @returns the Validator App ID
 */
export declare function getValidatorAppID(network: SupportedNetwork): number;
export declare function generateOptIntoValidatorTxns({ client, validatorAppID, initiatorAddr }: {
    client: Algodv2;
    validatorAppID: number;
    initiatorAddr: string;
}): Promise<SignerTransaction[]>;
export declare const OPT_OUT_VALIDATOR_APP_PROCESS_TXN_COUNT = 1;
export declare function generateOptOutOfValidatorTxns({ client, validatorAppID, initiatorAddr }: {
    client: Algodv2;
    validatorAppID: number;
    initiatorAddr: string;
}): Promise<SignerTransaction[]>;
