import type { ZodType } from 'zod';

export type LlmRole = 'user' | 'assistant';

export interface LlmMessage {
    role: LlmRole;
    content: string;
}

export type LlmEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface LlmRequest<T = unknown> {
    system?: string;
    messages: LlmMessage[];
    /** Zod schema for structured output. If set, `data` on the result is populated. */
    schema?: ZodType<T>;
    maxTokens?: number;
    effort?: LlmEffort;
    signal?: AbortSignal;
}

export interface LlmUsage {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens?: number;
}

export interface LlmResult<T = unknown> {
    /** Raw text content of the response (may be empty when a schema was used). */
    text: string;
    /** Parsed structured output. Only set when `schema` was provided. */
    data?: T;
    model: string;
    usage?: LlmUsage;
}

export interface LlmModelInfo {
    id: string;
    label: string;
}

export interface LlmProvider {
    readonly id: string;
    readonly label: string;
    /** Models offered by this provider, first entry is the default. */
    readonly models: LlmModelInfo[];
    /** True when everything required to call the provider is present (api key etc.). */
    isConfigured(): boolean;
    generate<T = unknown>(request: LlmRequest<T>): Promise<LlmResult<T>>;
}

export type LlmErrorCode =
    | 'no-api-key'
    | 'auth'
    | 'rate-limit'
    | 'network'
    | 'aborted'
    | 'invalid-response'
    | 'unknown';

export class LlmError extends Error {
    readonly code: LlmErrorCode;
    readonly status?: number;
    readonly cause?: unknown;

    constructor(code: LlmErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
        super(message);
        this.name = 'LlmError';
        this.code = code;
        this.status = options?.status;
        this.cause = options?.cause;
    }

    /** True when retrying the very same request may succeed. */
    get isRetryable(): boolean {
        return this.code === 'rate-limit' || this.code === 'network';
    }
}
