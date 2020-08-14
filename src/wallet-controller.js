import { generateHdWallet, getHdWalletAccount } from './popup/utils/hdWallet';
import { stringifyForStorage, parseFromStorage } from './popup/utils/helper';
import decryptKeystore from './popup/utils/decrypt-keystore';

class WalletController {
  constructor() {
    if (!process.env.IS_EXTENSION) return;
    setInterval(() => {
      browser.windows.getAll({}).then(wins => {
        if (wins.length === 0) {
          this.lockWallet();
          sessionStorage.removeItem('phishing_urls');
        }
      });
      if (!this.wallet) {
        this.lockWallet();
      }
    }, 5000);
  }

  async unlockWallet({ accountPassword, encryptedPrivateKey }) {
    const match = await decryptKeystore(encryptedPrivateKey, accountPassword);
    if (match !== false) {
      this.wallet = generateHdWallet(match);
      const { address } = getHdWalletAccount(this.wallet);
      return { decrypt: true, address };
    }
    return { decrypt: false };
  }

  lockWallet() {
    this.wallet = null;
  }

  generateWallet({ seed }) {
    this.wallet = generateHdWallet(parseFromStorage(seed));
    const { address } = getHdWalletAccount(this.wallet);
    return { generate: true, address };
  }

  getKeypair({ activeAccount, account }) {
    try {
      return stringifyForStorage({
        publicKey: account.publicKey,
        secretKey: getHdWalletAccount(this.wallet, activeAccount).secretKey,
      });
    } catch (e) {
      return { error: true };
    }
  }

  getAccount({ idx }) {
    return {
      address: getHdWalletAccount(this.wallet, idx).address,
    };
  }

  isLoggedIn() {
    return typeof this.wallet !== 'undefined' && this.wallet != null;
  }
}

export default new WalletController();
