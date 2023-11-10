import React, { useState } from 'react';
import { ThirdwebSDKProvider } from "@thirdweb-dev/react";

import { ethers } from 'ethers';
import { web3 } from 'web3';
import abi from '../config/abi.json';
import ForwarderAbi from '../config/ForwarderABI.json';
import './MintNFT.css';

// RelayerのURLとフォワーダーアドレスの定義
const RELAYER_URL = 'https://api.defender.openzeppelin.com/autotasks/31600244-164c-4fa6-8470-c28ab5f20697/runs/webhook/b0cf1309-d404-4478-a668-56fb34386738/ED7YrsVMWBhZVA7tA3aD1L';
const RELAYER_FORWARDER_ADDRESS = '0xD05E5231Da57e7FEc9e3798fc1B0855a43E34Fa3';
const contractAddress = "0x38f266A9C91605Ea264cd24B496ce8db7ccb1606"; // ここでコントラクトアドレスを定義


// NFTをミントするためのコンポーネント
const MintNFT = () => {
  const [minting, setMinting] = useState(false); // ミント中の状態を管理するstate

    // // nonceを取得する関数
    // const getNonce = async (signer) => {
    //   const signerAddress = await signer.getAddress();
    //   const nonce = await signer.getTransactionCount();
    //   console.log(`Nonce for address ${signerAddress} is: ${nonce}`);
    //   return nonce;
    // };

  // NFTをミントする関数
  const mintNFT = async () => {
    console.log("mintNFT function started");
    setMinting(true); // ミント処理の開始をstateで管理

      // NFTをミントする関数内
      try {
        // プロバイダーとサイナーの初期化をログ
        console.log("Initializing provider and signer...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("Provider and signer initialized.");

        // コントラクトインスタンスの初期化をログ
        console.log(`Initializing contract instance with address: ${contractAddress}`);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Contract instance initialized:", contract);

        // サイナーアドレスの取得をログ
        console.log("Getting signer address...");
        const signerAddress = await signer.getAddress();
        console.log(`Signer address: ${signerAddress}`);


        // フォワーダコントラクトインスタンスの初期化をログ
        console.log(`Initializing forwarder contract instance with address: ${RELAYER_FORWARDER_ADDRESS}`);
        const forwarderContract = new ethers.Contract(RELAYER_FORWARDER_ADDRESS, ForwarderAbi, signer);
        console.log("Forwarder contract instance initialized:", forwarderContract);

        // nonceの取得をログ
        console.log("Getting nonce for signer...");
        // // const nonce = await getNonce(signer);
        // console.log(`Nonce for signer: ${nonce}`);

        if (!contract) {
          throw new Error("Contract instance is not defined.");

        }

        console.log("Contract instance obtained:", contract);

        // nonceの取得
        // const nonce = await forwarderContract.getNonce(signerAddress);

        // メタトランザクションのデータを準備する
        console.log("Preparing transaction data...");
        const _mintAmount = 1;
        const _maxMintAmount = 8080;
        const _merkleProof = [];
        const _burnId = 0;

        const from = signerAddress;
        const to = contractAddress;
        const value = 0;
        const gas = 87677;
        const data = contract.interface.encodeFunctionData("mint", [
          _mintAmount,
          _maxMintAmount,
          _merkleProof,
          _burnId,
        ]);
        console.log("Transaction data prepared.");


        // EIP-712署名用のデータを準備
        const domain = {
          name: 'MinimalForwarder',
          version: '0.0.1',
          chainId: (await signer.getChainId()),
          verifyingContract: RELAYER_FORWARDER_ADDRESS
        };

        const types = {
          ForwardRequest: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'gas', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'data', type: 'bytes' },
          ]
        };

        const message = {
          from: from,
          to: to,
          value: value,
          gas: gas,
          nonce: 0,
          data: data
        };

        // 署名者のアドレスを取得
        console.log("Signing address:", signerAddress);

        // console.log( wallet instanceof ethers.Wallet);

        console.log("Signer methods:", Object.keys(signer));

        // 署名プロセス
        const signature = await signer._signTypedData(domain, types, message);

        // 署名が16進数の文字列であることを確認し、リレイヤーに渡す
        if (typeof signature !== 'string' || !signature.startsWith('0x')) {
          throw new Error('Invalid signature format. Signature must be a hex string.');
        }

        console.log('Signature:', signature);


        // 署名プロセスのデバッグ情報をログに出力
        console.log('signerToUse:', signer);
        console.log('provider:', signer.provider);
        console.log('provider methods:', Object.keys(signer.provider));

        // 署名者のアドレスをもう一度出力（確認用）
        console.log("Address that signed the request:", signerAddress);

      // リレイヤーに送信するリクエストを構築
      const relayerRequest = {
        type: "forward",
        request: {
          from: from,
          to: to,
          value: value.toString(), // 大きな数値は文字列として扱う
          gas: gas.toString(), // 大きな数値は文字列として扱う
          nonce: 0, // 大きな数値は文字列として扱う
          data: data
        },
        signature: signature, // 16進数の文字列としてそのまま使用
        forwarderAddress: RELAYER_FORWARDER_ADDRESS
      };

      // リレイヤーにリクエストを送信
      const response = await fetch(RELAYER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // signatureをリクエストオブジェクトとは別に送信
        body: JSON.stringify(relayerRequest),
      });

        console.log("Sending transaction with the following parameters:");
        console.log(`From: ${from}`);
        console.log(`To: ${to}`);
        console.log(`Value: ${value}`);
        console.log(`Gas Limit: ${gas}`);
        // console.log(`Nonce: ${nonce}`);
        console.log(`Data: ${data}`);
        console.log(`Signature: ${signature}`);
        console.log("Initializing web3 and contract instances...");
        // ここで web3 と contract のインスタンスを初期化するコードを追加
        console.log(`web3 is defined: ${typeof web3 !== 'undefined'}`);
        console.log(`contract is defined: ${typeof contract !== 'undefined'}`);
        console.log(`forwardercontract is defined: ${typeof forwarderContract !== 'undefined'}`);


        const jsonResponse = await response.json();
        console.log("Relayer response:", jsonResponse);

        console.log("Signing address:", signerAddress);

        // レスポンスの確認
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          console.log("Transaction sent by relayer:", jsonResponse.txHash);
        }
      } catch (error) {
        console.error("Error during minting process:", error);
      } finally {
        setMinting(false); // ミント処理の終了をstateで管理
      }

  };

  return (
    <ThirdwebSDKProvider
          chainId={5} // 使用するチェーンID（ここではGoerliテストネット）
          provider={window.ethereum} // 使用するプロバイダー（ここではwindow.ethereum）
          sdkOptions={{
              gasless: {
                  openzeppelin: {
                      relayerUrl: RELAYER_URL, // リレイヤーのURL
                      relayerForwarderAddress: RELAYER_FORWARDER_ADDRESS, // リレイヤーのフォワーダーアドレス
                  },
              },
          }}
      >
      <div>
          {/* ミントボタンなどのUIコンポーネント */}
          <button onClick={mintNFT} disabled={minting}>Mint NFT</button>
      </div>
      </ThirdwebSDKProvider>
  );
};

export default MintNFT;