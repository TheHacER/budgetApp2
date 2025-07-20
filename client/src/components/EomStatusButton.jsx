import React, { useState, useEffect } from 'react';
import * as api from 'services/api';
import { Button } from '@mui/material';
import EomModal from './EomModal';

function EomStatusButton() {
    const [status, setStatus] = useState({ isNeeded: false, isOverdue: false });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        api.getEomStatus().then(setStatus);
    }, []);

    const getButtonColor = () => {
        if (!status.isNeeded) return 'inherit';
        if (status.isOverdue) return 'error';
        return 'success';
    };

    const handleProcessComplete = () => {
        setIsModalOpen(false);
        api.getEomStatus().then(setStatus);
    }

    return (
        <>
            <Button 
                variant="contained" 
                color={getButtonColor()}
                onClick={() => setIsModalOpen(true)}
                disabled={!status.isNeeded}
            >
                {status.isOverdue ? 'EOM Overdue' : 'Run End of Month'}
            </Button>
            {isModalOpen && (
                 <EomModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onProcessComplete={handleProcessComplete}
                    eomDateInfo={status.eomDateInfo}
                />
            )}
        </>
    );
}

export default EomStatusButton;