import { contractPrincipal } from './constants';
import { makeSTXTokenTransfer, callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

export const executeContractFunction = async (functionName, functionArgs, userSession) => {
  const network = new StacksMainnet();
  
  const options = {
    contractAddress: contractPrincipal.split('.')[0],
    contractName: contractPrincipal.split('.')[1],
    functionName,
    functionArgs,
    network,
    senderAddress: userSession.loadUserData().profile.stxAddress.mainnet,
  };

  return await makeSTXTokenTransfer(options);
};

export const callReadOnlyContractFunction = async (functionName, functionArgs, userSession) => {
  const network = new StacksMainnet();

  const options = {
    contractAddress: contractPrincipal.split('.')[0],
    contractName: contractPrincipal.split('.')[1],
    functionName,
    functionArgs,
    network,
    senderAddress: userSession.loadUserData().profile.stxAddress.mainnet,
  };

  return await callReadOnlyFunction(options);
};
