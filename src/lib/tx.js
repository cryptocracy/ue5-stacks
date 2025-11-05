import { openContractCall, openContractDeploy, openSTXTransfer } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network';
import {
    boolCV, principalCV, uintCV, noneCV, someCV,
    bufferCVFromString, stringAsciiCV,
    makeStandardSTXPostCondition,
    makeStandardFungiblePostCondition,
    makeContractNonFungiblePostCondition,
    PostConditionMode,
    FungibleConditionCode,
    NonFungibleConditionCode

} from '@stacks/transactions';
import { isAuthed, userSession } from './auth';

function closeWindow() {
    window.close();
}

export async function paymemtRequest(payload) {
    if (!payload) return;

    // Check if user is authenticated
    if (!isAuthed) {
        console.error('User not authenticated');
        window.close();
        return;
    }

    const { request, "amount-or-id": amount, isSTX, isNFT, "bns-contract": bnsContract, "ft-contract-id": ftContractId, memo, message, "nft-contract-id": nftContractId, "options-contract": optionsContract, "via-id": viaId } = payload
    const userAddress = isAuthed ? userSession.loadUserData().profile.stxAddress['mainnet'] : '';
    const conditions = isSTX
        ? [makeStandardSTXPostCondition(userAddress, FungibleConditionCode.LessEqual, +amount * 1000000)]
        : isNFT
            ? [makeStandardFungiblePostCondition(userAddress, FungibleConditionCode.LessEqual, +amount, ftContractId)]
            : [makeContractNonFungiblePostCondition(userAddress, nftContractId.split('.')[1], NonFungibleConditionCode.Sends, nftContractId, uintCV(+amount))]

    try {
        openContractCall({
            network: STACKS_MAINNET,
            contractAddress: 'SP337NP61BD34ES77QK4XZP6R9AXV235GV6W1YMNT',
            contractName: "cryptonauts-alpha",
            functionName: request,
            functionArgs: [
                stringAsciiCV(viaId),
                uintCV(+amount),
                boolCV(isSTX === "true" ? true : false),
                boolCV(isNFT === "true" ? true : false),
                isSTX === "false" && isNFT === "false" ? principalCV(ftContractId) : noneCV(),
                isNFT === "true" ? principalCV(nftContractId) : noneCV(),
                memo !== "none" ? someCV(bufferCVFromString(memo)) : noneCV(),
                message !== "none" ? someCV(bufferCVFromString(message)) : noneCV(),
                principalCV(optionsContract),
                principalCV(bnsContract)
            ],
            stxAddress: userAddress,
            postConditions: conditions,
            onFinish: () => {
                closeWindow();
            },
            onCancel: () => {
                closeWindow();
            }
        })
    } catch (error) {
        console.error('Error opening contract call:', error);
        closeWindow();
    }
}