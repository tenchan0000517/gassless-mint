import React from 'react';
import { WalletConnect } from './components/WalletConnect';
import { WalletProvider } from './contexts/WalletContext';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Goerli } from "@thirdweb-dev/chains";
import { smartWallet, metamaskWallet, coinbaseWallet, walletConnect, localWallet, embeddedWallet } from "@thirdweb-dev/react";
import MintNFT from './components/MintNFT'; // MintNFTコンポーネントをインポート
// import NFTViewer from './components/NFTViewer/NFTViewer';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS;

const smartWalletOptions = {
    factoryAddress: FACTORY_ADDRESS,
    gasless: true,
};

const App = () => {
    return (
        <WalletProvider>
            <ThirdwebProvider 
                clientId={CLIENT_ID} 
                secretKey={SECRET_KEY} 
                supportedChains={[Goerli]} 
                supportedWallets={[
                    smartWallet(metamaskWallet(), smartWalletOptions),
                    smartWallet(coinbaseWallet({ recommended: true }), smartWalletOptions),
                    smartWallet(walletConnect(), smartWalletOptions),
                    smartWallet(localWallet(), smartWalletOptions),
                    smartWallet(embeddedWallet(), smartWalletOptions),
                ]}
            >
                <WalletConnect />
                <MintNFT /> {/* MintNFTコンポーネントを追加 */}
                {/* <NFTViewer /> NFTViewerコンポーネントを追加 */}
            </ThirdwebProvider>
        </WalletProvider>
    );
};

export default App;
