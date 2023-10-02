// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState } from 'react';

// START: Import JSX Components
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';
import Button from '../../components/Form/Button';

// START: Import Local Files
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';

import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { useAccount } from 'wagmi';
import { useLinkGen, linkGenMethodsIF } from '../../utils/hooks/useLinkGen';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { exponentialNumRegEx } from '../../utils/regex/exports';

import { CachedDataContext } from '../../contexts/CachedDataContext';
import LocalTokenSelect from '../../components/Global/LocalTokenSelect/LocalTokenSelect';

import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { PoolContext } from '../../contexts/PoolContext';
import RangeBounds from '../../components/Global/RangeBounds/RangeBounds';
// import { toggleAdvancedMode } from '../../utils/state/tradeDataSlice';
import { LuEdit2 } from 'react-icons/lu';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { FlexContainer, Text } from '../../styled/Common';
import Toggle from '../../components/Form/Toggle';
import { TextOnlyTooltip } from '../../components/Global/StyledTooltip/StyledTooltip';
import { TokenContext } from '../../contexts/TokenContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';

import { useTokenBalancesAndAllowances } from '../../App/hooks/useTokenBalancesAndAllowances';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import Spinner from '../../components/Global/Spinner/Spinner';
import AdvancedModeToggle from '../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import { getMoneynessRank } from '../../utils/functions/getMoneynessRank';
import { WarningBox } from '../../components/RangeActionModal/WarningBox/WarningBox';
import { ethereumMainnet } from '../../utils/networks/ethereumMainnet';
import InitSkeleton from './InitSkeleton';
import InitConfirmation from './InitConfirmation';
import MultiContentComponent from '../../components/Global/MultiStepTransaction/MultiContentComponent';
import { useSendInit } from '../../App/hooks/useSendInit';

