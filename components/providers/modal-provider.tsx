"use client";

import { use, useEffect, useState } from "react";

import { SettingsModal } from "@/components/modals/settings-modal";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <SettingsModal />
        </>
    );
};