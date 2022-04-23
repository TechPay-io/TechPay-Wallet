// import needed libs
import Web3 from "web3";
import web3Utils from "web3-utils";

// DEFAULT_GAS_LIMIT represents the maximum amount of gas we are willing
// to pay for the DeFi calls.
const DEFAULT_GAS_LIMIT = '0x2dc6c0';

// ZERO_AMOUNT represents zero amount transferred on some calls.
const ZERO_AMOUNT = '0x0';

// PHOTON_CHAIN_ID is the chain id used by TechPay Photon blockchain.
const PHOTON_CHAIN_ID = '0xa09';

// TESTNET_CHAIN_ID is the chain id used by TechPay Photon test net.
const TESTNET_CHAIN_ID = '0x9af';

/**
 * defiWrapTpc creates a contract call transaction to wrap given amount
 * of native TPC tokens into the wTPC tokens used among DeFi protocols.
 *
 * @param {string} erc20Address
 * @param {string|{BN}} amount
 * @returns {{gasLimit: string, data: string, chainId: string, to: *, nonce: undefined, value: string, gasPrice: undefined}}
 */
function defiWrapTpc(erc20Address, amount) {
    // create web3.js instance
    const web3 = new Web3();

    // make the transaction
    return {
        nonce: undefined,
        gasPrice: undefined,
        gasLimit: DEFAULT_GAS_LIMIT,
        to: erc20Address,
        value: web3Utils.numberToHex(amount),
        data: web3.eth.abi.encodeFunctionCall({
            "constant": false,
            "inputs": [],
            "name": "deposit",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        }, []),
        chainId: PHOTON_CHAIN_ID
    };
}

/**
 * defiWrapTpc creates a contract call transaction to unwrap given amount
 * of wrapped wTPC tokens used among DeFi protocols back to the native TPC tokens.
 *
 * @param {string} erc20Address
 * @param {string|{BN}} amount
 * @returns {{gasLimit: string, data: string, chainId: string, to: *, nonce: undefined, value: string, gasPrice: undefined}}
 */
function defiUnwrapTpc(erc20Address, amount) {
    // create web3.js instance
    const web3 = new Web3();

    // make the transaction
    return {
        nonce: undefined,
        gasPrice: undefined,
        gasLimit: DEFAULT_GAS_LIMIT,
        to: erc20Address,
        value: ZERO_AMOUNT,
        data: web3.eth.abi.encodeFunctionCall({
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "withdraw",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }, [amount]),
        chainId: PHOTON_CHAIN_ID
    };
}

// what we export here
export default {
    defiWrapTpc,
    defiUnwrapTpc,
    PHOTON_CHAIN_ID,
    TESTNET_CHAIN_ID
};
