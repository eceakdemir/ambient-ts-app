import React, {
    createContext,
    SetStateAction,
    Dispatch,
    useEffect,
    useMemo,
    useState,
    useContext,
} from 'react';
import useWebSocket from 'react-use-websocket';
import {
    IS_LOCAL_ENV,
    SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT,
} from '../constants';
import isJsonString from '../utils/functions/isJsonString';
import { useAppDispatch } from '../utils/hooks/reduxToolkit';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { supportedNetworks } from '../utils/networks';
import { setLastBlock } from '../utils/state/graphDataSlice';
import { CachedDataContext } from './CachedDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenContext } from './TokenContext';
import { Client } from '@covalenthq/client-sdk';
import { UserDataContext } from './UserDataContext';

interface ChainDataContextIF {
    gasPriceInGwei: number | undefined;
    setGasPriceinGwei: Dispatch<SetStateAction<number | undefined>>;
    lastBlockNumber: number;
    setLastBlockNumber: Dispatch<SetStateAction<number>>;
    client: Client;
}

export const ChainDataContext = createContext<ChainDataContextIF>(
    {} as ChainDataContextIF,
);

export const ChainDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { chainData, crocEnv, provider } = useContext(CrocEnvContext);
    const [tokenBalances, setTokenBalances] = React.useState<
        TokenIF[] | undefined
    >(undefined);

    const { cachedFetchTokenBalances, cachedTokenDetails } =
        useContext(CachedDataContext);
    const { tokens } = useContext(TokenContext);

    const client = new Client(process.env.REACT_APP_COVALENT_API_KEY || '');

    const dispatch = useAppDispatch();
    const { userAddress, isUserConnected } = useContext(UserDataContext);

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);
    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();

    async function pollBlockNum(): Promise<void> {
        // if default RPC is Infura, use key from env variable
        const nodeUrl =
            chainData.nodeUrl.toLowerCase().includes('infura') &&
            process.env.REACT_APP_INFURA_KEY
                ? chainData.nodeUrl.slice(0, -32) +
                  process.env.REACT_APP_INFURA_KEY
                : chainData.nodeUrl;

        return fetch(nodeUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 'app-blockNum-sub', // Arbitary string (see JSON-RPC spec)
            }),
        })
            .then((response) => response?.json())
            .then((json) => json?.result)
            .then(parseInt)
            .then((blockNum) => {
                if (blockNum > lastBlockNumber) {
                    setLastBlockNumber(blockNum);
                    dispatch(setLastBlock(blockNum));
                }
            })
            .catch(console.error);
    }
    const BLOCK_NUM_POLL_MS = 2000;
    useEffect(() => {
        (async () => {
            await pollBlockNum();
            // Don't use polling, useWebSocket (below)
            if (chainData.wsUrl) {
                return;
            }
            // Grab block right away, then poll on periodic basis

            const interval = setInterval(async () => {
                await pollBlockNum();
            }, BLOCK_NUM_POLL_MS);
            return () => clearInterval(interval);
        })();
    }, [chainData.nodeUrl, BLOCK_NUM_POLL_MS]);
    /* This will not work with RPCs that don't support web socket subscriptions. In
     * particular Infura does not support websockets on Arbitrum endpoints. */
    const { sendMessage: sendBlockHeaderSub, lastMessage: lastNewHeadMessage } =
        useWebSocket(chainData.wsUrl || null, {
            onOpen: () => {
                sendBlockHeaderSub(
                    '{"jsonrpc":"2.0","method":"eth_subscribe","params":["newHeads"],"id":5}',
                );
            },
            onClose: (event: CloseEvent) => {
                if (IS_LOCAL_ENV) {
                    false &&
                        console.debug('infura newHeads subscription closed');
                    false && console.debug({ event });
                }
            },
            shouldReconnect: () => SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT,
        });
    useEffect(() => {
        if (lastNewHeadMessage && lastNewHeadMessage.data) {
            if (!isJsonString(lastNewHeadMessage.data)) return;
            const lastMessageData = JSON.parse(lastNewHeadMessage.data);
            if (lastMessageData) {
                const lastBlockNumberHex =
                    lastMessageData.params?.result?.number;
                if (lastBlockNumberHex) {
                    const newBlockNum = parseInt(lastBlockNumberHex);
                    if (lastBlockNumber !== newBlockNum) {
                        setLastBlockNumber(parseInt(lastBlockNumberHex));
                        dispatch(setLastBlock(parseInt(lastBlockNumberHex)));
                    }
                }
            }
        }
    }, [lastNewHeadMessage]);

    const fetchGasPrice = async () => {
        const newGasPrice = await supportedNetworks[
            chainData.chainId
        ].getGasPriceInGwei(provider);
        if (gasPriceInGwei !== newGasPrice) {
            setGasPriceinGwei(newGasPrice);
        }
    };

    useEffect(() => {
        fetchGasPrice();
    }, [lastBlockNumber]);

    // prevents useEffect below from triggering every block update
    const everyEigthBlock = useMemo(
        () => Math.floor(lastBlockNumber / 8),
        [lastBlockNumber],
    );

    useEffect(() => {
        (async () => {
            IS_LOCAL_ENV &&
                console.debug('fetching native token and erc20 token balances');
            if (
                crocEnv &&
                isUserConnected &&
                userAddress &&
                chainData.chainId
            ) {
                try {
                    const tokenBalances: TokenIF[] =
                        await cachedFetchTokenBalances(
                            userAddress,
                            chainData.chainId,
                            everyEigthBlock,
                            cachedTokenDetails,
                            crocEnv,
                            client,
                        );
                    const tokensWithLogos = tokenBalances.map((token) => {
                        const oldToken: TokenIF | undefined =
                            tokens.getTokenByAddress(token.address);
                        const newToken = { ...token };
                        newToken.name = oldToken ? oldToken.name : '';
                        newToken.logoURI = oldToken ? oldToken.logoURI : '';
                        return newToken;
                    });

                    setTokenBalances(tokensWithLogos);
                } catch (error) {
                    setTokenBalances([]);
                    console.error({ error });
                }
            }
        })();
    }, [
        crocEnv,
        isUserConnected,
        userAddress,
        chainData.chainId,
        everyEigthBlock,
    ]);

    const chainDataContext = {
        lastBlockNumber,
        setLastBlockNumber,
        gasPriceInGwei,
        setGasPriceinGwei,
        client,
    };

    return (
        <ChainDataContext.Provider value={chainDataContext}>
            {props.children}
        </ChainDataContext.Provider>
    );
};
