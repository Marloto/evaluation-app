import type AnthropicClient from '@anthropic-ai/sdk';
import { getAiSettings } from '../settings';
import { LlmError, LlmModelInfo, LlmProvider, LlmRequest, LlmResult } from '../types';

export const ANTHROPIC_MODELS: LlmModelInfo[] = [
    { id: 'claude-opus-5', label: 'Claude Opus 5' },
    { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
];

type Sdk = typeof import('@anthropic-ai/sdk');
type ZodHelpers = typeof import('@anthropic-ai/sdk/helpers/zod');

let sdkPromise: Promise<{ sdk: Sdk; zodHelpers: ZodHelpers }> | null = null;

/** The SDK is only pulled in once an actual request happens. */
const loadSdk = () => {
    if (!sdkPromise) {
        sdkPromise = Promise.all([
            import('@anthropic-ai/sdk'),
            import('@anthropic-ai/sdk/helpers/zod'),
        ])
            .then(([sdk, zodHelpers]) => ({ sdk, zodHelpers }))
            .catch(error => {
                // A rejected promise must not be cached - otherwise every later
                // retry replays the same failure even once the cause is gone.
                sdkPromise = null;
                const isChunkError =
                    (error as { name?: string })?.name === 'ChunkLoadError' ||
                    /Loading chunk .* failed/i.test(String((error as Error)?.message ?? ''));
                throw new LlmError(
                    'network',
                    isChunkError
                        ? 'Could not load the Anthropic SDK bundle. If this is the dev server, restart it (the webpack config for the SDK changed).'
                        : 'Could not load the Anthropic SDK.',
                    { cause: error }
                );
            });
    }
    return sdkPromise;
};

let cachedClient: { apiKey: string; client: AnthropicClient } | null = null;

const getClient = async (apiKey: string): Promise<{ client: AnthropicClient; sdk: Sdk; zodHelpers: ZodHelpers }> => {
    const { sdk, zodHelpers } = await loadSdk();
    if (!cachedClient || cachedClient.apiKey !== apiKey) {
        cachedClient = {
            apiKey,
            // The app has no backend - the key stays in the browser and the
            // request goes straight to the Anthropic API.
            client: new sdk.default({ apiKey, dangerouslyAllowBrowser: true }),
        };
    }
    return { client: cachedClient.client, sdk, zodHelpers };
};

const toLlmError = (error: unknown, sdk: Sdk): LlmError => {
    if (error instanceof LlmError) return error;

    const Anthropic = sdk.default;
    if (error instanceof Anthropic.APIUserAbortError) {
        return new LlmError('aborted', 'Request was cancelled.', { cause: error });
    }
    if (error instanceof Anthropic.AuthenticationError) {
        return new LlmError('auth', 'API key was rejected.', { status: error.status, cause: error });
    }
    if (error instanceof Anthropic.RateLimitError) {
        return new LlmError('rate-limit', 'Rate limit reached - try again shortly.', { status: error.status, cause: error });
    }
    if (error instanceof Anthropic.APIConnectionError) {
        return new LlmError('network', 'Could not reach the Anthropic API.', { cause: error });
    }
    if (error instanceof Anthropic.APIError) {
        return new LlmError('unknown', error.message, { status: error.status, cause: error });
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
        return new LlmError('aborted', 'Request was cancelled.', { cause: error });
    }
    return new LlmError('unknown', error instanceof Error ? error.message : String(error), { cause: error });
};

export const anthropicProvider: LlmProvider = {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    models: ANTHROPIC_MODELS,

    isConfigured() {
        const { apiKey } = getAiSettings();
        return Boolean(apiKey && apiKey.trim().length > 0);
    },

    async generate<T = unknown>(request: LlmRequest<T>): Promise<LlmResult<T>> {
        const settings = getAiSettings();
        const apiKey = settings.apiKey?.trim();
        if (!apiKey) {
            throw new LlmError('no-api-key', 'No Anthropic API key configured.');
        }

        const { client, sdk, zodHelpers } = await getClient(apiKey);
        const model = settings.model || ANTHROPIC_MODELS[0].id;

        const params = {
            model,
            max_tokens: request.maxTokens ?? 8000,
            system: request.system,
            messages: request.messages.map(message => ({
                role: message.role,
                content: message.content,
            })),
            thinking: { type: 'adaptive' as const },
            output_config: {
                effort: request.effort ?? settings.effort,
                ...(request.schema ? { format: zodHelpers.zodOutputFormat(request.schema) } : {}),
            },
        };

        try {
            const response = await client.messages.parse(params, { signal: request.signal });

            const text = response.content
                .filter(block => block.type === 'text')
                .map(block => block.text)
                .join('\n')
                .trim();

            if (request.schema && response.parsed_output == null) {
                throw new LlmError('invalid-response', 'Model did not return a valid structured response.');
            }

            return {
                text,
                data: request.schema ? (response.parsed_output as T) : undefined,
                model: response.model,
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens,
                    cacheReadTokens: response.usage.cache_read_input_tokens ?? undefined,
                },
            };
        } catch (error) {
            throw toLlmError(error, sdk);
        }
    },
};
