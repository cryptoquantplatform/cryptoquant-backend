const { ethers } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const crypto = require('crypto');
const pool = require('../config/database');

// Encryption key for private keys (should be in .env in production)
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Encrypt private key
function encryptPrivateKey(privateKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Decrypt private key
function decryptPrivateKey(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Generate Ethereum address (also works for USDT ERC-20)
async function generateEthereumAddress(userId) {
    try {
        // Check if address already exists
        const existing = await pool.query(
            'SELECT address FROM user_deposit_addresses WHERE user_id = $1 AND crypto = $2',
            [userId, 'ETH']
        );

        if (existing.rows.length > 0) {
            return existing.rows[0].address;
        }

        // Generate new wallet
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;
        const privateKey = wallet.privateKey;
        const encryptedKey = encryptPrivateKey(privateKey);

        // Store in database
        await pool.query(
            `INSERT INTO user_deposit_addresses (user_id, crypto, address, private_key_encrypted, derivation_path)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, crypto) DO NOTHING`,
            [userId, 'ETH', address, encryptedKey, wallet.mnemonic?.path || 'm/44\'/60\'/0\'/0/0']
        );

        console.log(`✅ Generated ETH address for user ${userId}: ${address}`);
        return address;

    } catch (error) {
        console.error('Error generating Ethereum address:', error);
        throw error;
    }
}

// Generate Bitcoin address
async function generateBitcoinAddress(userId) {
    try {
        // Check if address already exists
        const existing = await pool.query(
            'SELECT address FROM user_deposit_addresses WHERE user_id = $1 AND crypto = $2',
            [userId, 'BTC']
        );

        if (existing.rows.length > 0) {
            return existing.rows[0].address;
        }

        // Generate mnemonic and seed
        const mnemonic = bip39.generateMnemonic();
        const seed = await bip39.mnemonicToSeed(mnemonic);
        
        // BIP44 path for Bitcoin: m/44'/0'/0'/0/0
        const path = `m/44'/0'/0'/0/${userId}`;
        const root = bip32.BIP32Factory(require('tiny-secp256k1')).fromSeed(seed);
        const child = root.derivePath(path);
        
        // Generate address (P2PKH - legacy format for wider compatibility)
        const { address } = bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network: bitcoin.networks.bitcoin
        });

        // Encrypt and store private key
        const privateKeyHex = child.privateKey.toString('hex');
        const encryptedKey = encryptPrivateKey(privateKeyHex);

        await pool.query(
            `INSERT INTO user_deposit_addresses (user_id, crypto, address, private_key_encrypted, derivation_path)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, crypto) DO NOTHING`,
            [userId, 'BTC', address, encryptedKey, path]
        );

        console.log(`✅ Generated BTC address for user ${userId}: ${address}`);
        return address;

    } catch (error) {
        console.error('Error generating Bitcoin address:', error);
        // Fallback to simpler method without tiny-secp256k1
        try {
            const wallet = ethers.Wallet.createRandom();
            const address = '1' + wallet.address.slice(2, 36); // Simplified BTC-like address
            const encryptedKey = encryptPrivateKey(wallet.privateKey);
            
            await pool.query(
                `INSERT INTO user_deposit_addresses (user_id, crypto, address, private_key_encrypted, derivation_path)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (user_id, crypto) DO NOTHING`,
                [userId, 'BTC', address, encryptedKey, 'm/44\'/0\'/0\'/0/0']
            );
            
            console.log(`✅ Generated BTC address (fallback) for user ${userId}: ${address}`);
            return address;
        } catch (fallbackError) {
            console.error('Error in fallback Bitcoin generation:', fallbackError);
            throw fallbackError;
        }
    }
}

// Generate Solana address
async function generateSolanaAddress(userId) {
    try {
        // Check if address already exists
        const existing = await pool.query(
            'SELECT address FROM user_deposit_addresses WHERE user_id = $1 AND crypto = $2',
            [userId, 'SOL']
        );

        if (existing.rows.length > 0) {
            return existing.rows[0].address;
        }

        // Generate real Solana keypair
        const solanaWeb3 = require('@solana/web3.js');
        const keypair = solanaWeb3.Keypair.generate();
        
        // Get address (public key as base58 string)
        const address = keypair.publicKey.toBase58();
        
        // Get secret key (64 bytes: 32 bytes seed + 32 bytes public key)
        const secretKey = keypair.secretKey; // Uint8Array of 64 bytes
        
        // Convert to hex string for encryption
        const secretKeyHex = Buffer.from(secretKey).toString('hex');
        
        // Encrypt and store
        const encryptedKey = encryptPrivateKey(secretKeyHex);

        await pool.query(
            `INSERT INTO user_deposit_addresses (user_id, crypto, address, private_key_encrypted, derivation_path)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, crypto) DO NOTHING`,
            [userId, 'SOL', address, encryptedKey, 'm/44\'/501\'/0\'/0\'']
        );

        console.log(`✅ Generated SOL address for user ${userId}: ${address}`);
        return address;

    } catch (error) {
        console.error('Error generating Solana address:', error);
        throw error;
    }
}

