/**
 * MMCurrency info object
 * @typedef {Object} MMCurrency
 * @property {string} name
 * @property {string} symbol 2-6 characters long
 * @property {number} decimals 18
 */

/**
 * MMChain info object
 * @typedef {Object} MMChain
 * @property {string} chainId A 0x-prefixed hexadecimal string
 * @property {string} chainName
 * @property {MMCurrency} nativeCurrency
 * @property {string[]} rpcUrls
 * @property {string[]} [blockExplorerUrls]
 * @property {string[]} [iconUrls] Currently ignored.
 */

/**
 * MMAssetOptions info object
 * @typedef {Object} MMAssetOptions
 * @property {string} address The address that the token is at
 * @property {string} symbol A ticker symbol or shorthand, up to 5 chars
 * @property {number} decimals The number of decimals in the token
 * @property {string} image A string url of the token logo
 */

/**
 * MMAsset info object
 * @typedef {Object} MMAsset
 * @property {'ERC20'} type Initially only supports ERC20
 * @property {MMAssetOptions} options
 */
