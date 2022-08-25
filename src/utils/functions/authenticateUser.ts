import { AuthenticateOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisAuth';
import { Web3EnableOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisWeb3';
import { Moralis } from 'moralis';

// function to authenticate wallet with Moralis server
export default function authenticateUser(
    isAuthenticated: boolean,
    isWeb3Enabled: boolean,
    authenticate: (
        options?: AuthenticateOptions | undefined,
    ) => Promise<Moralis.User<Moralis.Attributes> | undefined>,
    enableWeb3: (
        options?: Web3EnableOptions | undefined,
    ) => Promise<Moralis.Web3Provider | undefined>,
) {
    const signingMessage = `Welcome to Ambient Finance!
        Click to sign in and accept the Ambient Terms of Service: https://ambient-finance.netlify.app/tos
        This request will not trigger a blockchain transaction or cost any gas fees.
        Your authentication status will reset on logout.`;
    if (!isAuthenticated || !isWeb3Enabled) {
        authenticate({
            provider: 'metamask',
            signingMessage: signingMessage,
            onSuccess: async () => {
                await enableWeb3();
            },
            onError: () => {
                authenticate({
                    provider: 'metamask',
                    signingMessage: signingMessage,
                    onSuccess: async () => {
                        await enableWeb3();
                    },
                });
            },
        });
    }
}
