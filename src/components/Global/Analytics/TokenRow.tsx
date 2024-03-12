// import styles from './TokenRow.module.css';
import TokenIcon from '../TokenIcon/TokenIcon';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import {
    TableRow,
    TableCell,
    TradeButton,
} from '../../../styled/Components/Analytics';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
import { GCServerPoolIF, PoolIF } from '../../../ambient-utils/types';

interface propsIF {
    token: dexTokenData;
    samplePool: PoolIF | undefined;
    backupPool: GCServerPoolIF | undefined;
    goToMarket: (tknA: string, tknB: string) => void;
    smallScreen: boolean;
}

export default function TokenRow(props: propsIF) {
    const { token, samplePool, goToMarket, smallScreen, backupPool } = props;
    if (!token.tokenMeta || (!samplePool && !backupPool)) return null;

    const mobileScrenView = useMediaQuery('(max-width: 500px)');

    return (
        <TableRow
            onClick={() => {
                console.log(backupPool);
                if (samplePool) {
                    goToMarket(
                        samplePool.base.address,
                        samplePool.quote.address,
                    );
                } else if (backupPool) {
                    goToMarket(backupPool.base, backupPool.quote);
                }
            }}
        >
            <TableCell>
                <FlexContainer
                    alignItems='center'
                    justifyContent='flex-start'
                    gap={8}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <TokenIcon
                            token={token.tokenMeta}
                            src={uriToHttp(token.tokenMeta?.logoURI ?? '')}
                            alt={token.tokenMeta?.symbol ?? ''}
                            size={mobileScrenView ? 's' : '2xl'}
                        />
                        <p>{token.tokenMeta?.symbol}</p>
                    </div>
                </FlexContainer>
            </TableCell>
            {smallScreen || (
                <TableCell left>({token.tokenMeta?.name})</TableCell>
            )}
            <TableCell>
                <p style={{ textTransform: 'none' }}>
                    {getFormattedNumber({
                        value:
                            token.dexTvl /
                            Math.pow(10, token.tokenMeta.decimals),
                        prefix: '$',
                        isTvl: true,
                    })}
                </p>
            </TableCell>
            <TableCell>
                <p>
                    {getFormattedNumber({
                        value:
                            token.dexFees /
                            Math.pow(10, token.tokenMeta.decimals),
                        prefix: '$',
                    })}
                </p>
            </TableCell>
            <TableCell>
                <p>
                    {getFormattedNumber({
                        value:
                            token.dexVolume /
                            Math.pow(10, token.tokenMeta.decimals),
                        prefix: '$',
                    })}
                </p>
            </TableCell>
            <TableCell>
                <FlexContainer
                    fullHeight
                    alignItems='center'
                    justifyContent='flex-end'
                >
                    <TradeButton>Trade</TradeButton>
                </FlexContainer>
            </TableCell>
        </TableRow>
    );
}