import { useApprove } from '../../App/functions/approve';
import { useMediaQuery } from '@material-ui/core';
import { CurrencyQuantityInput } from '../../styled/Components/TradeModules';
import RangeTokenInput from '../../components/Trade/Range/RangeTokenInput/RangeTokenInput';
import { useCreateRangePosition } from '../../App/hooks/useCreateRangePosition';
import { isStablePair } from '../../utils/data/stablePairs';
import {
    getPinnedPriceValuesFromTicks,
    getPinnedTickFromDisplayPrice,
    roundDownTick,
    roundUpTick,
} from '../Trade/Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    DEFAULT_MAX_PRICE_DIFF_PERCENTAGE,
    DEFAULT_MIN_PRICE_DIFF_PERCENTAGE,
} from '../Trade/Range/Range';
import {
    setAdvancedLowTick,
    setAdvancedHighTick,
} from '../../utils/state/tradeDataSlice';
import { concDepositSkew, fromDisplayPrice } from '@crocswap-libs/sdk';
import truncateDecimals from '../../utils/data/truncateDecimals';
// react functional component
export default function InitPool() {
    const {
        wagmiModal: { open: openWagmiModalWallet },
    } = useContext(AppStateContext);
    const {
        crocEnv,
        provider,
        ethMainnetUsdPrice,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const { dexBalRange, mintSlippage } = useContext(UserPreferenceContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { poolPriceDisplay } = useContext(PoolContext);

    const { tokens } = useContext(TokenContext);
    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

    // const handleToggle = () => dispatch(toggleAdvancedMode());
    const {
        tradeData: { advancedMode, advancedHighTick, advancedLowTick },
    } = useAppSelector((state) => state);

    const { isConnected } = useAccount();

    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean | null>(null);

    const { approve, isApprovalPending } = useApprove();
    // const [isInitPending, setIsInitPending] = useState(false);

    console.log({ approve, isApprovalPending });

    const [initialPriceDisplay, setInitialPriceDisplay] = useState<string>('');

    const [initialPriceInBaseDenom, setInitialPriceInBaseDenom] = useState<
        number | undefined
    >();

    const [estimatedInitialPriceDisplay, setEstimatedInitialPriceDisplay] =
        useState<string>('0');
    // const [initialPriceForDOM, setInitialPriceForDOM] = useState<string>('');

    const { sessionReceipts } = useAppSelector((state) => state.receiptData);
    const {
        tradeData: { tokenA, tokenB, baseToken, quoteToken },
    } = useAppSelector((state) => state);
    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

    const {
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenAAllowance,
        tokenBAllowance,

        isTokenABase,
    } = useTokenBalancesAndAllowances(baseToken, quoteToken);

    const isBaseTokenMoneynessGreaterOrEqual =
        baseToken.symbol && quoteToken.symbol
            ? getMoneynessRank(baseToken.symbol) -
                  getMoneynessRank(quoteToken.symbol) >=
              0
            : false;

    const [isDenomBase, setIsDenomBase] = useState(false);

    const gridSize = lookupChain(chainId).gridSize;

    useEffect(() => {
        setIsDenomBase(!isBaseTokenMoneynessGreaterOrEqual);
    }, [isBaseTokenMoneynessGreaterOrEqual]);

    const isTokenPairDefault =
        baseToken.address === ZERO_ADDRESS && quoteToken.symbol === 'USDC';

    useEffect(() => {
        // make sure crocEnv exists (needs a moment to spin up)
        if (crocEnv) {
            // check if pool exists for token addresses from URL params
            const doesPoolExist = crocEnv
                .pool(baseToken.address, quoteToken.address)
                .isInit();
            // resolve the promise
            Promise.resolve(doesPoolExist)
                // update value of poolExists, use `null` for `undefined`
                .then((res) => setPoolExists(res ?? null));
        } else {
            // set value of poolExists as null if there is no crocEnv
            // this is handled as a pre-initialization condition, not a false
            setPoolExists(null);
        }
        // re-run hook if a new crocEnv is created
        // this will happen if the user switches chains
    }, [crocEnv, sessionReceipts.length, baseToken, quoteToken]);
    const [isAmbient, setIsAmbient] = useState(false);

    const [rangeLowBoundNonDisplayPrice, setRangeLowBoundNonDisplayPrice] =
        useState(0);
    const [rangeHighBoundNonDisplayPrice, setRangeHighBoundNonDisplayPrice] =
        useState(0);

    const updateEstimatedInitialPrice = async () => {
        const mainnetBase =
            baseToken.address === ZERO_ADDRESS
                ? ethereumMainnet.tokens['WETH']
                : ethereumMainnet.tokens[
                      baseToken?.symbol as keyof typeof ethereumMainnet.tokens
                  ];
        const mainnetQuote =
            ethereumMainnet.tokens[
                quoteToken?.symbol as keyof typeof ethereumMainnet.tokens
            ];
        const basePricePromise = cachedFetchTokenPrice(
            mainnetBase,
            ethereumMainnet.chainId,
        );
        const quotePricePromise = cachedFetchTokenPrice(
            mainnetQuote,
            ethereumMainnet.chainId,
        );

        const basePrice = await basePricePromise;
        const quotePrice = await quotePricePromise;

        const isReferencePriceAvailable =
            basePrice !== undefined && quotePrice !== undefined;

        const baseUsdPrice = basePrice?.usdPrice || 2000;
        const quoteUsdPrice = quotePrice?.usdPrice || 1;

        const defaultPriceNumInBase = baseUsdPrice / quoteUsdPrice;

        const defaultPriceTruncated =
            defaultPriceNumInBase < 0.0001
                ? defaultPriceNumInBase.toExponential(2)
                : defaultPriceNumInBase < 2
                ? defaultPriceNumInBase.toPrecision(3)
                : defaultPriceNumInBase.toFixed(2);

        if (isReferencePriceAvailable && initialPriceDisplay === '') {
            setInitialPriceInBaseDenom(defaultPriceNumInBase);
        }
        if (isDenomBase) {
            setEstimatedInitialPriceDisplay(defaultPriceTruncated);
            isReferencePriceAvailable &&
            initialPriceDisplay === '' &&
            !isTokenPairDefault
                ? setInitialPriceDisplay(defaultPriceTruncated)
                : !initialPriceInBaseDenom
                ? setInitialPriceDisplay('')
                : undefined;
        } else {
            const invertedPriceNum = 1 / defaultPriceNumInBase;

            const invertedPriceTruncated =
                invertedPriceNum < 0.0001
                    ? invertedPriceNum.toExponential(2)
                    : invertedPriceNum < 2
                    ? invertedPriceNum.toPrecision(3)
                    : invertedPriceNum.toFixed(2);
            setEstimatedInitialPriceDisplay(invertedPriceTruncated);

            isReferencePriceAvailable &&
            initialPriceDisplay === '' &&
            !isTokenPairDefault
                ? setInitialPriceDisplay(invertedPriceTruncated)
                : !initialPriceInBaseDenom
                ? setInitialPriceDisplay('')
                : undefined;
        }
    };

    useEffect(() => {
        setInitialPriceInBaseDenom(undefined);
        setInitialPriceDisplay('');
    }, [baseToken, quoteToken]);

    useEffect(() => {
        (async () => {
            await updateEstimatedInitialPrice();
        })();
    }, [baseToken, quoteToken, isDenomBase]);

    useEffect(() => {
        handleDisplayUpdate();
    }, [isDenomBase]);

    const selectedPoolPriceTick = useMemo(() => {
        if (!initialPriceDisplay) return 0;
        // TODO: confirm this logic,epecially isMinPrice
        return getPinnedTickFromDisplayPrice(
            isDenomBase,
            baseToken.decimals,
            quoteToken.decimals,
            true,
            initialPriceDisplay,
            gridSize,
        );
    }, [initialPriceDisplay, isDenomBase, baseToken, quoteToken, gridSize]);

    const shouldResetAdvancedLowTick =
        advancedLowTick === 0 ||
        advancedHighTick > selectedPoolPriceTick + 100000 ||
        advancedLowTick < selectedPoolPriceTick - 100000;
    const shouldResetAdvancedHighTick =
        advancedHighTick === 0 ||
        advancedHighTick > selectedPoolPriceTick + 100000 ||
        advancedLowTick < selectedPoolPriceTick - 100000;

    const defaultLowTick = useMemo<number>(() => {
        const value: number =
            shouldResetAdvancedLowTick || advancedLowTick === 0
                ? roundDownTick(
                      selectedPoolPriceTick +
                          DEFAULT_MIN_PRICE_DIFF_PERCENTAGE * 100,
                      gridSize,
                  )
                : advancedLowTick;
        return value;
    }, [advancedLowTick, selectedPoolPriceTick, shouldResetAdvancedLowTick]);

    // default high tick to seed in the DOM (range upper value)
    const defaultHighTick = useMemo<number>(() => {
        const value: number =
            shouldResetAdvancedHighTick || advancedHighTick === 0
                ? roundUpTick(
                      selectedPoolPriceTick +
                          DEFAULT_MAX_PRICE_DIFF_PERCENTAGE * 100,
                      gridSize,
                  )
                : advancedHighTick;
        return value;
    }, [advancedHighTick, selectedPoolPriceTick, shouldResetAdvancedHighTick]);

    useEffect(() => {
        if (advancedMode) {
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseToken.decimals,
                quoteToken.decimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            );
            setRangeLowBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            );
            setRangeHighBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            );

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );
            setPinnedMaxPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );

            dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
            dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

            const highTickDiff =
                pinnedDisplayPrices.pinnedHighTick - selectedPoolPriceTick;
            const lowTickDiff =
                pinnedDisplayPrices.pinnedLowTick - selectedPoolPriceTick;

            const highGeometricDifferencePercentage =
                Math.abs(highTickDiff) < 200
                    ? parseFloat(truncateDecimals(highTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(highTickDiff / 100, 0));
            const lowGeometricDifferencePercentage =
                Math.abs(lowTickDiff) < 200
                    ? parseFloat(truncateDecimals(lowTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(lowTickDiff / 100, 0));
            isDenomBase
                ? setMaxPriceDifferencePercentage(
                      -lowGeometricDifferencePercentage,
                  )
                : setMaxPriceDifferencePercentage(
                      highGeometricDifferencePercentage,
                  );

            isDenomBase
                ? setMinPriceDifferencePercentage(
                      -highGeometricDifferencePercentage,
                  )
                : setMinPriceDifferencePercentage(
                      lowGeometricDifferencePercentage,
                  );

            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
                const rangeHighBoundDisplayField = document.getElementById(
                    'max-price-input-quantity',
                ) as HTMLInputElement;

                if (rangeHighBoundDisplayField) {
                    rangeHighBoundDisplayField.value =
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
                }
            }

            setMaxPrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinPrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
        }
    }, [
        selectedPoolPriceTick,
        defaultLowTick,
        defaultHighTick,
        isDenomBase,
        baseToken.decimals,
        quoteToken.decimals,
        advancedMode,
    ]);

    const handleDisplayUpdate = () => {
        if (initialPriceDisplay) {
            if (isDenomBase) {
                setInitialPriceDisplay(
                    initialPriceInBaseDenom?.toString() ?? '',
                );
            } else {
                const invertedPriceNum = 1 / (initialPriceInBaseDenom ?? 1);

                const invertedPriceTruncated =
                    invertedPriceNum < 0.0001
                        ? invertedPriceNum.toExponential(2)
                        : invertedPriceNum < 2
                        ? invertedPriceNum.toPrecision(3)
                        : invertedPriceNum.toFixed(2);
                setInitialPriceDisplay(invertedPriceTruncated);
            }
        }
    };

    const [connectButtonDelayElapsed, setConnectButtonDelayElapsed] =
        useState(false);
    const [initGasPriceinDollars, setInitGasPriceinDollars] = useState<
        string | undefined
    >();

    useEffect(() => {
        const timer = setTimeout(() => {
            setConnectButtonDelayElapsed(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // calculate price of gas for pool init
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const averageInitCostInGasDrops = 157922;
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageInitCostInGasDrops *
                1e-9 *
                ethMainnetUsdPrice;

            setInitGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) > 0;
    const isTokenBAllowanceSufficient = parseFloat(tokenBAllowance) > 0;

    const focusInput = () => {
        const inputField = document.getElementById(
            'initial-pool-price-quantity',
        ) as HTMLInputElement;

        const timer = setTimeout(() => {
            inputField.focus();
            inputField.setSelectionRange(
                inputField.value.length,
                inputField.value.length,
            );
        }, 500);
        return () => clearTimeout(timer);
    };

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    // const { approve, isApprovalPending } = useApprove();

    // hooks to generate navigation actions with pre-loaded paths
    // const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const { sendInit, isInitPending } = useSendInit();

    const placeholderText = `e.g. ${estimatedInitialPriceDisplay} (${
        isDenomBase ? baseToken.symbol : quoteToken.symbol
    }/${isDenomBase ? quoteToken.symbol : baseToken.symbol})`;

    const handleInitialPriceInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const isValid =
            event.target.value === '' ||
            event.target.value === '.' ||
            exponentialNumRegEx.test(event.target.value);
        const targetValue = event.target.value.replaceAll(',', '');
        const input = targetValue.startsWith('.')
            ? '0' + targetValue
            : targetValue;
        const targetValueNum = parseFloat(input);
        isValid && setInitialPriceDisplay(input);

        if (
            isValid &&
            ((!isNaN(targetValueNum) && targetValueNum !== 0) ||
                event.target.value === '')
        ) {
            if (event.target.value === '') {
                setInitialPriceInBaseDenom(undefined);
            } else {
                if (isDenomBase) {
                    setInitialPriceInBaseDenom(targetValueNum);
                } else {
                    setInitialPriceInBaseDenom(1 / targetValueNum);
                }
            }
        }
    };

    // Begin Range Logic
    const { createRangePosition } = useCreateRangePosition();
    // TODO: implement disabling logic when range is out of bounds
    const [isTokenAInputDisabled, setIsTokenAInputDisabled] = useState(false);
    const [isTokenBInputDisabled, setIsTokenBInputDisabled] = useState(false);

    const slippageTolerancePercentage = isStablePair(
        tokenA.address,
        tokenB.address,
        chainId,
    )
        ? mintSlippage.stable
        : mintSlippage.volatile;

    const selectedPoolNonDisplayPrice = useMemo(() => {
        const selectedPriceInBaseDenom = isDenomBase
            ? 1 / parseFloat(initialPriceDisplay)
            : parseFloat(initialPriceDisplay);
        const priceNonDisplayNum = fromDisplayPrice(
            selectedPriceInBaseDenom,
            baseToken.decimals,
            quoteToken.decimals,
        );
        return priceNonDisplayNum;
    }, [isDenomBase, baseToken, quoteToken, initialPriceDisplay]);

    const depositSkew = useMemo(
        () =>
            concDepositSkew(
                selectedPoolNonDisplayPrice ?? 0,
                rangeLowBoundNonDisplayPrice,
                rangeHighBoundNonDisplayPrice,
            ),
        [
            selectedPoolNonDisplayPrice,
            rangeLowBoundNonDisplayPrice,
            rangeHighBoundNonDisplayPrice,
        ],
    );

    // console.log({
    //     depositSkew,
    //     selectedPoolNonDisplayPrice,
    //     rangeLowBoundNonDisplayPrice,
    //     rangeHighBoundNonDisplayPrice,
    // });

    // Tick functions modified from normal range
    // default low tick to seed in the DOM (range lower value)
    // initialPriceInBaseDenom

    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');

    const [showConfirmation, setShowConfirmation] = useState(false);
    const transactionApproved = newRangeTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    useEffect(() => {
        if (!isAmbient) {
            if (isTokenABase) {
                if (defaultHighTick < selectedPoolPriceTick) {
                    setIsTokenBInputDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenAInputDisabled(false);
                    } else setIsTokenAInputDisabled(true);
                } else if (defaultLowTick > selectedPoolPriceTick) {
                    setIsTokenAInputDisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenBInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else {
                    setIsTokenAInputDisabled(false);
                    setIsTokenBInputDisabled(false);
                }
            } else {
                if (defaultHighTick < selectedPoolPriceTick) {
                    setIsTokenAInputDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenBInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else if (defaultLowTick > selectedPoolPriceTick) {
                    setIsTokenBInputDisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenAInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else {
                    setIsTokenBInputDisabled(false);
                    setIsTokenAInputDisabled(false);
                }
            }
        } else {
            setIsTokenBInputDisabled(false);
            setIsTokenAInputDisabled(false);
        }
    }, [
        isAmbient,
        isTokenABase,
        selectedPoolPriceTick,
        defaultLowTick,
        defaultHighTick,
        isDenomBase,
    ]);

    useEffect(() => {
        console.log({
            newRangeTransactionHash,
            txErrorCode,
            showConfirmation,
            depositSkew,
        });
    }, [newRangeTransactionHash, txErrorCode, showConfirmation, depositSkew]);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setTxErrorCode('');
        setNewRangeTransactionHash('');
    };

    // Next step - understand how sider affects these params
    const sendRangePosition = async () => {
        const params = {
            slippageTolerancePercentage,
            isAmbient,
            tokenAInputQty: isTokenAInputDisabled
                ? 0
                : parseFloat(baseCollateral),
            tokenBInputQty: isTokenBInputDisabled
                ? 0
                : parseFloat(quoteCollateral),
            isWithdrawTokenAFromDexChecked,
            isWithdrawTokenBFromDexChecked,
            defaultLowTick,
            defaultHighTick,
            isAdd: false, // Always false for init
            setNewRangeTransactionHash,
            setTxErrorCode,
            resetConfirmation,
            setShowConfirmation,
            poolPrice: selectedPoolNonDisplayPrice,
        };
        console.log('Debug, calling createRangePosition', params);
        createRangePosition(params);
    };

    const [isMintLiqEnabled, setIsMintLiqEnabled] = useState(true);

    const sendTransaction = isMintLiqEnabled
        ? async () => {
              console.log('initializing and minting');
              sendInit(initialPriceInBaseDenom, sendRangePosition);
          }
        : () => {
              console.log('initializing');
              sendInit(initialPriceInBaseDenom);
          };
    const ButtonToRender = () => {
        let buttonContent;

        switch (true) {
            case poolExists:
                // Display button for an already initialized pool
                buttonContent = (
                    <Button
                        title='Pool Already Initialized'
                        disabled={true}
                        action={() => {
                            IS_LOCAL_ENV && console.debug('clicked');
                        }}
                        flat={true}
                    />
                );
                break;

            case isConnected || !connectButtonDelayElapsed:
                // Display different buttons based on various conditions
                if (!isTokenAAllowanceSufficient) {
                    // Display token A approval button
                    buttonContent = tokenAApprovalButton;
                } else if (!isTokenBAllowanceSufficient) {
                    // Display token B approval button
                    buttonContent = tokenBApprovalButton;
                } else if (
                    initialPriceDisplay === '' ||
                    parseFloat(initialPriceDisplay.replaceAll(',', '')) <= 0
                ) {
                    // Display button to enter an initial price
                    buttonContent = (
                        <Button
                            title='Enter an Initial Price'
                            disabled={true}
                            action={() => {
                                IS_LOCAL_ENV && console.debug('clicked');
                            }}
                            flat={true}
                        />
                    );
                } else if (isInitPending === true) {
                    // Display button for pending initialization
                    buttonContent = (
                        <Button
                            title='Initialization Pending'
                            disabled={true}
                            action={() => {
                                IS_LOCAL_ENV && console.debug('clicked');
                            }}
                            flat={true}
                        />
                    );
                } else {
                    // Display confirm button for final step
                    buttonContent = (
                        <Button
                            title='Confirm'
                            disabled={erc20TokenWithDexBalance !== undefined}
                            action={() => setActiveContent('confirmation')}
                            flat={true}
                        />
                    );
                }
                break;

            default:
                // Display button to connect wallet if no conditions match
                buttonContent = (
                    <Button
                        title='Connect Wallet'
                        action={openWagmiModalWallet}
                        flat={true}
                    />
                );
                break;
        }

        return buttonContent;
    };

    const tokenAApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenA.symbol}`
                    : `${tokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenA.address, tokenA.symbol);
            }}
            flat={true}
        />
    );

    const tokenBApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenB.symbol}`
                    : `${tokenB.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenB.address, tokenB.symbol);
            }}
            flat={true}
        />
    );

    // Newwwwww Init code

    // eslint-disable-next-line
    const [tokenModalOpen, setTokenModalOpen] = useState(false);
    // eslint-disable-next-line
    const [baseCollateral, setBaseCollateral] = useState<string>('');
    // eslint-disable-next-line
    const [quoteCollateral, setQuoteCollateral] = useState<string>('');

    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);

    // See Range.tsx line 81
    const [rangeWidthPercentage, setRangeWidthPercentage] =
        useState<number>(10);
    const [
        // eslint-disable-next-line
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState(false);

    // eslint-disable-next-line
    const [pinnedDisplayPrices, setPinnedDisplayPrices] = useState<
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined
    >();
    // eslint-disable-next-line
    // eslint-disable-next-line
    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] =
        useState('');
    // eslint-disable-next-line
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] =
        useState('');
    const minPriceDisplay = isAmbient ? '0' : pinnedMinPriceDisplayTruncated;
    const maxPriceDisplay = isAmbient
        ? 'Infinity'
        : pinnedMaxPriceDisplayTruncated;

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;
    const poolPriceCharacter = isDenomBase
        ? isTokenABase
            ? getUnicodeCharacter(tokenB.symbol)
            : getUnicodeCharacter(tokenA.symbol)
        : !isTokenABase
        ? getUnicodeCharacter(tokenB.symbol)
        : getUnicodeCharacter(tokenA.symbol);

    // Min Max Price
    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');
    // eslint-disable-next-line
    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(-10);
    // eslint-disable-next-line
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(10);
    // eslint-disable-next-line
    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] =
        useState(false);
    // eslint-disable-next-line
    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] =
        useState(false);
    const [minPrice, setMinPrice] = useState(10);
    const [maxPrice, setMaxPrice] = useState(100);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (rangeWidthPercentage === 100 && !advancedMode) {
            setIsAmbient(true);
            setRangeLowBoundNonDisplayPrice(0);
            setRangeHighBoundNonDisplayPrice(Infinity);
        } else if (advancedMode) {
            setIsAmbient(false);
        } else {
            setIsAmbient(false);
            if (
                Math.abs(selectedPoolPriceTick) === Infinity ||
                Math.abs(selectedPoolPriceTick) === 0
            )
                return;
            const lowTick = selectedPoolPriceTick - rangeWidthPercentage * 100;
            const highTick = selectedPoolPriceTick + rangeWidthPercentage * 100;

            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseToken.decimals,
                quoteToken.decimals,
                lowTick,
                highTick,
                gridSize,
            );

            setPinnedDisplayPrices(pinnedDisplayPrices);

            setRangeLowBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            );
            setRangeHighBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            );

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );
            setPinnedMaxPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );

            dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
            dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

            setMaxPrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinPrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
        }
    }, [
        rangeWidthPercentage,
        advancedMode,
        isDenomBase,
        selectedPoolPriceTick,
        baseToken.address + quoteToken.address,
        baseToken.decimals,
        quoteToken.decimals,
    ]);

    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
        inputId: 'input-slider-range',
    };

    const rangePriceInfoProps = {
        pinnedDisplayPrices: pinnedDisplayPrices,
        spotPriceDisplay: getFormattedNumber({
            value: displayPriceWithDenom,
        }),
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        aprPercentage: 10,
        daysInRange: 10,
        isTokenABase: false,
        poolPriceCharacter: poolPriceCharacter,
        isAmbient: isAmbient,
    };

    const minMaxPriceProps = {
        minPricePercentage: minPriceDifferencePercentage,
        maxPricePercentage: maxPriceDifferencePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMinPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        isDenomBase: isDenomBase,
        highBoundOnBlur: () => setRangeHighBoundFieldBlurred(true),
        lowBoundOnBlur: () => setRangeLowBoundFieldBlurred(true),
        rangeLowTick: defaultLowTick,
        rangeHighTick: defaultHighTick,
        disable: false,
        maxPrice: maxPrice,
        minPrice: minPrice,
        setMaxPrice: setMaxPrice,
        setMinPrice: setMinPrice,
    };

    function goToNewUrlParams(
        chain: string,
        addrTokenA: string,
        addrTokenB: string,
    ): void {
        linkGenPool.navigate({
            chain: chain,
            tokenA: addrTokenA,
            tokenB: addrTokenB,
        });
    }

    const newUrlTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <Text
                    fontSize='body'
                    color='accent1'
                    align='left'
                    cursor='pointer'
                    onClick={() =>
                        goToNewUrlParams(
                            chainId,
                            tokenA.address,
                            tokenB.address,
                        )
                    }
                >
                    {` Trade ${tokenA.symbol} / ${tokenB.symbol}`}{' '}
                    <FiExternalLink color='var(--accent6)' />
                </Text>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <Text fontSize='body' color='text2' style={{ width: '80px' }}>
                Select Tokens
            </Text>
        </TextOnlyTooltip>
    );

    const simpleTokenSelect = (
        <FlexContainer flexDirection='column' gap={8}>
            {newUrlTooltip}
            <LocalTokenSelect
                tokenAorB={'A'}
                token={tokenA}
                setTokenModalOpen={setTokenModalOpen}
            />
            <LocalTokenSelect
                tokenAorB={'B'}
                token={tokenB}
                setTokenModalOpen={setTokenModalOpen}
            />
        </FlexContainer>
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    const handleRefresh = () => {
        setIsLoading(true);
        (async () => {
            await updateEstimatedInitialPrice();
        })();

        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const openEditMode = () => {
        setIsEditEnabled(true);
        if (initialPriceDisplay === '') {
            setInitialPriceDisplay(estimatedInitialPriceDisplay);
            const targetValue = estimatedInitialPriceDisplay.replaceAll(
                ',',
                '',
            );

            const targetValueNum = parseFloat(targetValue);

            if (targetValue === '') {
                setInitialPriceInBaseDenom(undefined);
            } else {
                if (isDenomBase) {
                    setInitialPriceInBaseDenom(targetValueNum);
                } else {
                    setInitialPriceInBaseDenom(1 / targetValueNum);
                }
            }
        }
        focusInput();
    };

    const initPriceContainer = (
        <FlexContainer
            flexDirection='column'
            gap={10}
            justifyContent='center'
            blur={!!poolExists}
        >
            <FlexContainer flexDirection='row' justifyContent='space-between'>
                <Text fontSize='body' color='text2'>
                    Initial Price
                </Text>

                <FlexContainer gap={8}>
                    <LuEdit2 size={20} onClick={() => openEditMode()} />
                    <FiRefreshCw size={20} onClick={handleRefresh} />
                </FlexContainer>
            </FlexContainer>
            <section
                style={{ width: '100%' }}
                onDoubleClick={() => openEditMode()}
            >
                {isLoading ? (
                    <FlexContainer
                        height='31px'
                        background='dark2'
                        alignItems='center'
                        padding='0 16px'
                    >
                        {' '}
                        <Spinner size={24} bg='var(--dark2)' weight={2} />
                    </FlexContainer>
                ) : (
                    <CurrencyQuantityInput
                        disabled={!isEditEnabled}
                        id='initial-pool-price-quantity'
                        placeholder={placeholderText}
                        type='string'
                        onChange={handleInitialPriceInputChange}
                        onBlur={() => setIsEditEnabled(false)}
                        value={initialPriceDisplay}
                        inputMode='decimal'
                        autoComplete='off'
                        autoCorrect='off'
                        min='0'
                        minLength={1}
                    />
                )}
            </section>
        </FlexContainer>
    );

    const toggleDexSelection = (tokenAorB: 'A' | 'B') => {
        if (tokenAorB === 'A') {
            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked);
            console.log('toggled');
        } else {
            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked);
        }
    };
    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const isRangeBoundsAndCollateralDisabled =
        poolExists === true || !isMintLiqEnabled;

    const collateralContent = (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            gap={10}
            blur={isRangeBoundsAndCollateralDisabled}
        >
            <FlexContainer flexDirection='row' justifyContent='space-between'>
                <Text fontSize='body' color='text2'>
                    Collateral
                </Text>
            </FlexContainer>

            <RangeTokenInput
                hidePlus
                isAmbient={isAmbient}
                depositSkew={depositSkew}
                poolPriceNonDisplay={selectedPoolNonDisplayPrice}
                isWithdrawFromDexChecked={{
                    tokenA: isWithdrawTokenAFromDexChecked,
                    tokenB: isWithdrawTokenBFromDexChecked,
                }}
                isOutOfRange={false}
                tokenAInputQty={{
                    value: baseCollateral,
                    set: setBaseCollateral,
                }}
                tokenBInputQty={{
                    value: quoteCollateral,
                    set: setQuoteCollateral,
                }}
                toggleDexSelection={toggleDexSelection}
                handleButtonMessage={{
                    tokenA: () => {
                        console.log('TODO: handleRangeButtonMessageTokenA');
                    },
                    tokenB: () => {
                        console.log('TODO: handleRangeButtonMessageTokenB');
                    },
                }}
                isInputDisabled={{
                    tokenA: !!poolExists,
                    tokenB: !!poolExists,
                }}
            />
        </FlexContainer>
    );

    const mintInitialLiquidity = (
        <FlexContainer
            flexDirection='row'
            justifyContent='space-between'
            blur={!!poolExists}
        >
            <Text fontSize='body' color='text2'>
                Mint Initial Liquidity
            </Text>
            <Toggle
                id='init_mint_liq'
                isOn={isMintLiqEnabled}
                disabled={poolExists === true}
                handleToggle={() => setIsMintLiqEnabled(!isMintLiqEnabled)}
            />
        </FlexContainer>
    );

    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const erc20TokenWithDexBalance = useMemo(() => {
        if (baseToken?.address !== ZERO_ADDRESS) {
            if (baseTokenDexBalance && baseTokenDexBalance !== '0.0') {
                return baseToken;
            }
        }
        if (quoteTokenDexBalance && quoteTokenDexBalance !== '0.0') {
            return quoteToken;
        }
        return undefined;
    }, [baseToken, quoteToken, baseTokenDexBalance, quoteTokenDexBalance]);

    useEffect(() => {
        if (poolExists) {
            setShowErrorMessage(false);
        } else if (erc20TokenWithDexBalance) {
            setShowErrorMessage(true);
        } else {
            setShowErrorMessage(false);
        }
    }, [erc20TokenWithDexBalance, poolExists]);

    const [activeContent, setActiveContent] = useState<string>('main');

    const handleSetActiveContent = (newActiveContent: string) => {
        setActiveContent(newActiveContent);
    };

    const hideContentOnMobile = !isMintLiqEnabled && showMobileVersion;

    const mainContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            isConfirmation={false}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Initialize Pool'
        >
            {/* Left */}
            <FlexContainer
                padding='0 8px'
                flexDirection='column'
                gap={8}
                justifyContent='space-between'
            >
                {simpleTokenSelect}
                {initPriceContainer}
                {showMobileVersion && mintInitialLiquidity}
                {collateralContent}
            </FlexContainer>

            <FlexContainer padding='0 8px' flexDirection='column' gap={8}>
                {!showMobileVersion && mintInitialLiquidity}
                <FlexContainer blur={isRangeBoundsAndCollateralDisabled}>
                    <AdvancedModeToggle advancedMode={advancedMode} />
                </FlexContainer>

                {!hideContentOnMobile && (
                    <RangeBounds
                        isRangeBoundsDisabled={
                            isRangeBoundsAndCollateralDisabled
                        }
                        {...rangeWidthProps}
                        {...rangePriceInfoProps}
                        {...minMaxPriceProps}
                        customSwitch={true}
                    />
                )}
                {showErrorMessage ? (
                    <div
                        style={{
                            padding: hideContentOnMobile
                                ? '20px 40px'
                                : '0 40px',
                        }}
                    >
                        <WarningBox
                            details={`Due to a known issue, you currently need to completely withdraw your ${erc20TokenWithDexBalance?.symbol} exchange balance before proceeding with pool initialization.`}
                        />
                    </div>
                ) : (
                    <FlexContainer blur={!!poolExists} justifyContent='center'>
                        <InitPoolExtraInfo
                            initialPrice={parseFloat(
                                initialPriceDisplay.replaceAll(',', ''),
                            )}
                            isDenomBase={isDenomBase}
                            initGasPriceinDollars={initGasPriceinDollars}
                            baseToken={baseToken}
                            quoteToken={quoteToken}
                            setIsDenomBase={setIsDenomBase}
                        />
                    </FlexContainer>
                )}

                <ButtonToRender />
            </FlexContainer>
        </InitSkeleton>
    );

    const initConfirmationProps = {
        activeContent,
        setActiveContent,
        sendTx: sendTransaction,
        transactionApproved,
        isTransactionDenied,
        isTransactionException,
        tokenA,
        tokenB,
        isAmbient,
        isTokenABase,
    };

    const confirmationContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Initialize Pool'
        >
            <InitConfirmation {...initConfirmationProps} />
        </InitSkeleton>
    );

    const settingsContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Settings'
        >
            <InitConfirmation {...initConfirmationProps} />
        </InitSkeleton>
    );

    const exampleContent3 = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Example content 3'
        >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim,
            doloremque?
        </InitSkeleton>
    );

    const otherContents = [
        { title: 'Example Content 3', content: exampleContent3 },
    ];
    return (
        <>
            <MultiContentComponent
                mainContent={mainContent}
                settingsContent={settingsContent}
                confirmationContent={confirmationContent}
                activeContent={activeContent}
                setActiveContent={handleSetActiveContent}
                otherContents={otherContents}
            />
        </>
    );
}
