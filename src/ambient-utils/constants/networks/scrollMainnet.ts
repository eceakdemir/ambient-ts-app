import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { scrollETH, scrollUSDC } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from '@ethersproject/providers';

const wagmiChain = {
    id: 534352,
    name: 'Scroll',
    network: 'scroll',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.scroll.io/'],
        },
        public: {
            http: ['https://rpc.scroll.io/'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Scrollscan',
            url: 'https://scrollscan.com',
        },
    },
    testnet: false,
};

export const scrollMainnet: NetworkIF = {
    chainId: '0x82750',
    graphCacheUrl: 'https://ambindexer.net/scroll-gcgo',
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x82750',
    defaultPair: [scrollETH, scrollUSDC],
    topPools: [
        new TopPool(scrollETH, scrollUSDC, lookupChain('0x82750').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (await provider.getGasPrice()).toNumber() * 1e-9;
    },
};
