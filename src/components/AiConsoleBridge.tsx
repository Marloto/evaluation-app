"use client"

import { useEffect } from 'react';
import { installAiConsole } from '@/lib/ai/debug';

/**
 * Exposes the AI layer as `window.thesisAi` so it can be exercised from the
 * browser console before the UI exists.
 */
const AiConsoleBridge = () => {
    useEffect(() => {
        installAiConsole();
        console.info('[ai] window.thesisAi ready - start with thesisAi.setKey("sk-ant-...")');
    }, []);

    return null;
};

export default AiConsoleBridge;
