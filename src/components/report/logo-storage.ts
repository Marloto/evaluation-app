/**
 * The logo printed in the page header.
 *
 * No logo ships with the app - the institution's mark is not part of this
 * repository - so evaluators upload their own once; it is kept in localStorage
 * per browser, like the grade configuration, and the report simply omits the
 * header image while none is set.
 */

const LOCAL_STORAGE_KEY = 'thesis-report-logo';

/** Rejected above this, to stay well inside the localStorage quota. */
export const LOGO_MAX_BYTES = 512 * 1024;

/**
 * Intrinsic width the stored logo is normalised to, in CSS pixels (~52mm).
 *
 * An @page margin box paints `content: url(...)` at the image's intrinsic size
 * and ignores width/height, so the size has to be baked into the image itself.
 */
const PRINT_WIDTH = 196;

/** Used when an SVG carries neither dimensions nor a viewBox. */
const FALLBACK_RATIO = 29 / 196;

export const loadReportLogo = (): string | null => {
    try {
        return localStorage.getItem(LOCAL_STORAGE_KEY);
    } catch (error) {
        console.error('Error loading report logo:', error);
        return null;
    }
};

export const saveReportLogo = (dataUri: string) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, dataUri);
    } catch (error) {
        console.error('Error saving report logo:', error);
        throw new Error('Logo could not be stored');
    }
};

export const clearReportLogo = () => {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
        console.error('Error removing report logo:', error);
    }
};

const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('File could not be read'));
        reader.readAsDataURL(file);
    });

const measure = (dataUri: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('File is not a readable image'));
        image.src = dataUri;
    });

const toDataUri = (svg: string) =>
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/**
 * Scales an uploaded SVG by rewriting the root element, which keeps it vector.
 *
 * The markup is only ever handed back as a data URI for `content: url()` and
 * <img src>, never injected into the page, so scripts inside it cannot run.
 */
const normaliseSvg = (source: string): string => {
    const root = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
    if (root.nodeName !== 'svg') {
        throw new Error('File is not a readable SVG');
    }

    const viewBox = root.getAttribute('viewBox');
    const width = Number.parseFloat(root.getAttribute('width') ?? '') || Number.parseFloat(viewBox?.split(/[\s,]+/)[2] ?? '');
    const height = Number.parseFloat(root.getAttribute('height') ?? '') || Number.parseFloat(viewBox?.split(/[\s,]+/)[3] ?? '');

    // Without a viewBox the rewritten size would crop rather than scale.
    if (!viewBox && width && height) {
        root.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    const ratio = width && height ? height / width : FALLBACK_RATIO;
    root.setAttribute('width', String(PRINT_WIDTH));
    root.setAttribute('height', String(Math.round(PRINT_WIDTH * ratio)));

    return new XMLSerializer().serializeToString(root);
};

/** Wraps a bitmap in an SVG of the target size; the bitmap keeps its resolution. */
const wrapBitmap = (dataUri: string, ratio: number): string => {
    const height = Math.round(PRINT_WIDTH * ratio);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${PRINT_WIDTH}" height="${height}" viewBox="0 0 ${PRINT_WIDTH} ${height}">`
        + `<image href="${dataUri}" width="${PRINT_WIDTH}" height="${height}"/></svg>`;
};

/**
 * Turns an uploaded file into a print-ready logo: an SVG data URI whose
 * intrinsic width is what the page header should show.
 */
export const readLogoFile = async (file: File): Promise<string> => {
    if (file.size > LOGO_MAX_BYTES) {
        throw new Error(`Logo is larger than ${Math.round(LOGO_MAX_BYTES / 1024)} KB`);
    }

    if (file.type === 'image/svg+xml') {
        return toDataUri(normaliseSvg(await file.text()));
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are supported');
    }

    const dataUri = await readAsDataUrl(file);
    const { width, height } = await measure(dataUri);
    return toDataUri(wrapBitmap(dataUri, width && height ? height / width : FALLBACK_RATIO));
};
