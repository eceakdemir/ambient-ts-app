import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiSettings5Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';
import styles from './RepositionHeader.module.css';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { SlippagePairIF } from '../../../../utils/interfaces/exports';
import { VscClose } from 'react-icons/vsc';

interface propsIF {
    positionHash: string;
    redirectPath: string;
    repoSlippage: SlippagePairIF;
    isPairStable: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
}

export default function RepositionHeader(props: propsIF) {
    const {
        positionHash,
        redirectPath,
        repoSlippage,
        isPairStable,
        bypassConfirm,
        toggleBypassConfirm,
    } = props;

    const navigate = useNavigate();

    const [isModalOpen, openModal, closeModal] = useModal();

    return (
        <ContentHeader>
            <div onClick={() => openModal()} style={{ cursor: 'pointer', marginLeft: '10px' }}>
                <RiSettings5Line />
            </div>
            <div className={styles.title}>Reposition: {trimString(positionHash, 4, 4, '…')}</div>

            {isModalOpen && (
                <Modal noHeader title='modal' onClose={closeModal}>
                    <TransactionSettings
                        module='Reposition'
                        toggleFor='repo'
                        slippage={repoSlippage}
                        isPairStable={isPairStable}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirm}
                        toggleBypassConfirm={toggleBypassConfirm}
                    />
                </Modal>
            )}
            <div
                onClick={() => navigate(redirectPath, { replace: true })}
                style={{ cursor: 'pointer', marginRight: '10px' }}
            >
                <VscClose size={22} />
            </div>
        </ContentHeader>
    );
}
