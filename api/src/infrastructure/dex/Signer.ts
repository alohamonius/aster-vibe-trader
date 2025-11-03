import { ethers } from 'ethers';
import { Keypair, PublicKey } from '@solana/web3.js';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';
import { SignatureParams } from '@/shared/types';
import { logger } from '@/shared/utils/logger';

export class EthereumSigner {
  private wallet: ethers.Wallet;

  constructor(privateKey: string) {
    this.wallet = new ethers.Wallet(privateKey);
  }

  public getAddress(): string {
    return this.wallet.address;
  }

  public async signParameters(params: SignatureParams): Promise<string> {
    try {
      // Remove signature and other non-data fields
      const { nonce, user, signer, ...dataParams } = params;

      // Trim and prepare parameters similar to Python implementation
      const trimmedParams = this.trimParameters(dataParams);

      // Create JSON string (sorted keys, no spaces)
      const jsonStr = JSON.stringify(trimmedParams, Object.keys(trimmedParams).sort()).replace(/\s/g, '');

      logger.debug('JSON string for signing:', { jsonStr });

      // Encode parameters using ABI encoding
      const types = ['string', 'address', 'address', 'uint256'];
      const values = [jsonStr, user, signer, nonce];

      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
      logger.debug('Encoded parameters:', { encoded });

      // Hash the encoded data
      const hash = ethers.keccak256(encoded);
      logger.debug('Keccak256 hash:', { hash });

      // Sign the hash
      const signature = await this.wallet.signMessage(ethers.getBytes(hash));

      logger.debug('Generated signature:', { signature });

      return signature;
    } catch (error) {
      logger.error('Error signing parameters:', error);
      throw error;
    }
  }

  private trimParameters(params: any): any {
    const trimmed: any = {};

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          trimmed[key] = JSON.stringify(value.map(item =>
            typeof item === 'object' ? JSON.stringify(this.trimParameters(item)) : String(item)
          ));
        } else if (typeof value === 'object') {
          trimmed[key] = JSON.stringify(this.trimParameters(value));
        } else {
          trimmed[key] = String(value);
        }
      }
    }

    return trimmed;
  }

  public async signMessage(message: string): Promise<string> {
    try {
      return await this.wallet.signMessage(message);
    } catch (error) {
      logger.error('Error signing message:', error);
      throw error;
    }
  }
}

export class SolanaSigner {
  private keypair: Keypair;

  constructor(privateKey: string) {
    try {
      // Handle different private key formats
      let secretKey: Uint8Array;

      if (privateKey.startsWith('0x')) {
        // Hex format (remove 0x prefix)
        const hex = privateKey.slice(2);
        secretKey = new Uint8Array(Buffer.from(hex, 'hex'));
      } else if (privateKey.length === 128) {
        // Hex format without 0x
        secretKey = new Uint8Array(Buffer.from(privateKey, 'hex'));
      } else {
        // Base58 format
        secretKey = bs58.decode(privateKey);
      }

      // Ensure 64 bytes for Solana keypair
      if (secretKey.length === 32) {
        // If only 32 bytes, this is likely the private key portion
        // We need to generate the full 64-byte secret key
        throw new Error('Solana private key must be 64 bytes (full secret key)');
      }

      this.keypair = Keypair.fromSecretKey(secretKey);
    } catch (error) {
      logger.error('Error creating Solana keypair:', error);
      throw new Error(`Invalid Solana private key format: ${error}`);
    }
  }

  public getAddress(): string {
    return this.keypair.publicKey.toBase58();
  }

  public async signParameters(params: SignatureParams): Promise<string> {
    try {
      // Remove signature and other non-data fields
      const { nonce, user, signer, ...dataParams } = params;

      // Trim and prepare parameters similar to Python implementation
      const trimmedParams = this.trimParameters(dataParams);

      // Create JSON string (sorted keys, no spaces)
      const jsonStr = JSON.stringify(trimmedParams, Object.keys(trimmedParams).sort()).replace(/\s/g, '');

      logger.debug('JSON string for signing:', { jsonStr });

      // For Solana, we need to create a message that matches Aster's expected format
      // This might need adjustment based on how Aster DEX handles Solana signatures
      const message = `${jsonStr}${user}${signer}${nonce}`;
      const messageBytes = new TextEncoder().encode(message);

      logger.debug('Message for signing:', { message });

      // Sign the message using Solana's ed25519 signature
      const signature = sign.detached(messageBytes, this.keypair.secretKey);
      const signatureBase58 = bs58.encode(signature);

      logger.debug('Generated Solana signature:', { signature: signatureBase58 });

      return signatureBase58;
    } catch (error) {
      logger.error('Error signing parameters with Solana:', error);
      throw error;
    }
  }

  private trimParameters(params: any): any {
    const trimmed: any = {};

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          trimmed[key] = JSON.stringify(value.map(item =>
            typeof item === 'object' ? JSON.stringify(this.trimParameters(item)) : String(item)
          ));
        } else if (typeof value === 'object') {
          trimmed[key] = JSON.stringify(this.trimParameters(value));
        } else {
          trimmed[key] = String(value);
        }
      }
    }

    return trimmed;
  }

  public async signMessage(message: string): Promise<string> {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signature = sign.detached(messageBytes, this.keypair.secretKey);
      return bs58.encode(signature);
    } catch (error) {
      logger.error('Error signing message with Solana:', error);
      throw error;
    }
  }
}