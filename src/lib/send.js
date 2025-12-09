
import { openContractCall, openSTXTransfer } from "@stacks/connect";
import { getWalletConnectedProvider, isAuthed, userSession } from "./auth";
import { makeStandardFungiblePostCondition } from "@stacks/transactions/dist";
import { makeContractNonFungiblePostCondition } from "@stacks/transactions/dist";
import { STACKS_MAINNET } from "@stacks/network/dist";
import { principalCV } from "@stacks/transactions/dist";
import { uintCV } from "@stacks/transactions/dist";
import { bufferCVFromString } from "@stacks/transactions/dist";
import { noneCV } from "@stacks/transactions/dist";
import { someCV } from "@stacks/transactions/dist";
import { NonFungibleConditionCode } from "@stacks/transactions/dist";
import { FungibleConditionCode } from "@stacks/transactions/dist";

export function sendRequest(payload) {
    if (!payload) return;
    const userAddress = isAuthed ? userSession?.loadUserData()?.profile?.stxAddress?.['mainnet'] : '';
    const isSTX = payload?.isSTX;
    const isNFT = payload?.isNFT;
    const isFT = payload?.isFT;
    const from = payload?.from;
    const to = payload?.to;
    const amount = payload?.amount;
    const memo = payload?.memo;
    const nftId = payload?.nftId;
    const tokenContract = payload?.tokenContract;
    const nftContract = payload?.nftContract;

    console.log({ payload });

    if (from !== userAddress) {
        console.error('From address is not the authenticated user address');
        // window.close();
        return;
    }

    switch (true) {
        case isSTX:
            sendStx(from, to, amount, memo);
            break;
        case isNFT:
            sendNonFungible(nftContract, from, to, nftId, memo);
            break;
        case isFT:
            sendFungible(tokenContract, from, to, amount, memo);
            break;
        default:
            console.error('Invalid payload request', { payload });
            //window.close();
            break;
    }
}

function sendStx(from, to, amount, memo) {
    const provider = getWalletConnectedProvider();
    console.log({ provider });
    openSTXTransfer({
        network: STACKS_MAINNET,
        amount: +amount,
        sender: from,
        recipient: to,
        memo: memo,
        onFinish: () => {
            window.close();
        },
        onCancel: () => {
            window.close();
        }
    })
}

function sendFungible(tokenContract, from, to, amount, memo) {
    const provider = getWalletConnectedProvider();
    console.log({ provider });
    openContractCall({
        network: STACKS_MAINNET,
        contractAddress: tokenContract.split('.')[0],
        contractName: tokenContract.split('.')[1],
        functionName: "transfer",
        functionArgs: [
            principalCV(from),
            principalCV(to),
            uintCV(+amount),
            memo !== null ? someCV(bufferCVFromString(memo)) : noneCV(),
        ],
        stxAddress: from,
        postConditions: [
            makeStandardFungiblePostCondition(from, FungibleConditionCode.LessEqual, +amount, tokenContract)
        ],
        onFinish: () => {
            window.close();
        },
        onCancel: () => {
            window.close();
        }
    })
}

function sendNonFungible(nftContract, from, to, nftId, memo) {
    const provider = getWalletConnectedProvider();
    console.log({ provider });
    openContractCall({
        network: STACKS_MAINNET,
        contractAddress: nftContract.split('.')[0],
        contractName: nftContract.split('.')[1],
        functionName: "transfer",
        functionArgs: [
            principalCV(from),
            principalCV(to),
            uintCV(+nftId),
            memo !== null ? someCV(bufferCVFromString(memo)) : noneCV(),
        ],
        stxAddress: from,
        postConditions: [
            makeContractNonFungiblePostCondition(from, nftContract.split('.')[1], NonFungibleConditionCode.Sends, nftContract, uintCV(+nftId))
        ],
        onFinish: () => {
            window.close();
        },
        onCancel: () => {
            window.close();
        }
    })
}