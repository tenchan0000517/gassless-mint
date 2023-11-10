import React, { useContext, useEffect } from 'react';
import { useAddress, useWallet, useSigner } from "@thirdweb-dev/react";
import { Goerli } from "@thirdweb-dev/chains";
import { ThirdwebProvider, ConnectWallet, smartWallet, metamaskWallet, coinbaseWallet, walletConnect, localWallet, embeddedWallet } from "@thirdweb-dev/react";
import WalletContext from '../contexts/WalletContext';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS;

const smartWalletOptions = {
    factoryAddress: FACTORY_ADDRESS,
    gasless: true,
};

const SET_WALLET_DATA = 'SET_WALLET_DATA';

export function WalletConnect({ children }) {
    const address = useAddress();
    const walletInstance = useWallet();
    const signer = useSigner();

    console.log("Address from useAddress hook:", address);
    console.log("Address from useSigner hook:", signer);
    console.log("Address from useWallet hook:", walletInstance);

    const { dispatch } = useContext(WalletContext);

    // address, walletInstance, signerをコンテキストに渡す
    useEffect(() => {
        dispatch({
            type: SET_WALLET_DATA,
            payload: {
                address,
                wallet: walletInstance,
                signer
            }
        });
    }, [address, walletInstance, signer, dispatch]);

    function handleConnect(walletData) {
        dispatch({ type: SET_WALLET_DATA, payload: walletData });
    }

    return (
        <ThirdwebProvider clientId={CLIENT_ID} secretKey={SECRET_KEY} supportedChains={[Goerli]} supportedWallets={[
            smartWallet(metamaskWallet(), smartWalletOptions),
            smartWallet(coinbaseWallet({ recommended: true }), smartWalletOptions),
            smartWallet(walletConnect(), smartWalletOptions),
            smartWallet(localWallet(), smartWalletOptions),
            smartWallet(embeddedWallet(), smartWalletOptions),
        ]}>
            <ConnectWallet theme={"dark"} modalSize={"compact"} onConnect={handleConnect} />
            {children}
        </ThirdwebProvider>
    );
}

export default WalletConnect;
