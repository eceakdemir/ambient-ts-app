// START: Import React and Dongles
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { CrocImpact, CrocPoolView } from '@crocswap-libs/sdk';

// START: Import JSX Components
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../Global/TransactionException/TransactionException';
import Button from '../../Global/Button/Button';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import ConfirmationModalControl from '../../Global/ConfirmationModalControl/ConfirmationModalControl';

// START: Import Other Local Files
import styles from './ConfirmSwapModal.module.css';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import { AiOutlineWarning } from 'react-icons/ai';
import DividerDark from '../../Global/DividerDark/DividerDark';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';

interface propsIF {
    initiateSwapMethod: () => void;
    poolPriceDisplay: number | undefined;
    isDenomBase: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    priceImpact: CrocImpact | undefined;
    onClose: () => void;
    newSwapTransactionHash: string;
    tokenPair: TokenPairIF;
    txErrorCode: string;
    txErrorMessage: string;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    slippageTolerancePercentage: number;
    effectivePrice: number;
    isSellTokenBase: boolean;
    sellQtyString: string;
    buyQtyString: string;
    lastBlockNumber: number;
    pool: CrocPoolView | undefined;
}

export default function ConfirmSwapModal(props: propsIF) {
    const {
        initiateSwapMethod,
        isDenomBase,
        baseTokenSymbol,
        quoteTokenSymbol,
        newSwapTransactionHash,
        tokenPair,
        txErrorCode,
        resetConfirmation,
        showConfirmation,
        setShowConfirmation,
        slippageTolerancePercentage,
        effectivePrice,
        isSellTokenBase,
        sellQtyString,
        buyQtyString,
        lastBlockNumber,
        pool,
    } = props;
    const {
        bypassConfirmLimit,
        bypassConfirmRange,
        bypassConfirmRepo,
        bypassConfirmSwap,
    } = useContext(UserPreferenceContext);

    const transactionApproved = newSwapTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    const [isDenomBaseLocal, setIsDenomBaseLocal] = useState(isDenomBase);

    const localeSellString =
        parseFloat(sellQtyString) > 999
            ? parseFloat(sellQtyString).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : sellQtyString;
    const localeBuyString =
        parseFloat(buyQtyString) > 999
            ? parseFloat(buyQtyString).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : buyQtyString;

    const [baselineBlockNumber, setBaselineBlockNumber] =
        useState<number>(lastBlockNumber);

    const [baselineBuyTokenPrice, setBaselineBuyTokenPrice] = useState<
        number | undefined
    >();

    const [currentBuyTokenPrice, setCurrentBuyTokenPrice] = useState<
        number | undefined
    >();

    const [isWaitingForPriceChangeAckt, setIsWaitingForPriceChangeAckt] =
        useState<boolean>(false);

    const setBaselinePriceAsync = async () => {
        if (!pool) return;
        const newBaselinePrice = await pool.displayPrice(baselineBlockNumber);
        const baselineBuyTokenPrice = isSellTokenBase
            ? 1 / newBaselinePrice
            : newBaselinePrice;
        setBaselineBuyTokenPrice(baselineBuyTokenPrice);
    };

    const setCurrentPriceAsync = async () => {
        if (!pool) return;
        const currentBasePrice = await pool.displayPrice(lastBlockNumber);
        const currentBuyTokenPrice = isSellTokenBase
            ? 1 / currentBasePrice
            : currentBasePrice;
        setCurrentBuyTokenPrice(currentBuyTokenPrice);
    };

    useEffect(() => {
        if (!isWaitingForPriceChangeAckt) setBaselinePriceAsync();
    }, [isWaitingForPriceChangeAckt]);

    useEffect(() => {
        setCurrentPriceAsync();
    }, [lastBlockNumber]);

    const buyTokenPriceChangePercentage = useMemo(() => {
        if (!currentBuyTokenPrice || !baselineBuyTokenPrice) return;

        const changePercentage =
            ((currentBuyTokenPrice - baselineBuyTokenPrice) /
                baselineBuyTokenPrice) *
            100;

        if (changePercentage >= 0.01) {
            setIsWaitingForPriceChangeAckt(true);
        } else {
            setIsWaitingForPriceChangeAckt(false);
        }

        return changePercentage;
    }, [currentBuyTokenPrice, baselineBuyTokenPrice]);

    const buyTokenPriceChangeString = buyTokenPriceChangePercentage
        ? buyTokenPriceChangePercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : undefined;

    const isPriceInverted =
        (isDenomBaseLocal && !isSellTokenBase) ||
        (!isDenomBaseLocal && isSellTokenBase);

    const effectivePriceWithDenom = effectivePrice
        ? isPriceInverted
            ? 1 / effectivePrice
            : effectivePrice
        : undefined;

    const displayEffectivePriceString =
        !effectivePriceWithDenom ||
        effectivePriceWithDenom === Infinity ||
        effectivePriceWithDenom === 0
            ? '…'
            : effectivePriceWithDenom < 2
            ? effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const buyCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{localeBuyString}</h2>

            <div className={styles.logo_display}>
                {buyTokenData.logoURI ? (
                    <img src={buyTokenData.logoURI} alt={buyTokenData.symbol} />
                ) : (
                    <NoTokenIcon
                        tokenInitial={buyTokenData.symbol.charAt(0)}
                        width='30px'
                    />
                )}

                <h2>{buyTokenData.symbol}</h2>
            </div>
        </div>
    );

    const priceIncreaseComponentOrNull = isWaitingForPriceChangeAckt ? (
        <div className={` ${styles.warning_box}`}>
            <AiOutlineWarning color='var(--negative)' />
            <p>
                WARNING: THE PRICE OF {buyTokenData.symbol} HAS INCREASED BY{' '}
                {buyTokenPriceChangeString + '%'}
            </p>
            <button
                onClick={() => {
                    setBaselineBlockNumber(lastBlockNumber);
                    setIsWaitingForPriceChangeAckt(false);
                }}
            >
                Acknowledge
            </button>
        </div>
    ) : null;

    const sellCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{localeSellString}</h2>
            <div className={styles.logo_display}>
                {sellTokenData.logoURI ? (
                    <img
                        src={sellTokenData.logoURI}
                        alt={sellTokenData.symbol}
                    />
                ) : (
                    <NoTokenIcon
                        tokenInitial={sellTokenData.symbol.charAt(0)}
                        width='30px'
                    />
                )}

                <h2>{sellTokenData.symbol}</h2>
            </div>
        </div>
    );

    // this is the starting state for the bypass confirmation toggle switch
    // if the modal is being shown, we can assume bypass is disabled
    const [tempBypassConfirm, setTempBypassConfirm] = useState<boolean>(false);

    const fullTxDetails2 = (
        <div className={styles.main_container}>
            <section>
                {sellCurrencyRow}
                <div className={styles.arrow_container}>
                    <TokensArrow onlyDisplay />
                </div>
                {buyCurrencyRow}
            </section>
            <div className={styles.extra_info_container}>
                <div className={styles.row}>
                    <p>Expected Output</p>
                    <p>
                        {localeBuyString} {buyTokenData.symbol}
                    </p>
                </div>
                <div className={styles.row}>
                    <p>Effective Conversion Rate</p>
                    <p
                        onClick={() => {
                            setIsDenomBaseLocal(!isDenomBaseLocal);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {isDenomBaseLocal
                            ? `${displayEffectivePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                            : `${displayEffectivePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                    </p>
                </div>
                <div className={styles.row}>
                    <p>Slippage Tolerance</p>
                    <p>{slippageTolerancePercentage}%</p>
                </div>
                {!!priceIncreaseComponentOrNull && <DividerDark />}
                {priceIncreaseComponentOrNull}
            </div>
            {!isWaitingForPriceChangeAckt && (
                <ConfirmationModalControl
                    tempBypassConfirm={tempBypassConfirm}
                    setTempBypassConfirm={setTempBypassConfirm}
                />
            )}
        </div>
    );

    // REGULAR CONFIRMATION MESSAGE STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={`Swapping ${localeSellString} ${sellTokenData.symbol} for ${localeBuyString} ${buyTokenData.symbol}`}
        />
    );

    const transactionDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newSwapTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
            chainId={buyTokenData.chainId}
        />
    );

    // END OF REGULAR CONFIRMATION MESSAGE

    const confirmationDisplay = isTransactionException
        ? transactionException
        : isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
        : confirmSendMessage;

    return (
        <div
            className={styles.modal_container}
            aria-label='Swap Confirmation modal'
        >
            <section
                className={styles.modal_content}
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='additions text'
            >
                {showConfirmation ? fullTxDetails2 : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {showConfirmation && !isWaitingForPriceChangeAckt && (
                    <Button
                        title='Submit Swap'
                        action={() => {
                            // if this modal is launched we can infer user wants confirmation
                            // if user enables bypass, update all settings in parallel
                            // otherwise do not not make any change to persisted preferences
                            if (tempBypassConfirm) {
                                bypassConfirmSwap.enable();
                                bypassConfirmLimit.enable();
                                bypassConfirmRange.enable();
                                bypassConfirmRepo.enable();
                            }
                            initiateSwapMethod();
                            setShowConfirmation(false);
                        }}
                        flat
                        disabled={isWaitingForPriceChangeAckt}
                    />
                )}
            </footer>
        </div>
    );
}
