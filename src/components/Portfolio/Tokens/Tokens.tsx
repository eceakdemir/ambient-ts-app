import { useEffect, useState } from 'react';
import styles from './Tokens.module.css';
import TokensHeader from './TokensHeader/TokensHeader';
import TokenCard from '../Tokens/TokenCard/TokenCard';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';
import Pagination from '../../Global/Pagination/Pagination';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

interface propsIF {
    chainId: string;
}

export default function Tokens(props: propsIF) {
    const { chainId } = props;

    const [tokenLists, setTokenLists] = useState<TokenListIF[]>();
    const [importedTokens, setImportedTokens] = useState<TokenIF[] | null>(null);
    importedTokens ?? setImportedTokens(JSON.parse(localStorage.getItem('user') as string).tokens);

    const [tokenSource, setTokenSource] = useState('imported');
    const [tokensInDOM, setTokensInDOM] = useState<TokenIF[]>([]);

    useEffect(() => {
        if (tokenSource === 'imported') {
            const tokens = JSON.parse(localStorage.getItem('user') as string).tokens;
            setTokensInDOM(tokens);
        } else {
            setTokensInDOM(
                tokenLists?.find((list) => list.name === tokenSource)?.tokens as TokenIF[],
            );
        }
    }, [tokenSource]);

    useEffect(() => {
        setTokenLists(JSON.parse(localStorage.getItem('allTokenLists') as string));
    }, []);

    // pagination

    const largeScreen = useMediaQuery('(min-width: 1680px)');

    const [currentPage, setCurrentPage] = useState(1);
    const [tokensPerPage] = useState(largeScreen ? 10 : 8);

    useEffect(() => {
        setCurrentPage(1);
    }, []);

    // Get current transactions
    const indexOfLastTokens = currentPage * tokensPerPage;
    const indexOfFirstTokens = indexOfLastTokens - tokensPerPage;
    const currentTokens = tokensInDOM?.slice(indexOfFirstTokens, indexOfLastTokens);

    // Change page
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // end of pagination

    return (
        <div className={styles.container}>
            <div className={styles.listPicker}>
                <select name='lists' onChange={(e) => setTokenSource(e.target.value)}>
                    <option value='imported'>My Tokens</option>
                    {tokenLists?.map((list) => (
                        <option key={JSON.stringify(list)} value={list.name}>
                            {list.name}
                        </option>
                    ))}
                </select>
            </div>
            <TokensHeader />
            <ol
                className={styles.item_container}
                style={{ minHeight: largeScreen ? '500px' : '400px' }}
            >
                {currentTokens?.map((tkn, idx) => (
                    <TokenCard key={JSON.stringify(tkn) + idx} token={tkn} chainId={chainId} />
                ))}
            </ol>

            <Pagination
                itemsPerPage={tokensPerPage}
                totalItems={tokensInDOM.length}
                paginate={paginate}
                currentPage={currentPage}
            />
        </div>
    );
}
