import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import {
    LimitOrderIF,
    PositionIF,
    TempPoolIF,
    TokenIF,
    TransactionIF,
} from '../../../utils/interfaces/exports';
import { tokenMethodsIF } from '../../hooks/useTokens';

export interface sidebarSearchIF {
    setInput: Dispatch<SetStateAction<string>>;
    isInputValid: boolean;
    pools: TempPoolIF[];
    positions: PositionIF[];
    txs: TransactionIF[];
    limits: LimitOrderIF[];
}

export const useSidebarSearch = (
    poolList: TempPoolIF[],
    positionList: PositionIF[],
    txList: TransactionIF[],
    limitOrderList: LimitOrderIF[],
    tokens: tokenMethodsIF,
    chainId: string,
): sidebarSearchIF => {
    const poolsOnChain = useMemo<TempPoolIF[]>(
        () =>
            poolList
                .map((pool: TempPoolIF) => {
                    const baseToken: TokenIF | undefined =
                        tokens.getTokenByAddress(pool.base);
                    const quoteToken: TokenIF | undefined =
                        tokens.getTokenByAddress(pool.quote);
                    if (baseToken && quoteToken) {
                        return {
                            base: baseToken.address,
                            baseDecimals: baseToken.decimals,
                            baseSymbol: baseToken.symbol,
                            chainId: pool.chainId,
                            poolIdx: pool.poolIdx,
                            quote: quoteToken.address,
                            quoteDecimals: quoteToken.decimals,
                            quoteSymbol: quoteToken.symbol,
                        };
                    } else {
                        return null;
                    }
                })
                .filter(
                    (pool: TempPoolIF | null) => pool !== null,
                ) as TempPoolIF[],
        [chainId, poolList.length],
    );

    // raw user input from the DOM
    const [rawInput, setRawInput] = useState<string>('');

    const [dbInput, setDbInput] = useState<string>('');

    useEffect(() => {
        const timer = setTimeout(() => setDbInput(rawInput), 400);
        return () => clearTimeout(timer);
    }, [rawInput]);

    // search type ➜ '' or 'address' or 'nameOrAddress'
    const [searchAs, setSearchAs] = useState<string | null>(null);

    // cleaned and validated version of raw user input
    const validatedInput = useMemo<string>(() => {
        // trim string and make it lower case
        const cleanInput: string = dbInput.trim().toLowerCase();
        // action if input appears to be a contract address
        if (
            cleanInput.length === 42 ||
            (cleanInput.length === 40 && !cleanInput.startsWith('0x'))
        ) {
            setSearchAs('address');
            // if not an apparent token address, search name and symbol
        } else if (cleanInput.length >= 2) {
            setSearchAs('nameOrSymbol');
            return cleanInput;
            // otherwise treat as if there is no input entered
        } else {
            setSearchAs(null);
            return '';
        }
        // add '0x' to the front of the cleaned string if not present
        const fixedInput = cleanInput.startsWith('0x')
            ? cleanInput
            : '0x' + cleanInput;
        // declare an output variable
        let output = cleanInput;
        // check if string is a correctly-formed contract address
        if (
            // check if string has 42 characters
            fixedInput.length === 42 &&
            // check if string after '0x' is valid hexadecimal
            fixedInput.substring(2).match(/[0-9a-f]/g)
        ) {
            // if fixed string is valid, assign it to the output variable
            output = fixedInput;
        }
        // return output variable
        return output;
    }, [dbInput]);

    // array of pools to output from the hook
    const [outputPools, setOutputPools] = useState<TempPoolIF[]>([]);

    // logic to update the output pools from the hook
    useEffect(() => {
        // fn to filter pools by address (must be exact)
        const searchByAddress = (addr: string): TempPoolIF[] =>
            poolsOnChain.filter(
                (pool: TempPoolIF) =>
                    pool.base.toLowerCase() === addr.toLowerCase() ||
                    pool.quote.toLowerCase() === addr.toLowerCase(),
            );
        // fn to filter pools by symbol (must be exact IF input is two characters)
        const searchBySymbol = (symb: string): TempPoolIF[] =>
            poolsOnChain
                .filter((pool: TempPoolIF) =>
                    symb.length === 2
                        ? pool.baseSymbol.toLowerCase() ===
                              symb.toLowerCase() ||
                          pool.quoteSymbol.toLowerCase() === symb.toLowerCase()
                        : pool.baseSymbol
                              .toLowerCase()
                              .includes(symb.toLowerCase()) ||
                          pool.quoteSymbol
                              .toLowerCase()
                              .includes(symb.toLowerCase()),
                )
                .filter(
                    (pool: TempPoolIF) =>
                        tokens.verifyToken(pool.base) &&
                        tokens.verifyToken(pool.quote),
                );
        // fn to return list of verified pools with no search filtering
        const noSearch = (): TempPoolIF[] =>
            poolsOnChain.filter(
                (pool: TempPoolIF) =>
                    tokens.verifyToken(pool.base) &&
                    tokens.verifyToken(pool.quote),
            );
        // variable to hold the list of pools generated by the search
        let filteredPools: TempPoolIF[];
        // logic router to apply the relevant search function
        switch (searchAs) {
            case 'address':
                filteredPools = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredPools = searchBySymbol(validatedInput);
                break;
            case '':
            default:
                filteredPools = noSearch();
        }
        setOutputPools(filteredPools);
    }, [validatedInput]);

    // array of range positions to output from the hook
    const [outputPositions, setOutputPositions] = useState<PositionIF[]>([]);

    // logic to update the output range positions from the hook
    // this does NOT apply token verification because data is specific to user
    // presumably user wants to see their position data regardless of token validity
    useEffect(() => {
        // fn to filter range positions by address (must be exact, will fix for casing mismatch)
        const searchByAddress = (addr: string): PositionIF[] =>
            positionList
                .filter(
                    (position: PositionIF) =>
                        position.base.toLowerCase() === addr.toLowerCase() ||
                        position.quote.toLowerCase() === addr.toLowerCase(),
                )
                // remove empty positions from search results
                .filter((pos: PositionIF) => pos.totalValueUSD);
        // fn to filter range positions by symbol (must be exact IF input is two characters)
        const searchBySymbol = (symb: string): PositionIF[] =>
            positionList
                .filter((position: PositionIF) =>
                    symb.length === 2
                        ? position.baseSymbol.toLowerCase() ===
                              symb.toLowerCase() ||
                          position.quoteSymbol.toLowerCase() ===
                              symb.toLowerCase()
                        : position.baseSymbol
                              .toLowerCase()
                              .includes(symb.toLowerCase()) ||
                          position.quoteSymbol
                              .toLowerCase()
                              .includes(symb.toLowerCase()),
                )
                // remove empty positions from search results
                .filter((pos: PositionIF) => pos.totalValueUSD);
        // fn to return list of range positions with no search filtering
        const noSearch = (): PositionIF[] => positionList;
        // output variable to hold the array of range positions generated by the search filter
        let filteredRangePositions: PositionIF[];
        // logic router to apply the relevant search function to filter range positions
        switch (searchAs) {
            case 'address':
                filteredRangePositions = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredRangePositions = searchBySymbol(validatedInput);
                break;
            case '':
            default:
                filteredRangePositions = noSearch();
        }
        // send positions filtered by search input to local state (to be returned from this file)
        setOutputPositions(filteredRangePositions);
    }, [positionList.length, validatedInput]);

    // array of range positions to output from the hook
    const [outputTxs, setOutputTxs] = useState<TransactionIF[]>([]);

    // logic to update the output txs from the hook
    // this does NOT apply token verification because data is specific to user
    // presumably user wants to see their txs regardless of token validity
    useEffect(() => {
        // fn to filter txs by address (must be exact, will fix for casing mismatch)
        const searchByAddress = (addr: string): TransactionIF[] =>
            txList.filter(
                (tx: TransactionIF) =>
                    tx.base.toLowerCase() === addr.toLowerCase() ||
                    tx.quote.toLowerCase() === addr.toLowerCase(),
            );
        // fn to filter txs by symbol (must be exact IF input is two characters)
        const searchBySymbol = (symb: string): TransactionIF[] =>
            txList.filter((tx: TransactionIF) =>
                symb.length === 2
                    ? tx.baseSymbol.toLowerCase() === symb.toLowerCase() ||
                      tx.quoteSymbol.toLowerCase() === symb.toLowerCase()
                    : tx.baseSymbol
                          .toLowerCase()
                          .includes(symb.toLowerCase()) ||
                      tx.quoteSymbol.toLowerCase().includes(symb.toLowerCase()),
            );
        // fn to return array of txs with no search filtering
        const noSearch = (): TransactionIF[] => txList;
        // output variable to hold the array of txs generated by the search filter
        let filteredTxs: TransactionIF[];
        // logic router to apply the relevant search function to filter txs
        switch (searchAs) {
            case 'address':
                filteredTxs = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredTxs = searchBySymbol(validatedInput);
                break;
            case '':
            default:
                filteredTxs = noSearch();
        }
        // send txs filtered by search input to local state (to be returned from this file)
        setOutputTxs(filteredTxs);
    }, [txList.length, validatedInput]);

    // array of range positions to output from the hook
    const [outputLimits, setOutputLimits] = useState<LimitOrderIF[]>([]);

    // logic to update the output txs from the hook
    // this does NOT apply token verification because data is specific to user
    // presumably user wants to see their txs regardless of token validity
    useEffect(() => {
        // fn to filter txs by address (must be exact, will fix for casing mismatch)
        const searchByAddress = (addr: string): LimitOrderIF[] =>
            limitOrderList.filter(
                (limitOrder: LimitOrderIF) =>
                    limitOrder.base.toLowerCase() === addr.toLowerCase() ||
                    limitOrder.quote.toLowerCase() === addr.toLowerCase(),
            );
        // fn to filter txs by symbol (must be exact IF input is two characters)
        const searchBySymbol = (symb: string): LimitOrderIF[] =>
            limitOrderList.filter((limitOrder: LimitOrderIF) =>
                symb.length === 2
                    ? limitOrder.baseSymbol.toLowerCase() ===
                          symb.toLowerCase() ||
                      limitOrder.quoteSymbol.toLowerCase() ===
                          symb.toLowerCase()
                    : limitOrder.baseSymbol
                          .toLowerCase()
                          .includes(symb.toLowerCase()) ||
                      limitOrder.quoteSymbol
                          .toLowerCase()
                          .includes(symb.toLowerCase()),
            );
        // fn to return array of txs with no search filtering
        const noSearch = (): LimitOrderIF[] => limitOrderList;
        // output variable to hold the array of txs generated by the search filter
        let filteredLimits: LimitOrderIF[];
        // logic router to apply the relevant search function to filter txs
        switch (searchAs) {
            case 'address':
                filteredLimits = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredLimits = searchBySymbol(validatedInput);
                break;
            case '':
            default:
                filteredLimits = noSearch();
        }
        // send txs filtered by search input to local state (to be returned from this file)
        setOutputLimits(filteredLimits);
    }, [limitOrderList.length, validatedInput]);

    return {
        setInput: setRawInput,
        isInputValid: !!searchAs,
        pools: outputPools,
        positions: outputPositions,
        txs: outputTxs,
        limits: outputLimits,
    };
};
