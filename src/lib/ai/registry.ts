import { anthropicProvider } from './providers/anthropic';
import { getAiSettings } from './settings';
import { LlmError, LlmProvider } from './types';

const providers: Record<string, LlmProvider> = {
    [anthropicProvider.id]: anthropicProvider,
};

export const listProviders = (): LlmProvider[] => Object.values(providers);

export const registerProvider = (provider: LlmProvider): void => {
    providers[provider.id] = provider;
};

export const getProvider = (id?: string): LlmProvider => {
    const providerId = id ?? getAiSettings().providerId;
    const provider = providers[providerId];
    if (!provider) {
        throw new LlmError('unknown', `Unknown LLM provider "${providerId}".`);
    }
    return provider;
};

/** True when the active provider can actually be called right now. */
export const isAiAvailable = (): boolean => {
    try {
        return getProvider().isConfigured();
    } catch {
        return false;
    }
};
