export class LocalizationService {
    constructor() {
        this.baseLanguage = 'en';
        this.currentLanguage = 'en';
        this.cacheKey = 'colai-i18n-cache';
        this.cache = this.loadCache();
        this.pending = {};
        this.textNodeMemory = new WeakMap();
        this.trackedNodes = new Set();
        this.protectedTerms = this.getProtectedTerms();
        this.googleSupportedLanguages = new Set([
            'af','am','ar','az','bg','bn','bs','ca','cs','cy','da','de','el','en','eo','es','et',
            'fa','fi','fr','ga','gu','he','hi','hr','ht','hu','hy','id','is','it','ja','ka','kk',
            'km','kn','ko','ku','ky','lo','lt','lv','mg','mk','ml','mn','mr','ms','nb','nl','pa',
            'pl','ps','pt','ro','ru','sk','sl','sq','sr','sv','sw','ta','te','th','tl','tr','uk',
            'ur','vi','zh'
        ]);
        this.languageOverrides = {
            zh: 'zh-CN',
            he: 'iw',
            jv: 'jw',
            fil: 'tl'
        };
        this.disabledProviders = new Set();
    }

    loadCache() {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            if (!raw) return {};
            return JSON.parse(raw);
        } catch (error) {
            console.warn('Localization cache load failed:', error);
            return {};
        }
    }

    saveCache() {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
        } catch (error) {
            console.warn('Localization cache save failed:', error);
        }
    }

    getProtectedTerms() {
        const networkNames = [
            'Analytical Network (Network 1)',
            'Creative Network (Network 2)',
            'Implementation Network (Network 3)',
            'Data Science Network (Network 4)',
            'Ethical Network (Network 5)',
            'User Experience Network (Network 6)',
            'Systems Thinking Network (Network 7)',
            "Devil's Advocate Network (Network 8)",
            'Summarizer Network'
        ];

        const shortNames = [
            'Analytical Network',
            'Creative Network',
            'Implementation Network',
            'Data Science Network',
            'Ethical Network',
            'User Experience Network',
            'Systems Thinking Network',
            "Devil's Advocate Network",
            'Synthesizer Network',
            'Ollama',
            'Top P',
            'Top K',
            'Logit Bias',
            'Presence Penalty',
            'Frequency Penalty',
            'Max Tokens',
            'Temperature'
        ];

        const numberedNetworks = Array.from({ length: 8 }, (_, i) => `Network ${i + 1}`);
        return [...networkNames, ...shortNames, ...numberedNetworks];
    }

    setCurrentLanguage(languageCode) {
        this.currentLanguage = languageCode || this.baseLanguage;
        document.documentElement.setAttribute('lang', this.currentLanguage);
    }

    async applyTranslations(languageCode) {
        this.setCurrentLanguage(languageCode);
        const elements = document.querySelectorAll('[data-i18n-text]');

        if (languageCode === this.baseLanguage) {
            elements.forEach(element => this.setElementValue(
                element,
                element.dataset.i18nTarget || 'text',
                element.dataset.i18nText || ''
            ));
            return;
        }

        for (const element of elements) {
            await this.translateElement(element, languageCode);
        }
    }

    registerElement(element, baseText, options = {}) {
        if (!element || !baseText) return;
        element.dataset.i18nText = baseText;
        element.dataset.i18nTarget = options.target || 'text';
        if (options.lock) {
            element.dataset.i18nLock = 'true';
        }
        this.setElementValue(element, element.dataset.i18nTarget, baseText);
        if (this.currentLanguage !== this.baseLanguage) {
            this.translateElement(element, this.currentLanguage);
        }
    }

    async translateElement(element, languageCode) {
        if (!element || element.dataset.i18nLock === 'true') return;
        const baseText = element.dataset.i18nText || '';
        const target = element.dataset.i18nTarget || 'text';
        if (!baseText.trim()) return;
        const translation = await this.translateText(baseText, languageCode);
        this.setElementValue(element, target, translation);
    }

    setElementValue(element, target, value) {
        switch (target) {
            case 'placeholder':
                element.setAttribute('placeholder', value);
                break;
            case 'aria-label':
                element.setAttribute('aria-label', value);
                break;
            case 'html':
                element.innerHTML = value;
                break;
            case 'value':
                element.value = value;
                break;
            default:
                element.textContent = value;
        }
    }

    async translateText(text, languageCode) {
        const normalizedText = text.trim();
        if (!normalizedText) return text;
        if (languageCode === this.baseLanguage) return normalizedText;
        if (!/[a-zA-Z]/.test(normalizedText)) return normalizedText;

        if (!this.cache[languageCode]) {
            this.cache[languageCode] = {};
        }

        if (this.cache[languageCode][normalizedText]) {
            return this.cache[languageCode][normalizedText];
        }

        if (!this.pending[languageCode]) {
            this.pending[languageCode] = {};
        }

        if (this.pending[languageCode][normalizedText]) {
            return this.pending[languageCode][normalizedText];
        }

        const { sanitized, placeholders } = this.applyProtectedTerms(normalizedText);

        const promise = this.fetchTranslation(sanitized, languageCode)
            .then(result => {
                const restored = result ? this.restoreProtectedTerms(result, placeholders) : normalizedText;
                this.cache[languageCode][normalizedText] = restored;
                this.saveCache();
                return restored;
            })
            .catch(() => normalizedText)
            .finally(() => {
                delete this.pending[languageCode][normalizedText];
            });

        this.pending[languageCode][normalizedText] = promise;
        return promise;
    }

    async getLocalizedString(text, languageCode) {
        return this.translateText(text, languageCode || this.currentLanguage);
    }

    applyProtectedTerms(text) {
        let sanitized = text;
        const placeholders = [];

        this.protectedTerms.forEach((term, index) => {
            if (!term || !sanitized.includes(term)) return;
            const placeholder = `__TERM_${index}_${placeholders.length}__`;
            sanitized = sanitized.split(term).join(placeholder);
            placeholders.push({ placeholder, term });
        });

        return { sanitized, placeholders };
    }

    restoreProtectedTerms(text, placeholders) {
        let restored = text;
        placeholders.forEach(({ placeholder, term }) => {
            restored = restored.split(placeholder).join(term);
        });
        return restored;
    }

    async fetchTranslation(text, languageCode) {
        const providers = this.getProviderOrder(languageCode);
        for (const provider of providers) {
            try {
                if (provider === 'google') {
                    const translated = await this.fetchFromGoogleTranslate(text, languageCode);
                    if (translated) return translated;
                } else if (provider === 'mymemory') {
                    const translated = await this.fetchFromMyMemory(text, languageCode);
                    if (translated) return translated;
                }
            } catch (error) {
                console.warn(`Translation provider ${provider} failed:`, error);
                this.disableProvider(provider);
            }
        }
        return null;
    }

    getProviderOrder(languageCode) {
        const normalized = this.normalizeLanguageCode(languageCode).split('-')[0];
        const providers = [];
        if (!this.disabledProviders.has('google') && this.googleSupportedLanguages.has(normalized)) {
            providers.push('google');
        }
        if (!this.disabledProviders.has('mymemory')) {
            providers.push('mymemory');
        }
        return providers;
    }

    normalizeLanguageCode(languageCode) {
        if (!languageCode) return this.baseLanguage;
        return this.languageOverrides[languageCode] || languageCode;
    }

    disableProvider(provider) {
        this.disabledProviders.add(provider);
    }

    async fetchFromGoogleTranslate(text, languageCode) {
        const target = this.normalizeLanguageCode(languageCode).split('-')[0];
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (!response.ok) throw new Error(`Google Translate responded with ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
        return data[0].map(chunk => chunk[0]).join('').trim();
    }

    async fetchFromMyMemory(text, languageCode) {
        const target = this.normalizeLanguageCode(languageCode);
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`);
        if (!response.ok) throw new Error(`MyMemory responded with ${response.status}`);
        const data = await response.json();
        let translated = data?.responseData?.translatedText;
        if (!translated && Array.isArray(data?.matches)) {
            const bestMatch = data.matches
                .filter(match => match.translation)
                .sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];
            translated = bestMatch?.translation;
        }
        return translated ? translated.trim() : null;
    }
}

