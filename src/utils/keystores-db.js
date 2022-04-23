import Dexie from 'dexie';

/**
 * IndexedDB storage for keystore files
 */
class KeystoresDB extends Dexie {
    constructor() {
        super('KeystoresDB');

        this.version(1).stores({
            keystores: '&address',
        });
    }

    /**
     * @param {string} address Account address
     * @return {Promise<*>}
     */
    getKeystoreFile(address) {
        return this.keystores.get(address);
    }

    /**
     * @param {string} address Account address
     * @param {Object} keystore Keystore file
     * @return {Promise<*>}
     */
    addKeystoreFile(address, keystore) {
        return this.keystores.put({ address, keystore });
    }

    /**
     * @param {string} address Account address
     * @return {Promise<*>}
     */
    deleteKeystoreFile(address) {
        return this.keystores.where({ address }).delete();
    }
}

export const keystoresDB = new KeystoresDB();
