import { Tree } from './utils/tree.js';

/**
 * App structure (incomplete) used for navigation and view transitions.
 *
 * @type {WalletAppStructureNode[]}
 */
const appStructure = [
    {
        id: 'wallet',
        _c: [
            {
                id: 'account',
                _c: [
                    {
                        id: 'account-history',
                        _c: [
                            {
                                id: 'account-blockchain-picker-form',
                                _c: [
                                    {
                                        id: 'account-send-transaction-form',
                                        _c: [
                                            {
                                                id: 'account-transaction-confirmation',
                                                component: 'transaction-confirmation',
                                                _c: [
                                                    {
                                                        id: 'account-transaction-success-message',
                                                        component: 'transaction-success-message',
                                                    },
                                                    {
                                                        id: 'account-transaction-reject-message',
                                                        component: 'transaction-reject-message',
                                                    },
                                                ],
                                            },
                                            { id: 'account-receive' },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'account-send-erc20',
                            },
                        ],
                    },
                ],
            },
            {
                id: 'staking',
                _c: [
                    {
                        id: 'staking-delegations-info',
                        _c: [
                            {
                                id: 'staking-info',
                                _c: [
                                    {
                                        id: 'staking-unstake-tpc',
                                        component: 'unstake-t-p-c',
                                        _c: [
                                            {
                                                id: 'staking-delegation-unlock-confirmation',
                                                component: 'delegation-unlock-confirmation',
                                                _c: [
                                                    {
                                                        id: 'staking-delegation-unlock-confirmation-success-message',
                                                        component: 'transaction-success-message',
                                                        _c: [
                                                            {
                                                                id: 'staking-unstake-confirmation',
                                                                component: 'unstake-confirmation',
                                                                _c: [
                                                                    {
                                                                        id:
                                                                            'staking-unstake-confirmation-success-message',
                                                                        component: 'transaction-success-message',
                                                                    },
                                                                    {
                                                                        id:
                                                                            'staking-unstake-confirmation-reject-message',
                                                                        component: 'transaction-reject-message',
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        id: 'staking-delegation-unlock-confirmation-reject-message',
                                                        component: 'transaction-reject-message',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'staking-claim-rewards-confirmation',
                                        component: 'claim-rewards-confirmation',
                                        _c: [
                                            {
                                                id: 'staking-claim-rewards-confirmation-success-message',
                                                component: 'transaction-success-message',
                                            },
                                            {
                                                id: 'staking-claim-rewards-confirmation-reject-message',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                    {
                                        id: 'staking-delegation-lock',
                                        component: 'delegation-lock',
                                        _c: [
                                            {
                                                id: 'staking-delegation-lock-confirmation',
                                                component: 'delegation-lock-confirmation',
                                                _c: [
                                                    {
                                                        id: 'staking-delegation-lock-confirmation-success-message',
                                                        component: 'transaction-success-message',
                                                    },
                                                    {
                                                        id: 'staking-delegation-lock-confirmation-reject-message',
                                                        component: 'transaction-reject-message',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'staking-mint-stpc-confirmation',
                                        component: 'defi-mint-s-t-p-c-confirmation',
                                        _c: [
                                            {
                                                id: 'staking-mint-stpc-confirmation-success-message',
                                                component: 'transaction-success-message',
                                            },
                                            {
                                                id: 'staking-mint-stpc-confirmation-reject-message',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                    {
                                        id: 'staking-repay-stpc-confirmation',
                                        component: 'defi-repay-s-t-p-c-confirmation',
                                        _c: [
                                            {
                                                id: 'staking-repay-stpc-confirmation-success-message',
                                                component: 'transaction-success-message',
                                                _c: [
                                                    {
                                                        id: 'staking-repay-stpc-confirmation2',
                                                        component: 'defi-repay-s-t-p-c-confirmation',
                                                        _c: [
                                                            {
                                                                id: 'staking-repay-stpc-confirmation-success-message2',
                                                                component: 'transaction-success-message',
                                                            },
                                                            {
                                                                id: 'staking-repay-stpc-confirmation-reject-message2',
                                                                component: 'transaction-reject-message',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            {
                                                id: 'staking-repay-stpc-confirmation-reject-message',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                    {
                                        id: 'staking-withdraw-tpc-confirmation',
                                        component: 'withdraw-t-p-c-confirmation',
                                        _c: [
                                            {
                                                id: 'staking-withdraw-tpc-confirmation-success-message',
                                                component: 'transaction-success-message',
                                            },
                                            {
                                                id: 'staking-withdraw-tpc-confirmation-reject-message',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'staking-stake-form',
                                _c: [
                                    {
                                        id: 'staking-stake-form-confirmation',
                                        component: 'stake-confirmation',
                                        _c: [
                                            {
                                                id: 'staking-stake-form-success-message',
                                                component: 'transaction-success-message',
                                            },
                                            {
                                                id: 'staking-stake-form-reject-message',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'defi-fmint',
                _c: [
                    { id: 'defi-lock' },
                    { id: 'defi-unlock' },
                    {
                        id: 'defi-lock-unlock',
                        _c: [
                            {
                                id: 'defi-lock-unlock-confirmation',
                                component: 'defi-deposit-confirmation',
                                _c: [
                                    {
                                        id: 'defi-lock-unlock-transaction-success-message',
                                        component: 'transaction-success-message',
                                        _c: [
                                            {
                                                id: 'defi-lock-unlock-confirmation2',
                                                component: 'defi-deposit-confirmation',
                                                _c: [
                                                    {
                                                        id: 'defi-lock-unlock-transaction-success-message2',
                                                        component: 'transaction-success-message',
                                                    },
                                                    {
                                                        id: 'defi-lock-unlock-transaction-reject-message2',
                                                        component: 'transaction-reject-message',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'defi-lock-unlock-transaction-reject-message',
                                        component: 'transaction-reject-message',
                                    },
                                ],
                            },
                        ],
                    },
                    { id: 'defi-mint' },
                    { id: 'defi-repay' },
                    {
                        id: 'defi-mint-repay',
                        _c: [
                            {
                                id: 'defi-mint-repay-confirmation',
                                component: 'defi-borrow-confirmation',
                                _c: [
                                    {
                                        id: 'defi-mint-repay-transaction-success-message',
                                        component: 'transaction-success-message',
                                        _c: [
                                            {
                                                id: 'defi-mint-repay-confirmation2',
                                                component: 'defi-borrow-confirmation',
                                                _c: [
                                                    {
                                                        id: 'defi-mint-repay-transaction-success-message2',
                                                        component: 'transaction-success-message',
                                                    },
                                                    {
                                                        id: 'defi-mint-repay-transaction-reject-message2',
                                                        component: 'transaction-reject-message',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'defi-mint-repay-transaction-reject-message',
                                        component: 'transaction-reject-message',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'defi-fmint-claim-rewards-confirmation',
                        component: 'defi-f-mint-claim-rewards-confirmation',
                        _c: [
                            {
                                id: 'defi-fmint-claim-rewards-transaction-success-message',
                                component: 'transaction-success-message',
                            },
                            {
                                id: 'defi-fmint-claim-rewards-transaction-reject-message',
                                component: 'transaction-reject-message',
                            },
                        ],
                    },
                    {
                        id: 'defi-fmint-push-rewards-confirmation',
                        component: 'defi-f-mint-push-rewards-confirmation',
                        _c: [
                            {
                                id: 'defi-fmint-push-rewards-transaction-success-message',
                                component: 'transaction-success-message',
                            },
                            {
                                id: 'defi-fmint-push-rewards-transaction-reject-message',
                                component: 'transaction-reject-message',
                            },
                        ],
                    },
                    {
                        id: 'defi-manage-collateral',
                        _c: [
                            {
                                id: 'defi-manage-collateral-confirmation',
                                _c: [
                                    { id: 'defi-manage-collateral-transaction-success-message' },
                                    { id: 'defi-manage-collateral-transaction-reject-message' },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'defi-borrow-tusd',
                        _c: [
                            {
                                id: 'defi-borrow-tusd-confirmation',
                                _c: [
                                    {
                                        id: 'defi-borrow-tusd-transaction-success-message',
                                        _c: [
                                            {
                                                id: 'defi-borrow-tusd-confirmation2',
                                                _c: [
                                                    { id: 'defi-borrow-tusd-transaction-success-message2' },
                                                    { id: 'defi-borrow-tusd-transaction-reject-message2' },
                                                ],
                                            },
                                        ],
                                    },
                                    { id: 'defi-borrow-tusd-transaction-reject-message' },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'defi-ftrade',
                _c: [
                    {
                        id: 'defi-ftrade-confirmation',
                        component: 'defi-f-trade-confirmation',
                        _c: [
                            {
                                id: 'defi-ftrade-transaction-success-message',
                                component: 'transaction-success-message',
                                _c: [
                                    {
                                        id: 'defi-ftrade-confirmation2',
                                        component: 'defi-f-trade-confirmation',
                                        _c: [
                                            {
                                                id: 'defi-ftrade-transaction-success-message2',
                                                component: 'transaction-success-message',
                                            },
                                            {
                                                id: 'defi-ftrade-transaction-reject-message2',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                ],
                            },
                            { id: 'defi-ftrade-transaction-reject-message', component: 'transaction-reject-message' },
                        ],
                    },
                ],
            },
            /*{
                id: 'defi-home',
                _c: [
                    {
                        id: 'defi-flend',
                        _c: [
                            {
                                id: 'defi-manage-borrow',
                                _c: [
                                    {
                                        id: 'defi-manage-borrow-confirmation',
                                        _c: [
                                            {
                                                id: 'defi-manage-borrow-transaction-success-message',
                                                _c: [
                                                    {
                                                        id: 'defi-manage-borrow-confirmation2',
                                                        _c: [
                                                            { id: 'defi-manage-borrow-transaction-success-message2' },
                                                            { id: 'defi-manage-borrow-transaction-reject-message2' },
                                                        ],
                                                    },
                                                ],
                                            },
                                            { id: 'defi-manage-borrow-transaction-reject-message' },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'defi-manage-deposit',
                                _c: [
                                    {
                                        id: 'defi-manage-deposit-confirmation',
                                        _c: [
                                            {
                                                id: 'defi-manage-deposit-transaction-success-message',
                                                _c: [
                                                    {
                                                        id: 'defi-manage-deposit-confirmation2',
                                                        _c: [
                                                            { id: 'defi-manage-deposit-transaction-success-message2' },
                                                            { id: 'defi-manage-deposit-transaction-reject-message2' },
                                                        ],
                                                    },
                                                ],
                                            },
                                            { id: 'defi-manage-deposit-transaction-reject-message' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },*/
            {
                id: 'funiswap',
                _c: [
                    {
                        id: 'swap',
                        _c: [
                            {
                                id: 'funiswap-swap',
                                _c: [
                                    {
                                        id: 'funiswap-swap-confirmation',
                                        component: 'f-uniswap-swap-confirmation',
                                        _c: [
                                            {
                                                id: 'funiswap-swap-transaction-success-message',
                                                component: 'transaction-success-message',
                                                _c: [
                                                    {
                                                        id: 'funiswap-swap-confirmation2',
                                                        component: 'f-uniswap-swap-confirmation',
                                                        _c: [
                                                            {
                                                                id: 'funiswap-swap-transaction-success-message2',
                                                                component: 'transaction-success-message',
                                                            },
                                                            {
                                                                id: 'funiswap-swap-transaction-reject-message2',
                                                                component: 'transaction-reject-message',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            {
                                                id: 'funiswap-swap-transaction-reject-message',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'pools',
                        _c: [
                            {
                                id: 'funiswap-pools',
                                _c: [
                                    {
                                        id: 'funiswap-add-liquidity',
                                        _c: [
                                            {
                                                id: 'funiswap-add-liquidity-confirmation',
                                                component: 'f-uniswap-add-liquidity-confirmation',
                                                _c: [
                                                    {
                                                        id: 'funiswap-add-liquidity-transaction-success-message',
                                                        component: 'transaction-success-message',
                                                        _c: [
                                                            {
                                                                id: 'funiswap-add-liquidity-confirmation2',
                                                                component: 'f-uniswap-add-liquidity-confirmation',
                                                                _c: [
                                                                    {
                                                                        id:
                                                                            'funiswap-add-liquidity-transaction-success-message2',
                                                                        component: 'transaction-success-message',
                                                                        _c: [
                                                                            {
                                                                                id:
                                                                                    'funiswap-add-liquidity-confirmation3',
                                                                                component:
                                                                                    'f-uniswap-add-liquidity-confirmation',
                                                                                _c: [
                                                                                    {
                                                                                        id:
                                                                                            'funiswap-add-liquidity-transaction-success-message3',
                                                                                        component:
                                                                                            'transaction-success-message',
                                                                                    },
                                                                                    {
                                                                                        id:
                                                                                            'funiswap-add-liquidity-transaction-reject-message3',
                                                                                        component:
                                                                                            'transaction-reject-message',
                                                                                    },
                                                                                ],
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        id:
                                                                            'funiswap-add-liquidity-transaction-reject-message2',
                                                                        component: 'transaction-reject-message',
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        id: 'funiswap-add-liquidity-transaction-reject-message',
                                                        component: 'transaction-reject-message',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'funiswap-remove-liquidity',
                                        _c: [
                                            {
                                                id: 'funiswap-remove-liquidity-confirmation',
                                                component: 'f-uniswap-remove-liquidity-confirmation',
                                                _c: [
                                                    {
                                                        id: 'funiswap-remove-liquidity-transaction-success-message',
                                                        component: 'transaction-success-message',
                                                        _c: [
                                                            {
                                                                id: 'funiswap-remove-liquidity-confirmation2',
                                                                component: 'f-uniswap-remove-liquidity-confirmation',
                                                                _c: [
                                                                    {
                                                                        id:
                                                                            'funiswap-remove-liquidity-transaction-success-message2',
                                                                        component: 'transaction-success-message',
                                                                    },
                                                                    {
                                                                        id:
                                                                            'funiswap-remove-liquidity-transaction-reject-message2',
                                                                        component: 'transaction-reject-message',
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        id: 'funiswap-remove-liquidity-transaction-reject-message',
                                                        component: 'transaction-reject-message',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'funiswap-pair-detail',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'gov',
                _c: [
                    {
                        id: 'gov-home',
                        _c: [
                            {
                                id: 'gov-proposal-detail',
                                _c: [
                                    {
                                        id: 'gov-proposal-confirmation',
                                        component: 'gov-proposal-confirmation',
                                        _c: [
                                            {
                                                id: 'gov-proposal-transaction-success-message',
                                                component: 'transaction-success-message',
                                            },
                                            {
                                                id: 'gov-proposal-transaction-reject-message',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                    {
                                        id: 'gov-cancel-vote-confirmation',
                                        component: 'gov-cancel-vote-confirmation',
                                        _c: [
                                            {
                                                id: 'gov-cancel-vote-transaction-success-message',
                                                component: 'transaction-success-message',
                                            },
                                            {
                                                id: 'gov-cancel-vote-transaction-reject-message',
                                                component: 'transaction-reject-message',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

/** @type {Tree} */
export const appStructureTree = new Tree(appStructure);

export function getAppParentNode(_id) {
    const node = appStructureTree.get(_id);

    return node ? node._p : null;
}

export function getAppNodeParents(_id) {
    return appStructureTree.getParents(_id);
}