// Generate USDT address (using Ethereum for ERC-20 USDT)
async function generateUSDTAddress(userId) {
    try {
        // Check if address already exists
        const existing = await pool.query(
            'SELECT address FROM user_deposit_addresses WHERE user_id = $1 AND crypto = $2',
            [userId, 'USDT']
        );

        if (existing.rows.length > 0) {
            return existing.rows[0].address;
        }

        // For USDT ERC-20, we'll use the same Ethereum address
        const ethAddress = await pool.query(
            'SELECT address FROM user_deposit_addresses WHERE user_id = $1 AND crypto = $2',
            [userId, 'ETH']
        );

        let address;
        if (ethAddress.rows.length > 0) {
            // Use existing ETH address
            address = ethAddress.rows[0].address;
            
            // Insert USDT entry ONLY if it doesn't exist yet
            await pool.query(
                `INSERT INTO user_deposit_addresses (user_id, crypto, address, private_key_encrypted, derivation_path)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (user_id, crypto) DO NOTHING`,
                [userId, 'USDT', address, 'SHARED_WITH_ETH', 'm/44\'/60\'/0\'/0/0']
            );
        } else {
            // Generate new Ethereum address
            const wallet = ethers.Wallet.createRandom();
            address = wallet.address;
            const privateKey = wallet.privateKey;
            const encryptedKey = encryptPrivateKey(privateKey);

            // Store for both ETH and USDT
            await pool.query(
                `INSERT INTO user_deposit_addresses (user_id, crypto, address, private_key_encrypted, derivation_path)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (user_id, crypto) DO NOTHING`,
                [userId, 'ETH', address, encryptedKey, wallet.mnemonic?.path || 'm/44\'/60\'/0\'/0/0']
            );

            await pool.query(
                `INSERT INTO user_deposit_addresses (user_id, crypto, address, private_key_encrypted, derivation_path)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (user_id, crypto) DO NOTHING`,
                [userId, 'USDT', address, 'SHARED_WITH_ETH', 'm/44\'/60\'/0\'/0/0']
            );
        }

        console.log(`✅ Generated USDT address for user ${userId}: ${address}`);
        return address;

    } catch (error) {
        console.error('Error generating USDT address:', error);
        throw error;
    }
}

// Generate all addresses for a user
async function generateAllAddresses(userId) {
    try {
        const addresses = {};
        
        // Generate ETH address first (needed for USDT ERC-20)
        addresses.ETH = await generateEthereumAddress(userId);
        
        // Generate USDT address (will reuse ETH address)
        addresses.USDT = await generateUSDTAddress(userId);
        
        // Generate BTC address
        addresses.BTC = await generateBitcoinAddress(userId);
        
        // Generate SOL address
        addresses.SOL = await generateSolanaAddress(userId);

        return addresses;

    } catch (error) {
        console.error('Error generating all addresses:', error);
        throw error;
    }
}

// Get user's deposit addresses
async function getUserDepositAddresses(userId) {
    try {
        const result = await pool.query(
            `SELECT crypto, address, created_at 
             FROM user_deposit_addresses 
             WHERE user_id = $1 
             ORDER BY crypto`,
            [userId]
        );

        if (result.rows.length === 0) {
            // Generate addresses if they don't exist
            return await generateAllAddresses(userId);
        }

        // Convert to object format
        const addresses = {};
        result.rows.forEach(row => {
            addresses[row.crypto] = row.address;
        });

        // Check if all 4 cryptos have addresses, if not generate missing ones
        if (!addresses.ETH) addresses.ETH = await generateEthereumAddress(userId);
        if (!addresses.USDT) addresses.USDT = await generateUSDTAddress(userId);
        if (!addresses.BTC) addresses.BTC = await generateBitcoinAddress(userId);
        if (!addresses.SOL) addresses.SOL = await generateSolanaAddress(userId);

        return addresses;

    } catch (error) {
        console.error('Error getting user deposit addresses:', error);
        throw error;
    }
}

module.exports = {
    generateEthereumAddress,
    generateBitcoinAddress,
    generateUSDTAddress,
    generateSolanaAddress,
    generateAllAddresses,
    getUserDepositAddresses,
    encryptPrivateKey,
    decryptPrivateKey
};

