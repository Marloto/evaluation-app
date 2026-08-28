export type TemplateVars = Record<string, string | number | undefined | null>;

const BLOCK_PATTERN = /\{\{#(if|unless)\s+([A-Za-z0-9_]+)\}\}([\s\S]*?)\{\{\/\1\}\}/;
const VAR_PATTERN = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
const MAX_BLOCK_PASSES = 50;

const isTruthy = (value: string | number | undefined | null): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'number') return true;
    return value.trim().length > 0;
};

const toText = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    return String(value);
};

/**
 * Minimal template engine for the configurable prompts.
 *
 * Supported syntax:
 *   {{name}}                     - variable substitution
 *   {{#if name}}...{{/if}}       - kept when the variable is a non-empty string
 *   {{#unless name}}...{{/unless}}
 *
 * Blocks must not be nested - the non-greedy match would bind to the wrong
 * closing tag. Unknown variables render as an empty string.
 */
export const renderTemplate = (template: string, vars: TemplateVars): string => {
    let output = template;

    for (let pass = 0; pass < MAX_BLOCK_PASSES; pass += 1) {
        const match = BLOCK_PATTERN.exec(output);
        if (!match) break;
        const [full, kind, name, body] = match;
        const truthy = isTruthy(vars[name]);
        const keep = kind === 'if' ? truthy : !truthy;
        output = output.replace(full, keep ? body : '');
    }

    output = output.replace(VAR_PATTERN, (_full, name: string) => toText(vars[name]));

    // Dropped blocks leave runs of blank lines behind.
    return output.replace(/\n{3,}/g, '\n\n').trim();
};

/** Every `{{name}}` referenced by a template, including inside blocks. */
export const listTemplateVariables = (template: string): string[] => {
    const found = new Set<string>();
    let match: RegExpExecArray | null;

    const varPattern = new RegExp(VAR_PATTERN.source, 'g');
    while ((match = varPattern.exec(template)) !== null) {
        found.add(match[1]);
    }

    const blockPattern = /\{\{#(?:if|unless)\s+([A-Za-z0-9_]+)\}\}/g;
    while ((match = blockPattern.exec(template)) !== null) {
        found.add(match[1]);
    }

    return Array.from(found);
};

/** Variables used by a template that are not part of the allowed set. */
export const findUnknownVariables = (template: string, allowed: readonly string[]): string[] =>
    listTemplateVariables(template).filter(name => !allowed.includes(name));

/** Unbalanced or nested blocks would silently mangle the prompt - report them. */
export const findTemplateSyntaxErrors = (template: string): string[] => {
    const errors: string[] = [];
    const opens = template.match(/\{\{#(if|unless)\s+[A-Za-z0-9_]+\}\}/g) ?? [];
    const closes = template.match(/\{\{\/(if|unless)\}\}/g) ?? [];

    const openIfs = opens.filter(tag => tag.startsWith('{{#if')).length;
    const openUnless = opens.length - openIfs;
    const closeIfs = closes.filter(tag => tag === '{{/if}}').length;
    const closeUnless = closes.length - closeIfs;

    if (openIfs !== closeIfs) {
        errors.push(`${openIfs} "{{#if}}" but ${closeIfs} "{{/if}}"`);
    }
    if (openUnless !== closeUnless) {
        errors.push(`${openUnless} "{{#unless}}" but ${closeUnless} "{{/unless}}"`);
    }

    const stray = template.match(/\{\{[^}]*$/);
    if (stray) {
        errors.push('unclosed "{{"');
    }

    return errors;
};
