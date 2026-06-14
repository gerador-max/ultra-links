// shortener.js - Sistema Encurtador de URLs
// Versão 3.0 - Encurtador Local Completo

class LinkShortener {
    constructor() {
        this.urlDatabase = new Map();
        this.storageKey = 'ultra_shortener_urls';
        this.baseUrl = 'https://cur.to';
        this.minCodeLength = 4;
        this.maxCodeLength = 30;
        this.defaultCodeLength = 6;
        this.maxUrls = 1000;
        this.blacklistedDomains = [];
        this.urlCache = new Map();
        this.pendingRequests = new Map();
        
        this.init();
    }
    
    init() {
        this.loadDatabase();
        this.loadBlacklist();
        this.cleanupExpired();
        this.setupAnalytics();
    }
    
    loadDatabase() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.urlDatabase = new Map(Object.entries(parsed));
                
                if (this.urlDatabase.size > this.maxUrls) {
                    this.cleanupOldEntries();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar banco de dados:', error);
            this.urlDatabase = new Map();
        }
    }
    
    saveDatabase() {
        try {
            const obj = Object.fromEntries(this.urlDatabase);
            const json = JSON.stringify(obj);
            
            if (json.length > 5 * 1024 * 1024) {
                this.cleanupOldEntries();
                const reduced = Object.fromEntries(this.urlDatabase);
                localStorage.setItem(this.storageKey, JSON.stringify(reduced));
            } else {
                localStorage.setItem(this.storageKey, json);
            }
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldEntries();
                this.saveDatabase();
            } else {
                console.error('Erro ao salvar banco de dados:', error);
            }
        }
    }
    
    loadBlacklist() {
        const blacklist = localStorage.getItem('ultra_shortener_blacklist');
        if (blacklist) {
            try {
                this.blacklistedDomains = JSON.parse(blacklist);
            } catch {
                this.blacklistedDomains = [];
            }
        }
    }
    
    setupAnalytics() {
        this.analytics = {
            totalShortened: parseInt(localStorage.getItem('ultra_total_shortened') || '0'),
            totalClicks: parseInt(localStorage.getItem('ultra_total_clicks') || '0'),
            dailyStats: JSON.parse(localStorage.getItem('ultra_daily_stats') || '{}')
        };
    }
    
    saveAnalytics() {
        localStorage.setItem('ultra_total_shortened', this.analytics.totalShortened.toString());
        localStorage.setItem('ultra_total_clicks', this.analytics.totalClicks.toString());
        localStorage.setItem('ultra_daily_stats', JSON.stringify(this.analytics.dailyStats));
    }
    
    generateShortCode(length = null) {
        const codeLength = length || this.defaultCodeLength;
        const actualLength = Math.max(this.minCodeLength, Math.min(codeLength, this.maxCodeLength));
        
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const chars = lowercase + uppercase + numbers;
        
        let code = '';
        const randomValues = new Uint8Array(actualLength);
        
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(randomValues);
        } else {
            for (let i = 0; i < actualLength; i++) {
                randomValues[i] = Math.floor(Math.random() * 256);
            }
        }
        
        for (let i = 0; i < actualLength; i++) {
            code += chars.charAt(randomValues[i] % chars.length);
        }
        
        if (this.urlDatabase.has(code)) {
            return this.generateShortCode(actualLength + 1);
        }
        
        return code;
    }
    
    generateCustomCode() {
        const adjectives = [
            'rapido', 'agil', 'curto', 'breve', 'leve', 'smart', 'facil',
            'direto', 'clean', 'zen', 'pro', 'max', 'top', 'plus'
        ];
        
        const nouns = [
            'link', 'url', 'site', 'web', 'page', 'info', 'dados',
            'conteudo', 'acesso', 'portal', 'hub', 'ponto', 'meta'
        ];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 999);
        
        const code = `${adj}-${noun}-${number}`;
        
        if (this.urlDatabase.has(code)) {
            return this.generateCustomCode();
        }
        
        return code;
    }
    
    shortenUrl(longUrl, customAlias = '', options = {}) {
        try {
            if (!longUrl || typeof longUrl !== 'string') {
                throw new Error('URL não fornecida');
            }
            
            longUrl = longUrl.trim();
            
            if (!Validator.isValidUrl(longUrl)) {
                throw new Error('URL inválida. Use formato: https://exemplo.com');
            }
            
            if (longUrl.length > 2048) {
                throw new Error('URL muito longa (máximo 2048 caracteres)');
            }
            
            const urlObj = new URL(longUrl);
            
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                throw new Error('Protocolo não suportado');
            }
            
            if (this.blacklistedDomains.includes(urlObj.hostname)) {
                throw new Error('Este domínio está na lista negra');
            }
            
            const existingCode = this.findExistingUrl(longUrl);
            if (existingCode && !customAlias) {
                const shortUrl = `${this.baseUrl}/${existingCode}`;
                this.updateUrlStats(existingCode);
                return shortUrl;
            }
            
            let shortCode;
            
            if (customAlias && customAlias.trim()) {
                customAlias = customAlias.trim().toLowerCase();
                
                if (!Validator.isValidAlias(customAlias)) {
                    throw new Error('Alias personalizado inválido. Use 3-30 caracteres (letras, números, hífens)');
                }
                
                if (this.urlDatabase.has(customAlias)) {
                    const existing = this.urlDatabase.get(customAlias);
                    if (existing.longUrl === longUrl) {
                        return `${this.baseUrl}/${customAlias}`;
                    }
                    throw new Error('Este alias já está em uso');
                }
                
                shortCode = customAlias;
            } else if (options.useCustomCode) {
                shortCode = this.generateCustomCode();
            } else {
                const codeLength = options.codeLength || this.defaultCodeLength;
                shortCode = this.generateShortCode(codeLength);
            }
            
            const urlEntry = {
                longUrl: longUrl,
                shortCode: shortCode,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                clicks: 0,
                lastClickAt: null,
                expiresAt: options.expiresAt || null,
                password: options.password || null,
                title: options.title || '',
                description: options.description || '',
                tags: options.tags || [],
                isActive: true
            };
            
            this.urlDatabase.set(shortCode, urlEntry);
            this.urlCache.set(longUrl, shortCode);
            
            this.analytics.totalShortened++;
            this.updateDailyStats('shortened');
            this.saveAnalytics();
            this.saveDatabase();
            
            const shortUrl = `${this.baseUrl}/${shortCode}`;
            
            HistoryManager.addToHistory({
                type: 'encurtador',
                original: longUrl,
                generated: shortUrl,
                shortCode: shortCode,
                timestamp: new Date().toISOString()
            });
            
            Utils.showToast('URL encurtada com sucesso!');
            
            return shortUrl;
            
        } catch (error) {
            Utils.showToast(error.message, 'error');
            return null;
        }
    }
    
    findExistingUrl(longUrl) {
        if (this.urlCache.has(longUrl)) {
            const cachedCode = this.urlCache.get(longUrl);
            if (this.urlDatabase.has(cachedCode)) {
                return cachedCode;
            } else {
                this.urlCache.delete(longUrl);
            }
        }
        
        for (const [code, entry] of this.urlDatabase) {
            if (entry.longUrl === longUrl && entry.isActive) {
                this.urlCache.set(longUrl, code);
                return code;
            }
        }
        
        return null;
    }
    
    getOriginalUrl(shortCode) {
        if (!shortCode) return null;
        
        shortCode = shortCode.trim();
        
        if (this.pendingRequests.has(shortCode)) {
            return this.pendingRequests.get(shortCode);
        }
        
        const promise = new Promise((resolve) => {
            const entry = this.urlDatabase.get(shortCode);
            
            if (!entry || !entry.isActive) {
                resolve(null);
                return;
            }
            
            if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
                entry.isActive = false;
                this.saveDatabase();
                resolve(null);
                return;
            }
            
            if (entry.password) {
                const password = prompt('Esta URL está protegida por senha. Digite a senha:');
                if (password !== entry.password) {
                    Utils.showToast('Senha incorreta', 'error');
                    resolve(null);
                    return;
                }
            }
            
            entry.clicks++;
            entry.lastClickAt = new Date().toISOString();
            
            this.analytics.totalClicks++;
            this.updateDailyStats('clicks');
            this.saveAnalytics();
            this.saveDatabase();
            
            resolve(entry.longUrl);
        });
        
        this.pendingRequests.set(shortCode, promise);
        
        promise.finally(() => {
            setTimeout(() => {
                this.pendingRequests.delete(shortCode);
            }, 100);
        });
        
        return null;
    }
    
    getOriginalUrlSync(shortCode) {
        const entry = this.urlDatabase.get(shortCode);
        
        if (!entry || !entry.isActive) return null;
        
        if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
            entry.isActive = false;
            this.saveDatabase();
            return null;
        }
        
        entry.clicks++;
        entry.lastClickAt = new Date().toISOString();
        
        this.analytics.totalClicks++;
        this.updateDailyStats('clicks');
        this.saveAnalytics();
        this.saveDatabase();
        
        return entry.longUrl;
    }
    
    updateUrlStats(shortCode) {
        const entry = this.urlDatabase.get(shortCode);
        if (entry) {
            entry.updatedAt = new Date().toISOString();
            this.saveDatabase();
        }
    }
    
    deleteUrl(shortCode) {
        if (this.urlDatabase.has(shortCode)) {
            const entry = this.urlDatabase.get(shortCode);
            entry.isActive = false;
            entry.deletedAt = new Date().toISOString();
            this.saveDatabase();
            Utils.showToast('URL removida com sucesso');
            return true;
        }
        return false;
    }
    
    permanentlyDeleteUrl(shortCode) {
        if (this.urlDatabase.has(shortCode)) {
            const entry = this.urlDatabase.get(shortCode);
            this.urlCache.delete(entry.longUrl);
            this.urlDatabase.delete(shortCode);
            this.saveDatabase();
            Utils.showToast('URL excluída permanentemente');
            return true;
        }
        return false;
    }
    
    reactivateUrl(shortCode) {
        const entry = this.urlDatabase.get(shortCode);
        if (entry) {
            entry.isActive = true;
            entry.reactivatedAt = new Date().toISOString();
            delete entry.deletedAt;
            this.saveDatabase();
            Utils.showToast('URL reativada com sucesso');
            return true;
        }
        return false;
    }
    
    updateUrl(shortCode, updates) {
        const entry = this.urlDatabase.get(shortCode);
        if (!entry) return false;
        
        const allowedUpdates = ['title', 'description', 'tags', 'password', 'expiresAt'];
        
        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                entry[key] = updates[key];
            }
        }
        
        entry.updatedAt = new Date().toISOString();
        this.saveDatabase();
        Utils.showToast('URL atualizada com sucesso');
        return true;
    }
    
    getUrlInfo(shortCode) {
        const entry = this.urlDatabase.get(shortCode);
        if (!entry) return null;
        
        return {
            ...entry,
            shortUrl: `${this.baseUrl}/${shortCode}`,
            age: this.calculateAge(entry.createdAt)
        };
    }
    
    calculateAge(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        const diff = now - created;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }
    
    getAllUrls(filter = {}) {
        let urls = Array.from(this.urlDatabase.entries()).map(([code, entry]) => ({
            shortCode: code,
            shortUrl: `${this.baseUrl}/${code}`,
            ...entry
        }));
        
        if (filter.active !== undefined) {
            urls = urls.filter(url => url.isActive === filter.active);
        }
        
        if (filter.search) {
            const search = filter.search.toLowerCase();
            urls = urls.filter(url => 
                url.longUrl.toLowerCase().includes(search) ||
                url.shortCode.toLowerCase().includes(search) ||
                (url.title && url.title.toLowerCase().includes(search))
            );
        }
        
        if (filter.sortBy) {
            urls.sort((a, b) => {
                switch (filter.sortBy) {
                    case 'clicks':
                        return filter.order === 'asc' ? a.clicks - b.clicks : b.clicks - a.clicks;
                    case 'date':
                        return filter.order === 'asc' 
                            ? new Date(a.createdAt) - new Date(b.createdAt)
                            : new Date(b.createdAt) - new Date(a.createdAt);
                    case 'title':
                        return filter.order === 'asc'
                            ? (a.title || '').localeCompare(b.title || '')
                            : (b.title || '').localeCompare(a.title || '');
                    default:
                        return 0;
                }
            });
        }
        
        return urls;
    }
    
    getStats() {
        const allUrls = Array.from(this.urlDatabase.values());
        const activeUrls = allUrls.filter(url => url.isActive);
        const totalClicks = allUrls.reduce((sum, url) => sum + url.clicks, 0);
        
        const today = new Date().toISOString().split('T')[0];
        const todayClicks = allUrls.filter(url => {
            if (!url.lastClickAt) return false;
            return url.lastClickAt.startsWith(today);
        }).length;
        
        const topUrls = activeUrls
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 10)
            .map(url => ({
                shortCode: url.shortCode,
                longUrl: url.longUrl,
                clicks: url.clicks,
                shortUrl: `${this.baseUrl}/${url.shortCode}`
            }));
        
        return {
            totalUrls: allUrls.length,
            activeUrls: activeUrls.length,
            totalClicks: totalClicks,
            todayClicks: todayClicks,
            averageClicksPerUrl: activeUrls.length > 0 ? (totalClicks / activeUrls.length).toFixed(2) : 0,
            topUrls: topUrls,
            databaseSize: this.urlDatabase.size,
            createdAt: allUrls.length > 0 
                ? allUrls.reduce((oldest, url) => 
                    url.createdAt < oldest ? url.createdAt : oldest
                  )
                : null
        };
    }
    
    updateDailyStats(type) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.analytics.dailyStats[today]) {
            this.analytics.dailyStats[today] = {
                shortened: 0,
                clicks: 0
            };
        }
        
        this.analytics.dailyStats[today][type]++;
        
        const dates = Object.keys(this.analytics.dailyStats);
        if (dates.length > 90) {
            const sorted = dates.sort();
            const toDelete = sorted.slice(0, dates.length - 90);
            toDelete.forEach(date => {
                delete this.analytics.dailyStats[date];
            });
        }
        
        this.saveAnalytics();
    }
    
    addToBlacklist(domain) {
        domain = domain.toLowerCase().trim();
        if (!this.blacklistedDomains.includes(domain)) {
            this.blacklistedDomains.push(domain);
            localStorage.setItem('ultra_shortener_blacklist', JSON.stringify(this.blacklistedDomains));
            Utils.showToast(`Domínio ${domain} adicionado à lista negra`);
            return true;
        }
        return false;
    }
    
    removeFromBlacklist(domain) {
        const index = this.blacklistedDomains.indexOf(domain.toLowerCase().trim());
        if (index > -1) {
            this.blacklistedDomains.splice(index, 1);
            localStorage.setItem('ultra_shortener_blacklist', JSON.stringify(this.blacklistedDomains));
            Utils.showToast(`Domínio ${domain} removido da lista negra`);
            return true;
        }
        return false;
    }
    
    cleanupOldEntries() {
        const entries = Array.from(this.urlDatabase.entries());
        
        entries.sort((a, b) => {
            const dateA = new Date(a[1].createdAt);
            const dateB = new Date(b[1].createdAt);
            return dateA - dateB;
        });
        
        const toRemove = entries.slice(0, Math.floor(entries.length * 0.3));
        
        toRemove.forEach(([code, entry]) => {
            if (!entry.isActive) {
                this.urlDatabase.delete(code);
                this.urlCache.delete(entry.longUrl);
            }
        });
        
        this.saveDatabase();
    }
    
    cleanupExpired() {
        const now = new Date();
        let cleaned = 0;
        
        for (const [code, entry] of this.urlDatabase) {
            if (entry.expiresAt && new Date(entry.expiresAt) < now) {
                entry.isActive = false;
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            this.saveDatabase();
        }
        
        return cleaned;
    }
    
    exportUrls(format = 'json') {
        const urls = this.getAllUrls();
        
        switch (format) {
            case 'csv':
                return this.exportAsCSV(urls);
            case 'json':
            default:
                return JSON.stringify(urls, null, 2);
        }
    }
    
    exportAsCSV(urls) {
        const headers = ['Código', 'URL Curta', 'URL Original', 'Cliques', 'Criado em', 'Ativo'];
        const rows = urls.map(url => [
            url.shortCode,
            url.shortUrl,
            url.longUrl,
            url.clicks,
            url.createdAt,
            url.isActive ? 'Sim' : 'Não'
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        return csvContent;
    }
    
    importUrls(data) {
        try {
            const urls = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (!Array.isArray(urls)) {
                throw new Error('Formato de dados inválido');
            }
            
            let imported = 0;
            
            urls.forEach(url => {
                if (url.longUrl && url.shortCode && !this.urlDatabase.has(url.shortCode)) {
                    this.urlDatabase.set(url.shortCode, {
                        longUrl: url.longUrl,
                        shortCode: url.shortCode,
                        createdAt: url.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        clicks: url.clicks || 0,
                        lastClickAt: url.lastClickAt || null,
                        expiresAt: url.expiresAt || null,
                        password: url.password || null,
                        title: url.title || '',
                        description: url.description || '',
                        tags: url.tags || [],
                        isActive: url.isActive !== undefined ? url.isActive : true
                    });
                    imported++;
                }
            });
            
            this.saveDatabase();
            Utils.showToast(`${imported} URLs importadas com sucesso`);
            return imported;
            
        } catch (error) {
            Utils.showToast('Erro ao importar URLs: ' + error.message, 'error');
            return 0;
        }
    }
    
    clearAll() {
        if (confirm('Tem certeza que deseja excluir TODAS as URLs encurtadas? Esta ação não pode ser desfeita.')) {
            this.urlDatabase.clear();
            this.urlCache.clear();
            this.saveDatabase();
            
            this.analytics.totalShortened = 0;
            this.analytics.totalClicks = 0;
            this.saveAnalytics();
            
            Utils.showToast('Todas as URLs foram removidas');
            return true;
        }
        return false;
    }
    
    validateBeforeShorten(longUrl) {
        const checks = {
            isValid: true,
            checks: []
        };
        
        if (!longUrl) {
            checks.checks.push({ passed: false, message: 'URL está vazia' });
            checks.isValid = false;
            return checks;
        }
        
        checks.checks.push({ 
            passed: true, 
            message: 'URL fornecida' 
        });
        
        const urlCheck = Validator.isValidUrl(longUrl);
        checks.checks.push({ 
            passed: urlCheck, 
            message: urlCheck ? 'Formato de URL válido' : 'Formato de URL inválido' 
        });
        
        if (!urlCheck) {
            checks.isValid = false;
            return checks;
        }
        
        try {
            const urlObj = new URL(longUrl);
            
            const protocolCheck = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
            checks.checks.push({ 
                passed: protocolCheck, 
                message: protocolCheck ? 'Protocolo válido' : 'Protocolo não suportado' 
            });
            
            if (!protocolCheck) checks.isValid = false;
            
            const lengthCheck = longUrl.length <= 2048;
            checks.checks.push({ 
                passed: lengthCheck, 
                message: lengthCheck ? 'Tamanho dentro do limite' : 'URL muito longa' 
            });
            
            if (!lengthCheck) checks.isValid = false;
            
            const blacklistCheck = !this.blacklistedDomains.includes(urlObj.hostname);
            checks.checks.push({ 
                passed: blacklistCheck, 
                message: blacklistCheck ? 'Domínio permitido' : 'Domínio na lista negra' 
            });
            
            if (!blacklistCheck) checks.isValid = false;
            
        } catch {
            checks.isValid = false;
        }
        
        return checks;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkShortener;
}