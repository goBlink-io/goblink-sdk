/** Request to submit a deposit transaction notification */
export interface SubmitDepositRequest {
  /** On-chain transaction hash of the deposit */
  txHash: string;
  /** Deposit address returned from createTransfer */
  depositAddress: string;
}

/** Response from submitting a deposit */
export interface SubmitDepositResponse {
  /** Confirmation message */
  message: string;
  /** Echoed transaction hash */
  txHash: string;
  /** Echoed deposit address */
  depositAddress: string;
}
