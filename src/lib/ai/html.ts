/**
 * Converts the TipTap HTML used for notes into plain text.
 *
 * Images are dropped entirely - notes may contain base64 data URLs which would
 * otherwise blow up the prompt size.
 */
export const htmlToPlainText = (html: string | undefined | null): string => {
    if (!html) return '';

    const withoutImages = html
        .replace(/<img[^>]*>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ');

    const withBreaks = withoutImages
        .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li[^>]*>/gi, '- ');

    const text = withBreaks.replace(/<[^>]+>/g, '');

    const decoded = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&auml;/g, 'ä')
        .replace(/&ouml;/g, 'ö')
        .replace(/&uuml;/g, 'ü')
        .replace(/&Auml;/g, 'Ä')
        .replace(/&Ouml;/g, 'Ö')
        .replace(/&Uuml;/g, 'Ü')
        .replace(/&szlig;/g, 'ß');

    return decoded
        .split('\n')
        .map(line => line.replace(/[ \t]+/g, ' ').trim())
        .filter(line => line.length > 0)
        .join('\n');
};
