import { fetchCallReadOnlyFunction } from "@stacks/transactions"
import { STACKS_TESTNET } from "@stacks/network"

// This is a known contract on testnet
const TEST_CONTRACT_ADDRESS = "ST000000000000000000002AMW42H"
const TEST_CONTRACT_NAME = "pox-3"

export async function testContractCall() {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: TEST_CONTRACT_ADDRESS,
      contractName: TEST_CONTRACT_NAME,
      functionName: "get-pox-info",
      functionArgs: [],
      network: STACKS_TESTNET,
      senderAddress: TEST_CONTRACT_ADDRESS,
    })

    console.log("Contract call successful:", result)
    return true
  } catch (error) {
    console.error("Test contract call failed:", error)
    return false
  }
}