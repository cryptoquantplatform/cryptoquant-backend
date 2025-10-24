const crypto = require('crypto');
const { HDKey } = require('@scure/bip32');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');

class WalletService {
    constructor() {
        // WICHTIG: Diese Mnemonic in .env speichern und NIEMALS committen!
        this.masterMnemonic = process.env.WALLET_MASTER_MNEMONIC || 
            'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        
        this.masterSeed = null;
        this.initMasterSeed();
    }

    async initMasterSeed() {
        this.masterSeed = await bip39.mnemonicToSeed(this.masterMnemonic);
        console.log('✅ Master seed initialized');
    }

    /**
     * Generiert Bitcoin Adresse für einen User
     * @param {number} userId - User ID
     * @returns {Object} - { address, derivationPath }
     */
    generateBTCAddress(userId) {
        // BIP44 Path für Bitcoin: m/44'/0'/0'/0/userId
        const path = `m/44'/0'/0'/0/${userId}`;
        
        const hdKey = HDKey.fromMasterSeed(this.masterSeed);
        const child = hdKey.derive(path);
        
        // Generate P2WPKH (Native SegWit) address
        const { address } = bitcoin.payments.p2wpkh({
            pubkey: Buffer.from(child.publicKey),
            network: bitcoin.networks.bitcoin // oder .testnet für Testing
        });

        return {
            address,
            derivationPath: path,
            currency: 'BTC'
        };
    }

    /**
     * Generiert Ethereum Adresse für einen User
     * @param {number} userId - User ID
     * @returns {Object} - { address, derivationPath }
     */
    generateETHAddress(userId) {
        // BIP44 Path für Ethereum: m/44'/60'/0'/0/userId
        const path = `m/44'/60'/0'/0/${userId}`;
        
        const hdKey = HDKey.fromMasterSeed(this.masterSeed);
        const child = hdKey.derive(path);
        
        // Ethereum address from public key
        const wallet = new ethers.Wallet(Buffer.from(child.privateKey).toString('hex'));
        
        return {
            address: wallet.address,
            derivationPath: path,
            currency: 'ETH'
        };
    }

    /**
     * Generiert USDT (ERC-20) Adresse - gleich wie ETH
     * @param {number} userId - User ID
     * @returns {Object} - { address, derivationPath }
     */
    generateUSDTAddress(userId) {
        const ethWallet = this.generateETHAddress(userId);
        return {
            ...ethWallet,
            currency: 'USDT'
        };
    }

    /**
     * Generiert alle Wallet-Adressen für einen neuen User
     * @param {number} userId - User ID
     * @returns {Array} - Array von Wallet-Objekten
     */
    generateAllWallets(userId) {
        return [
            this.generateBTCAddress(userId),
            this.generateETHAddress(userId),
            this.generateUSDTAddress(userId)
        ];
    }

    /**
     * Überprüft ob eine Adresse diesem User gehört
     * @param {string} address - Wallet Adresse
     * @param {number} userId - User ID
     * @returns {boolean}
     */
    verifyAddressOwnership(address, userId) {
        const wallets = this.generateAllWallets(userId);
        return wallets.some(wallet => wallet.address === address);
    }
}

module.exports = new WalletService();
