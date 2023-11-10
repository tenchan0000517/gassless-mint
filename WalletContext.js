import React, { createContext, useReducer, useContext, useEffect } from 'react';

// 初期状態
const initialState = {
    wallet: null,
    address: null,
    signer: null,
    walletType: null, // ウォレットタイプを保存するための新しい状態
};

// アクションタイプ
const SET_WALLET_DATA = 'SET_WALLET_DATA';
const SET_WALLET_TYPE = 'SET_WALLET_TYPE'; // 新しいアクションタイプ

// レデューサー
function walletReducer(state, action) {
    switch (action.type) {
        case SET_WALLET_DATA:
            return { ...state, ...action.payload };
        case SET_WALLET_TYPE: // 新しいケースを追加
            return { ...state, walletType: action.payload };
        default:
            return state;
    }
}

// コンテキストの作成
const WalletContext = createContext();

// プロバイダーコンポーネント
export const WalletProvider = ({ children }) => {
    const [state, dispatch] = useReducer(walletReducer, initialState);

    // state.address の変更を監視して、コンソールログに出力
    useEffect(() => {
        if (state.address) {
            console.log("Wallet address from context:", state.address);
        } else {
            console.log("No wallet connected from context");
        }
    }, [state.address]);

    // walletInstanceの変更を監視して、ウォレットのタイプを状態に保存
    useEffect(() => {
        if (state.wallet && state.wallet.walletId) {
            const walletType = state.wallet.walletId; // walletIdプロパティを使用してウォレットのタイプを取得
            console.log("Active wallet type:", walletType);
            console.log("Active wallet address:", state.address);
            dispatch({ type: SET_WALLET_TYPE, payload: walletType }); // ウォレットタイプを状態に保存するアクションをディスパッチ
        }
    }, [state.wallet, state.address, dispatch]);

    return (
        <WalletContext.Provider value={{ state, dispatch }}>
            {children}
        </WalletContext.Provider>
    );
};

// カスタムフック
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export default WalletContext;
