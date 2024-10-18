### Prediction Market Smart Contract
## ABOUT
This Clarity smart contract implements a flexible prediction market system on the Stacks blockchain. It allows users to create prediction markets, place wagers on different outcomes, and claim payouts based on the results. The contract supports multiple outcome options, partial wager withdrawals, market termination, and automatic time-based finalization.

## Features

Create prediction markets with multiple outcome choices
Place wagers on different outcomes
Withdraw partial wagers before market finalization
Finalize markets manually or automatically based on time
Terminate markets (e.g., in case of unforeseen circumstances)
Claim payouts for winning wagers or refunds for terminated markets
Configurable minimum wager amount and commission rate

## Contract Functions
## Administrative Functions

create-prediction-market: Create a new prediction market
finalize-prediction-market: Manually finalize a prediction market
terminate-prediction-market: Terminate a prediction market
auto-finalize-predictions: Automatically finalize eligible prediction markets

## User Functions

place-wager: Place a wager on a specific outcome
withdraw-partial-wager: Withdraw part of a wager before market finalization
claim-payout-or-refund: Claim winnings or refunds after market finalization or termination

## Read-Only Functions

get-prediction-market: Get details of a specific prediction market
get-prediction-choices: Get the outcome choices for a specific prediction market
get-participant-wager: Get wager details for a specific participant in a market
get-contract-balance: Get the current balance of the contract

## Usage
Creating a Prediction Market
To create a new prediction market, call the create-prediction-market function with the following parameters:

query: A short description or question for the prediction market (max 256 characters)
details: Additional details or context for the market (max 1024 characters)
closing-block: The block height at which the market will be eligible for finalization
choices: A list of possible outcomes (max 20 choices, each max 64 characters)

Placing a Wager
To place a wager, call the place-wager function with:

prediction-id: The ID of the prediction market
choice-index: The index of the chosen outcome
wager-amount: The amount to wager (in microSTX)

Withdrawing a Partial Wager
To withdraw part of a wager before market finalization, use the withdraw-partial-wager function:

prediction-id: The ID of the prediction market
choice-index: The index of the chosen outcome to withdraw from
withdrawal-amount: The amount to withdraw (in microSTX)

Claiming Payouts or Refunds
After a market is finalized or terminated, participants can claim their payouts or refunds using the claim-payout-or-refund function:

prediction-id: The ID of the prediction market

## Important Considerations

Minimum Wager: The contract enforces a minimum wager amount (minimum-wager) to prevent dust attacks and ensure meaningful participation.
Commission: A small commission (commission-rate) is deducted from winning payouts to sustain the platform.
Finalization: Markets can be finalized manually by the contract administrator or automatically based on the closing block height.
Termination: In case of unforeseen circumstances, the contract administrator can terminate a market, allowing all participants to claim refunds.
Partial Withdrawals: Participants can withdraw part of their wager before market finalization, providing flexibility in their strategy.
Automatic Finalization: The auto-finalize-predictions function should be called periodically (e.g., by an off-chain script) to finalize eligible markets.
Security: Only the contract administrator can finalize or terminate markets. Ensure the admin key is kept secure.

## Error Handling
The contract includes various error checks to ensure proper usage. Some common errors include:

err-not-authorized: The caller doesn't have permission for the action
err-already-finalized: Attempting to modify a finalized market
err-not-finalized: Attempting to claim payouts from an unfinalized market
err-invalid-wager: The wager amount is below the minimum or invalid
err-insufficient-funds: The participant doesn't have enough funds for the wager
err-prediction-terminated: Attempting to modify a terminated market
err-invalid-choice: The chosen outcome index is invalid

## Development and Testing
To work with this contract:

Set up a Stacks blockchain development environment
Deploy the contract to a testnet
Interact with the contract using a Stacks wallet or through direct API calls
Thoroughly test all functions with various scenarios before mainnet deployment


## Disclaimer
This smart contract is provided as-is. Users and implementers should thoroughly review and test the contract before any real-world usage. The creators and contributors are not responsible for any losses or issues arising from the use of this contract.

## License
Chukwudi Daniel Nwaneri