# Prediction Market Smart Contract User Interface

## ABOUT

This smart contract implements a decentralized prediction market on the Stacks blockchain. Users can create prediction markets, place wagers, and claim payouts for correct predictions. The contract is designed to be fair, transparent, and resistant to manipulation.

## Table of Contents

1. Features
2. Prerequisites
3. Installation
4. Contract Functions
5. Usage
6. Security Considerations
7. Testing
8. Deployment
9. Contribution
10. License

## Features

- Create prediction markets with multiple options
- Place wagers on prediction outcomes
- Automatic finalization of predictions based on closing block
- Claim payouts for correct predictions
- Partial wager withdrawal before market closure
- Contract administrator controls for market finalization and termination
- Commission mechanism for sustaining the platform

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet): A Clarity runtime packaged as a command line tool
- Basic understanding of the Stacks blockchain and Clarity smart contract language
- [stacks-cli](https://github.com/blockstack/stacks-cli) for contract deployment (optional)

## Installation

1. Clone this repository:
   ```
   git clone
   cd
   ```

2. Install Clarinet by following the instructions in the [Clarinet repository](https://github.com/hirosystems/clarinet).

3. Initialize the Clarinet project (if not already initialized):
   ```
   clarinet new
   ```

4. Copy the contract code into the `contracts` directory of your Clarinet project.

## Contract Functions

### Admin Functions

- `create-prediction-market`: Create a new prediction market
- `finalize-prediction-market`: Finalize a prediction market with the result
- `terminate-prediction-market`: Terminate a prediction market (in case of disputes or errors)

### User Functions

- `place-wager`: Place a wager on a specific prediction option
- `withdraw-partial-wager`: Withdraw part of a wager before market closure
- `claim-payout-or-refund`: Claim winnings or refund after market finalization

### Read-Only Functions

- `get-prediction-market`: Get details of a specific prediction market
- `get-prediction-choices`: Get the available choices for a prediction market
- `get-participant-wager`: Get the wager details for a specific participant

## Usage

### Creating a Prediction Market

To create a new prediction market, call the `create-prediction-market` function with the following parameters:

- `query`: A string describing the prediction question (max 256 characters)
- `details`: Additional details about the prediction (max 1024 characters)
- `closing-block`: The block height at which the prediction market will close
- `choices`: A list of possible outcomes (max 20 choices, each max 64 characters)

### Placing a Wager

To place a wager, call the `place-wager` function with the following parameters:

- `prediction-id`: The ID of the prediction market
- `choice-index`: The index of the chosen option
- `wager-amount`: The amount of STX to wager

### Claiming a Payout

After a prediction market is finalized, participants can claim their payout or refund by calling the `claim-payout-or-refund` function:


## Security Considerations

- The contract uses a minimum wager amount to prevent dust attacks
- There's a commission mechanism to sustain the platform and prevent abuse
- The contract administrator has the power to finalize and terminate markets, which introduces a centralization risk
- Users should be aware that they can only withdraw partial wagers before the market closes

## Testing

1. Write your tests in the `tests` directory of your Clarinet project.
2. Run the tests using Clarinet:
   clarinet test

## Deployment

1. Ensure you have the Stacks CLI installed and configured with your account.
2. Deploy the contract to the Stacks blockchain:
   ```
   stacks-cli deploy prediction-market.clar --network mainnet
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## AUTHOR
Chukwudi Daniel Nwaneri