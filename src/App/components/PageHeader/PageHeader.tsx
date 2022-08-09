/** ***** START: Import React and Dongles *******/
import {
    useEffect,
    useState,
    useCallback,
    Dispatch,
    SetStateAction
} from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { useTranslation } from 'react-i18next';

/** ***** END: Import React and Dongles *********/

/** ***** START: Import Local Files *******/
import styles from './PageHeader.module.css';
import { useRive, useStateMachineInput } from 'rive-react';
import Account from './Account/Account';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import trimString from '../../../utils/functions/trimString';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';

import { useModal } from '../../../components/Global/Modal/useModal';
import Modal from '../../../components/Global/Modal/Modal';
import MagicLogin from './MagicLogin';
import SwitchNetwork from '../../../components/Global/SwitchNetworkAlert/SwitchNetwork/SwitchNetwork';

import { motion, AnimateSharedLayout } from 'framer-motion';

/** ***** END: Import Local Files *********/

interface HeaderPropsIF {
    nativeBalance: string;
    clickLogout: () => void;
    metamaskLocked: boolean;
    ensName: string;
    shouldDisplayAccountTab: boolean;
    chainId: string;
    setFallbackChainId: Dispatch<SetStateAction<string>>;
    isChainValid: boolean;
    switchChain: Dispatch<SetStateAction<string>>;
}

