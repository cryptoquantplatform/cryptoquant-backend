const { ethers } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const pool = require('../config/database');
const walletService = require('./walletService');

// Ethereum provider
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com';
const ethProvider = new ethers.JsonRpcProvider(ETH_RPC_URL);

// USDT Contract address (Ethereum mainnet)
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

// Transfer crypto from user wallet to admin wallet
async function transferCrypto(userId, crypto, fromAddress, toAddress, amount) {
    try {
        console.log(`🔄 Starting transfer: ${amount} ${crypto} from ${fromAddress} to ${toAddress}`);

        // Get private key for user's wallet
        const keyResult = await pool.query(
            'SELECT private_key_encrypted FROM user_deposit_addresses WHERE user_id = $1 AND crypto = $2',
            [userId, crypto]
        );

        if (keyResult.rows.length === 0) {
            return {
                success: false,
                message: 'Wallet not found'
            };
        }

        const encryptedKey = keyResult.rows[0].private_key_encrypted;
        
        // Skip if shared key
        if (encryptedKey === 'SHARED_WITH_ETH') {
            // For USDT, use ETH private key
            if (crypto === 'USDT') {
                const ethKeyResult = await pool.query(
                    'SELECT private_key_encrypted FROM user_deposit_addresses WHERE user_id = $1 AND crypto = $2',
                    [userId, 'ETH']
                );
                if (ethKeyResult.rows.length === 0) {
                    return { success: false, message: 'ETH key not found for USDT transfer' };
                }
                return await transferUSDT(ethKeyResult.rows[0].private_key_encrypted, toAddress, amount);
            }
        }

        // Transfer based on crypto type
        if (crypto === 'ETH') {
            return await transferEthereum(encryptedKey, toAddress, amount);
        } else if (crypto === 'USDT') {
            return await transferUSDT(encryptedKey, toAddress, amount);
        } else if (crypto === 'BTC') {
            return await transferBitcoin(encryptedKey, fromAddress, toAddress, amount);
        } else if (crypto === 'SOL') {
            return await transferSolana(encryptedKey, toAddress, amount);
        } else {
            return {
                success: false,
                message: 'Unsupported crypto type'
            };
        }

    } catch (error) {
        console.error('Transfer crypto error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Transfer Ethereum
async function transferEthereum(encryptedPrivateKey, toAddress, amount) {
    try {
        // Decrypt private key
        const privateKey = walletService.decryptPrivateKey(encryptedPrivateKey);
        const wallet = new ethers.Wallet(privateKey, ethProvider);

        // Convert amount to Wei
        const amountWei = ethers.parseEther(amount.toString());

        // Get current gas price
        const feeData = await ethProvider.getFeeData();
        
        // Estimate gas
        const gasLimit = 21000n; // Standard ETH transfer
        const gasCost = gasLimit * feeData.gasPrice;

        // Check if we need to leave some ETH for gas
        const totalNeeded = amountWei + gasCost;
        const balance = await ethProvider.getBalance(wallet.address);

        let finalAmount = amountWei;
        if (balance < totalNeeded) {
            // Send all except gas fees
            finalAmount = balance - gasCost - ethers.parseEther('0.0001'); // Leave small buffer
        }

        // Create transaction
        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: finalAmount,
            gasLimit: gasLimit,
            gasPrice: feeData.gasPrice
        });

        console.log(`✅ ETH transfer sent. TX Hash: ${tx.hash}`);

        // Wait for confirmation
        await tx.wait();

        return {
            success: true,
            txHash: tx.hash,
            amount: ethers.formatEther(finalAmount)
        };

    } catch (error) {
        console.error('Transfer Ethereum error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Transfer USDT (ERC-20)
async function transferUSDT(encryptedPrivateKey, toAddress, amount) {
    try {
        // Decrypt private key
        const privateKey = walletService.decryptPrivateKey(encryptedPrivateKey);
        const wallet = new ethers.Wallet(privateKey, ethProvider);

        // USDT contract
        const usdtAbi = [
            'function transfer(address to, uint256 value) returns (bool)',
            'function balanceOf(address) view returns (uint256)'
        ];
        const usdtContract = new ethers.Contract(USDT_CONTRACT, usdtAbi, wallet);

        // Convert amount (USDT has 6 decimals)
        const amountWithDecimals = Math.floor(parseFloat(amount) * 1000000);

        // Send transaction
        const tx = await usdtContract.transfer(toAddress, amountWithDecimals);

        console.log(`✅ USDT transfer sent. TX Hash: ${tx.hash}`);

        // Wait for confirmation
        await tx.wait();

        return {
            success: true,
            txHash: tx.hash,
            amount: amount
        };

    } catch (error) {
        console.error('Transfer USDT error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Transfer Bitcoin
async function transferBitcoin(encryptedPrivateKey, fromAddress, toAddress, amount) {
    try {
        const bip32 = require('bip32');
        const ecc = require('tiny-secp256k1');
        
        console.log(`🔄 Starting Bitcoin transfer: ${amount} BTC from ${fromAddress} to ${toAddress}`);
        
        // Decrypt private key
        const privateKeyHex = walletService.decryptPrivateKey(encryptedPrivateKey);
        const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
        
        // Get UTXOs from BlockCypher
        const utxoResponse = await axios.get(
            `https://api.blockcypher.com/v1/btc/main/addrs/${fromAddress}?unspentOnly=true`
        );
        
        if (!utxoResponse.data.txrefs || utxoResponse.data.txrefs.length === 0) {
            return {
                success: false,
                message: 'No unspent outputs found for this address'
            };
        }
        
        const network = bitcoin.networks.bitcoin;
        const txb = new bitcoin.TransactionBuilder(network);
        
        // Add inputs (UTXOs)
        let totalInput = 0;
        for (const utxo of utxoResponse.data.txrefs) {
            txb.addInput(utxo.tx_hash, utxo.tx_output_n);
            totalInput += utxo.value;
        }
        
        // Convert BTC to satoshis
        const satoshis = Math.floor(parseFloat(amount) * 100000000);
        
        // Calculate fee (assume 10 sat/byte, typical tx is ~250 bytes)
        const fee = 2500;
        
        // Calculate final amount
        let finalAmount = satoshis;
        if (totalInput < satoshis + fee) {
            // Send all minus fee
            finalAmount = totalInput - fee;
        }
        
        // Add output (recipient)
        txb.addOutput(toAddress, finalAmount);
        
        // If change needed
        if (totalInput > finalAmount + fee + 546) { // 546 is dust limit
            const change = totalInput - finalAmount - fee;
            txb.addOutput(fromAddress, change);
        }
        
        // Sign all inputs
        const BIP32Factory = bip32.BIP32Factory(ecc);
        const keyPair = bitcoin.ECPair.fromPrivateKey(privateKeyBuffer, { network });
        
        for (let i = 0; i < utxoResponse.data.txrefs.length; i++) {
            txb.sign(i, keyPair);
        }
        
        // Build and broadcast
        const tx = txb.build();
        const txHex = tx.toHex();
        
        // Broadcast via BlockCypher
        const broadcastResponse = await axios.post(
            'https://api.blockcypher.com/v1/btc/main/txs/push',
            { tx: txHex }
        );
        
        console.log(`✅ BTC transfer sent. TX Hash: ${broadcastResponse.data.tx.hash}`);
        
        return {
            success: true,
            txHash: broadcastResponse.data.tx.hash,
            amount: (finalAmount / 100000000).toString()
        };

    } catch (error) {
        console.error('Transfer Bitcoin error:', error);
        
        // Provide more helpful error message
        if (error.response && error.response.status === 429) {
            return {
                success: false,
                message: 'Rate limit exceeded. Please try again in a few minutes or use a Bitcoin wallet manually.'
            };
        }
        
        return {
            success: false,
            message: `Bitcoin transfer error: ${error.message}. You may need to transfer manually using a Bitcoin wallet.`
        };
    }
}

// Transfer Solana
async function transferSolana(encryptedPrivateKey, toAddress, amount) {
    try {
        const solanaWeb3 = require('@solana/web3.js');
        
        // Decrypt private key
        const privateKeyHex = walletService.decryptPrivateKey(encryptedPrivateKey);
        const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');
        
        // Create keypair from private key
        const fromKeypair = solanaWeb3.Keypair.fromSecretKey(privateKeyBytes);
        
        // Connect to Solana mainnet
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta'),
            'confirmed'
        );
        
        // Create recipient public key
        const toPublicKey = new solanaWeb3.PublicKey(toAddress);
        
        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        
        // Convert amount to lamports (1 SOL = 1,000,000,000 lamports)
        const lamports = Math.floor(parseFloat(amount) * 1000000000);
        
        // Check if we need to reserve some for fees
        const balance = await connection.getBalance(fromKeypair.publicKey);
        const rentExemption = await connection.getMinimumBalanceForRentExemption(0);
        const fee = 5000; // Typical transaction fee
        
        let finalAmount = lamports;
        if (balance < lamports + fee) {
            // Send all except fee
            finalAmount = balance - fee - rentExemption;
        }
        
        // Create transfer transaction
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toPublicKey,
                lamports: finalAmount
            })
        );
        
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromKeypair.publicKey;
        
        // Sign and send transaction
        const signature = await solanaWeb3.sendAndConfirmTransaction(
            connection,
            transaction,
            [fromKeypair],
            { commitment: 'confirmed' }
        );
        
        console.log(`✅ SOL transfer sent. Signature: ${signature}`);
        
        return {
            success: true,
            txHash: signature,
            amount: (finalAmount / 1000000000).toString()
        };

    } catch (error) {
        console.error('Transfer Solana error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports = {
    transferCrypto,
    transferEthereum,
    transferUSDT,
    transferBitcoin,
    transferSolana
};

