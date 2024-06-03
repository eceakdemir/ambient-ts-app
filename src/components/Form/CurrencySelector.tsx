import { TokenIF } from '../../ambient-utils/types';
import { Dispatch, memo, SetStateAction } from 'react';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import TokenInputQuantity from './TokenInputQuantity';

interface propsIF {
    disable?: boolean;
    selectedToken: TokenIF;
    setQty: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
    setTokenModalOpen: Dispatch<SetStateAction<boolean>>;
    customBorderRadius?: string;
    customBottomContent?: React.ReactNode;
}

export function CurrencySelector(props: propsIF) {
    const {
        disable,
        selectedToken,
        setQty: setDepositQty,
        inputValue,
        setInputValue,
        setTokenModalOpen,
        customBorderRadius,
        customBottomContent,
    } = props;

    const handleOnChange = (input: string) => {
        setInputValue(input);
        setDepositQty(
            input === ''
                ? ''
                : fromDisplayQty(
                      input.replaceAll(',', ''),
                      selectedToken.decimals,
                  ).toString(),
        );
    };
    return (
        <TokenInputQuantity
            label='Select Token'
            tokenAorB={null}
            value={inputValue}
            handleTokenInputEvent={handleOnChange}
            disable={disable}
            token={selectedToken}
            setTokenModalOpen={setTokenModalOpen}
            fieldId='exchangeBalance'
            customBorderRadius={customBorderRadius}
            customBottomContent={customBottomContent}
        />
    );
}

export default memo(CurrencySelector);