export default function PageHeader(props: HeaderPropsIF) {
    const {
        ensName,
        nativeBalance,
        clickLogout,
        metamaskLocked,
        shouldDisplayAccountTab,
        chainId,
        setFallbackChainId,
        isChainValid,
        switchChain
    } = props;

    const { user, account, enableWeb3, isWeb3Enabled, authenticate, isAuthenticated } =
        useMoralis();

    const { t } = useTranslation();

    const [isModalOpen, openModal, closeModal] = useModal();
    const modalTitle = 'Log in with Email';

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            <MagicLogin closeModal={closeModal} />
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    // function to authenticate wallet with Moralis server
    const clickLogin = () => {
        console.log('user clicked Login');
        if (!isAuthenticated || !isWeb3Enabled) {
            authenticate({
                provider: 'metamask',
                signingMessage: 'Ambient API Authentication.',
                onSuccess: () => {
                    enableWeb3();
                },
                onError: () => {
                    authenticate({
                        provider: 'metamask',
                        signingMessage: 'Ambient API Authentication.',
                        onSuccess: () => {
                            enableWeb3;
                            // alert('🎉');
                        },
                    });
                },
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            reenableWeb3();
        }, 100);
        return () => clearTimeout(timer);
    }, [user, account, metamaskLocked]);

    const reenableWeb3 = useCallback(async () => {
        try {
            if (user && !account && !metamaskLocked) {
                await enableWeb3();
            }
        } catch (err) {
            console.warn(`Could not automatically bridge Moralis to wallet. Error follows: ${err}`);
        }
    }, [user, account, metamaskLocked]);

    // rive component
    const STATE_MACHINE_NAME = 'Basic State Machine';
    const INPUT_NAME = 'Switch';

    const { rive, RiveComponent } = useRive({
        src: './hamburger.riv',
        stateMachines: STATE_MACHINE_NAME,
        autoplay: true,
    });

    const onClickInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);

    // end of rive component

    // Page Header states
    const [mobileNavToggle, setMobileNavToggle] = useState<boolean>(false);

    // End of Page Header States

    // Page Header functions
    function handleMobileNavToggle() {
        setMobileNavToggle(!mobileNavToggle);
        onClickInput?.fire();
    }

    // -----------------SWITCH NETWORK FUNCTIONALITY--------------------------------------
    // eslint-disable-next-line
    const [showSwitchNetwork, setShowSwitchNetwork] = useState(true);
    // eslint-disable-next-line
    // const openSwitchNetwork = useCallback(() => {
    //     setShowSwitchNetwork(true);
    // }, [setShowSwitchNetwork]);
    // eslint-disable-next-line
    const closeSwitchNetwork = useCallback(() => {
        setShowSwitchNetwork(false);
    }, [setShowSwitchNetwork]);

    const switchNetWorkOrNull = isChainValid ? null : (
        <SwitchNetwork
            onClose={closeSwitchNetwork}
            chainId={chainId}
            switchChain={switchChain}
        />
    );

    // -----------------END OF SWITCH NETWORK FUNCTIONALITY--------------------------------------
    const accountAddress = isAuthenticated && account ? trimString(account, 6, 6) : '';

    const accountProps = {
        nativeBalance: nativeBalance,
        accountAddress: accountAddress,
        accountAddressFull: isAuthenticated && account ? account : '',
        ensName: ensName,
        isAuthenticated: isAuthenticated,
        isWeb3Enabled: isWeb3Enabled,
        clickLogout: clickLogout,
        openModal: openModal,
        chainId: chainId,
        setFallbackChainId: setFallbackChainId,
    };

    // End of Page Header Functions

    const metamaskButton = (
        <button className={styles.authenticate_button} onClick={clickLogin}>
            Connect Metamask
        </button>
    );

    // ----------------------------NAVIGATION FUNCTIONALITY-------------------------------------

    const { pathname } = location;
    const tradeDestination = location.pathname.includes('trade/market')
        ? '/trade/market'
        : location.pathname.includes('trade/limit')
        ? '/trade/limit'
        : location.pathname.includes('trade/range')
        ? '/trade/range'
        : location.pathname.includes('trade/edit')
        ? '/trade/edit'
        : '/trade/market';

    const linkData = [
        { title: t('common:homeTitle'), destination: '/', shouldDisplay: true },
        { title: t('common:swapTitle'), destination: '/swap', shouldDisplay: true },
        { title: t('common:tradeTitle'), destination: tradeDestination, shouldDisplay: true },
        { title: t('common:analyticsTitle'), destination: '/analytics', shouldDisplay: true },
        {
            title: t('common:accountTitle'),
            destination: '/account',
            shouldDisplay: shouldDisplayAccountTab,
        },
    ];

    // Most of this functionality can be achieve by using the NavLink instead of Link and accessing the isActive prop on the Navlink. Access to this is needed outside of the link itself for animation purposes, which is why it is being done in this way.
    const routeDisplay = (
        <AnimateSharedLayout>
            <nav
                className={styles.primary_navigation}
                id='primary_navigation'
                data-visible={mobileNavToggle}
            >
                {linkData.map((link, idx) =>
                    link.shouldDisplay ? (
                        <Link
                            className={
                                pathname === link.destination ? styles.active : styles.inactive
                            }
                            to={link.destination}
                            key={idx}
                        >
                            {link.title}

                            {pathname === link.destination && (
                                <motion.div className={styles.underline} layoutId='underline' />
                            )}
                        </Link>
                    ) : null,
                )}
            </nav>
        </AnimateSharedLayout>
    );

    // ----------------------------END OF NAVIGATION FUNCTIONALITY-------------------------------------

    return (
        <header data-testid={'page-header'} className={styles.primary_header}>
            {/* <div className={styles.header_gradient}> </div> */}
            <Link to='/' className={styles.logo_container}>
                <img src={ambientLogo} alt='ambient' />
                <h1>ambient</h1>
            </Link>
            <div
                className={styles.mobile_nav_toggle}
                aria-controls='primary_navigation'
                aria-expanded={mobileNavToggle}
            >
                <RiveComponent onClick={handleMobileNavToggle} />
                <span className='sr-only'>Menu</span>
            </div>

            {routeDisplay}

            <div className={styles.account}>
                <NetworkSelector
                    chainId={chainId}
                    switchChain={switchChain}
                />
                {(!isAuthenticated || !isWeb3Enabled) && metamaskButton}
                <Account {...accountProps} />
            </div>
            {switchNetWorkOrNull}
            {modalOrNull}
        </header>
    );
}
