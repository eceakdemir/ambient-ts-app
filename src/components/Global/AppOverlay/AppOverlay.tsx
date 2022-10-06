import styles from './AppOverlay.module.css';
import { useState, Dispatch, SetStateAction } from 'react';
import OverlayComponent from '../OverlayComponent/OverlayComponent';
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from 'react-icons/md';
import { VscClose } from 'react-icons/vsc';

// import { useNavigate } from 'react-router-dom';

interface AppOverlayPropsIf {
    isAppOverlayActive: boolean;

    setIsAppOverlayActive: Dispatch<SetStateAction<boolean>>;
}
export default function AppOverlay(props: AppOverlayPropsIf) {
    // const navigate = useNavigate();

    const { isAppOverlayActive, setIsAppOverlayActive } = props;

    // console.log(isAppOverlayActive);
    const [page, setPage] = useState(0);

    // useEffect(() => {
    //     if (page === 4) {
    //         () => navigate('/trade/limit')
    //         console.log(page)
    //     } else if (page === 5) {
    //        () =>  navigate('/trade/range')
    //     } else return
    // }, [page])

    // function handleRedirect() {
    //     if (page === 4) {
    //        navigate('/trade/limit')
    //         console.log(page)
    //     } else if (page === 5) {
    //      navigate('/trade/range')
    //     } else return
    // }

    const page1Overlays = (
        <div>
            <OverlayComponent
                top='70px'
                // left='1200px'
                left='85vw'
            >
                Navbar Overlay
            </OverlayComponent>
        </div>
    );

    const page2Overlays = (
        <>
            <div>
                <OverlayComponent top='100px' left='300px'>
                    Sidebar top
                </OverlayComponent>
            </div>
            <div>
                <OverlayComponent top='500px' left='300px'>
                    Sidebar bottom
                </OverlayComponent>
            </div>
        </>
    );
    const page3Overlays = (
        <>
            <div>
                <OverlayComponent top='50px' left='65vw'>
                    Market Top
                </OverlayComponent>
            </div>
            <div>
                <OverlayComponent top='300px' left='65vw'>
                    Market side bottom
                </OverlayComponent>
            </div>
            <div>
                <OverlayComponent top='64vh' left='80vw'>
                    Market side bottom bottom
                </OverlayComponent>
            </div>
        </>
    );
    const page4Overlays = (
        <>
            <div>
                <OverlayComponent top='50px' left='65vw'>
                    Limit Top
                </OverlayComponent>
            </div>
            <div>
                <OverlayComponent top='300px' left='65vw'>
                    Limit Bottom
                </OverlayComponent>
            </div>
            <div>
                <OverlayComponent top='64vh' left='80vw'>
                    Limit Bottom bottom
                </OverlayComponent>
            </div>
        </>
    );
    const page5Overlays = (
        <>
            <div>
                <OverlayComponent top='50px' left='65vw'>
                    Range Top
                </OverlayComponent>
            </div>
            <div>
                <OverlayComponent top='300px' left='65vw'>
                    Range Bottom
                </OverlayComponent>
            </div>
            <div>
                <OverlayComponent top='64vh' left='80vw'>
                    Range Bottom bottom
                </OverlayComponent>
            </div>
        </>
    );

    const handlePreviousClick = () => {
        setPage((prev) => {
            if (prev === 4) {
                return 0;
            } else {
                return (prev - 1) % 4;
            }
        });
    };

    const handleNextClick = () => {
        setPage((prev) => {
            if (prev === 4) {
                return 0;
            } else {
                return (prev + 1) % 4;
            }
        });
    };

    const handleCloseOverlay = () => {
        setIsAppOverlayActive(false);
        setPage(0);
    };

    const tutorialNavigation = (
        <div className={styles.tutorial_navigation_container}>
            <button onClick={handlePreviousClick}>
                <MdOutlineArrowBackIosNew />
            </button>
            <button onClick={handleCloseOverlay}>
                <VscClose />
            </button>
            <button onClick={handleNextClick}>
                <MdOutlineArrowForwardIos />
            </button>
        </div>
    );
    if (!isAppOverlayActive) return null;
    return (
        <div className={styles.main}>
            {page === 0 && page1Overlays}
            {page === 1 && page2Overlays}
            {page === 2 && page3Overlays}
            {page === 3 && page4Overlays}
            {page === 4 && page5Overlays}
            {tutorialNavigation}
        </div>
    );
}
