// clipboard.js - Sistema de Gerenciamento de Clipboard
// Versão 3.0 - Clipboard Manager Completo e Avançado

class ClipboardManager {
    constructor() {
        this.clipboardHistory = [];
        this.maxHistory = 50;
        this.autoCleanEnabled = true;
        this.autoCleanInterval = 300000; // 5 minutos
        this.watchInterval = null;
        this.lastClipboardContent = '';
        this.fallbackMode = false;
        this.permissionGranted = false;
        
        this.init();
    }
    
    init() {
        this.loadHistory();
        this.checkPermissions();
        this.setupAutoClean();
        this.setupKeyboardShortcuts();
    }
    
    checkPermissions() {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'clipboard-write' })
                .then(result => {
                    this.permissionGranted = result.state === 'granted';
                    
                    result.addEventListener('change', () => {
                        this.permissionGranted = result.state === 'granted';
                    });
                })
                .catch(() => {
                    this.permissionGranted = false;
                });
        }
    }
    
    async copyToClipboard(text, options = {}) {
        if (!text && text !== 0) {
            Utils.showToast('Nada para copiar', 'error');
            return false;
        }
        
        const textToCopy = String(text);
        
        try {
            const success = await this.performCopy(textToCopy, options);
            
            if (success) {
                this.addToHistory(textToCopy, options);
                
                if (options.showToast !== false) {
                    Utils.showToast(
                        options.successMessage || '✅ Copiado para área de transferência',
                        'success'
                    );
                }
                
                if (options.callback && typeof options.callback === 'function') {
                    options.callback(true, textToCopy);
                }
                
                return true;
            } else {
                throw new Error('Falha ao copiar');
            }
            
        } catch (error) {
            console.error('Erro ao copiar:', error);
            
            const fallbackSuccess = await this.fallbackCopy(textToCopy);
            
            if (fallbackSuccess) {
                this.addToHistory(textToCopy, options);
                
                if (options.showToast !== false) {
                    Utils.showToast('Copiado (método alternativo)', 'warning');
                }
                
                return true;
            } else {
                if (options.showToast !== false) {
                    Utils.showToast('❌ Erro ao copiar texto', 'error');
                }
                
                if (options.callback && typeof options.callback === 'function') {
                    options.callback(false, textToCopy);
                }
                
                return false;
            }
        }
    }
    
    async performCopy(text, options = {}) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                if (options.html) {
                    const blob = new Blob([options.html], { type: 'text/html' });
                    const data = new ClipboardItem({
                        'text/plain': new Blob([text], { type: 'text/plain' }),
                        'text/html': blob
                    });
                    
                    await navigator.clipboard.write([data]);
                } else if (options.image) {
                    const response = await fetch(options.image);
                    const blob = await response.blob();
                    const data = new ClipboardItem({
                        [blob.type]: blob
                    });
                    
                    await navigator.clipboard.write([data]);
                } else {
                    await navigator.clipboard.writeText(text);
                }
                
                return true;
                
            } catch (error) {
                console.warn('Clipboard API falhou:', error);
                return false;
            }
        }
        
        return false;
    }
    
    fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            textarea.style.top = '-9999px';
            textarea.style.pointerEvents = 'none';
            textarea.setAttribute('readonly', '');
            textarea.setAttribute('aria-hidden', 'true');
            
            document.body.appendChild(textarea);
            
            if (navigator.userAgent.match(/ipad|iphone/i)) {
                const range = document.createRange();
                range.selectNodeContents(textarea);
                
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                
                textarea.setSelectionRange(0, 999999);
            } else {
                textarea.select();
                textarea.setSelectionRange(0, 999999);
            }
            
            const success = document.execCommand('copy');
            
            document.body.removeChild(textarea);
            
            return success;
            
        } catch (error) {
            console.error('Fallback copy falhou:', error);
            return false;
        }
    }
    
    async pasteFromClipboard(options = {}) {
        try {
            if (navigator.clipboard && navigator.clipboard.readText && window.isSecureContext) {
                const text = await navigator.clipboard.readText();
                
                if (options.callback && typeof options.callback === 'function') {
                    options.callback(text);
                }
                
                return text;
            }
            
            return await this.fallbackPaste();
            
        } catch (error) {
            console.error('Erro ao colar:', error);
            
            if (options.showToast !== false) {
                Utils.showToast('❌ Erro ao colar texto', 'error');
            }
            
            return null;
        }
    }
    
    fallbackPaste() {
        return new Promise((resolve) => {
            const textarea = document.createElement('textarea');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            
            document.body.appendChild(textarea);
            textarea.focus();
            
            const timeout = setTimeout(() => {
                document.body.removeChild(textarea);
                resolve('');
            }, 3000);
            
            textarea.addEventListener('paste', (event) => {
                clearTimeout(timeout);
                
                const text = (event.clipboardData || window.clipboardData).getData('text');
                document.body.removeChild(textarea);
                
                resolve(text);
            });
        });
    }
    
    async copyMultiple(items) {
        if (!Array.isArray(items) || items.length === 0) {
            Utils.showToast('Nenhum item para copiar', 'error');
            return false;
        }
        
        const formattedText = items.map((item, index) => {
            if (typeof item === 'object') {
                return Object.entries(item)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');
            }
            return `${index + 1}. ${item}`;
        }).join('\n\n');
        
        return await this.copyToClipboard(formattedText, {
            successMessage: `${items.length} itens copiados`
        });
    }
    
    async copyFormatted(data, format = 'markdown') {
        let formatted = '';
        
        switch (format) {
            case 'markdown':
                formatted = this.formatAsMarkdown(data);
                break;
            case 'html':
                formatted = this.formatAsHTML(data);
                break;
            case 'json':
                formatted = JSON.stringify(data, null, 2);
                break;
            case 'csv':
                formatted = this.formatAsCSV(data);
                break;
            default:
                formatted = String(data);
        }
        
        const options = {};
        
        if (format === 'html') {
            options.html = formatted;
        }
        
        return await this.copyToClipboard(formatted, options);
    }
    
    formatAsMarkdown(data) {
        if (typeof data === 'string') return data;
        
        if (Array.isArray(data)) {
            return data.map(item => {
                if (typeof item === 'object' && item.url && item.title) {
                    return `- [${item.title}](${item.url})`;
                }
                return `- ${item}`;
            }).join('\n');
        }
        
        if (typeof data === 'object') {
            return Object.entries(data)
                .map(([key, value]) => `**${key}**: ${value}`)
                .join('\n');
        }
        
        return String(data);
    }
    
    formatAsHTML(data) {
        if (typeof data === 'string') return `<p>${data}</p>`;
        
        if (Array.isArray(data)) {
            return `<ul>${data.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
        
        if (typeof data === 'object') {
            return `<dl>${Object.entries(data)
                .map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`)
                .join('')}</dl>`;
        }
        
        return String(data);
    }
    
    formatAsCSV(data) {
        if (!Array.isArray(data)) return String(data);
        
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        csvRows.push(headers.join(','));
        
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header] || '';
                const escaped = String(val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }
    
    addToHistory(text, options = {}) {
        if (!text) return;
        
        if (this.clipboardHistory.length > 0 && 
            this.clipboardHistory[0].text === text) {
            this.clipboardHistory[0].timestamp = new Date().toISOString();
            this.clipboardHistory[0].count = (this.clipboardHistory[0].count || 1) + 1;
            this.saveHistory();
            return;
        }
        
        const entry = {
            id: Utils.generateId(),
            text: text,
            preview: Utils.truncate(text, 100),
            type: options.type || this.detectType(text),
            source: options.source || 'manual',
            label: options.label || '',
            timestamp: new Date().toISOString(),
            count: 1,
            metadata: options.metadata || {}
        };
        
        this.clipboardHistory.unshift(entry);
        
        if (this.clipboardHistory.length > this.maxHistory) {
            this.clipboardHistory = this.clipboardHistory.slice(0, this.maxHistory);
        }
        
        this.lastClipboardContent = text;
        this.saveHistory();
        
        if (options.onHistoryUpdate && typeof options.onHistoryUpdate === 'function') {
            options.onHistoryUpdate(this.clipboardHistory);
        }
    }
    
    detectType(text) {
        if (!text) return 'text';
        
        if (Validator.isValidUrl(text)) return 'url';
        if (Validator.isValidEmail(text)) return 'email';
        if (/^\d{13,19}$/.test(text.replace(/\s/g, ''))) return 'card';
        if (/^\+?[\d\s\(\)\-]{8,20}$/.test(text)) return 'phone';
        if (/^[0-9a-fA-F]{64}$/.test(text)) return 'hash';
        if (text.startsWith('{') && text.endsWith('}')) return 'json';
        if (text.startsWith('<') && text.endsWith('>')) return 'html';
        if (text.startsWith('data:image')) return 'image';
        
        return 'text';
    }
    
    getHistory(filter = {}) {
        let history = [...this.clipboardHistory];
        
        if (filter.type) {
            history = history.filter(item => item.type === filter.type);
        }
        
        if (filter.source) {
            history = history.filter(item => item.source === filter.source);
        }
        
        if (filter.search) {
            const search = filter.search.toLowerCase();
            history = history.filter(item => 
                item.text.toLowerCase().includes(search) ||
                (item.label && item.label.toLowerCase().includes(search))
            );
        }
        
        if (filter.dateFrom) {
            history = history.filter(item => 
                new Date(item.timestamp) >= new Date(filter.dateFrom)
            );
        }
        
        if (filter.dateTo) {
            history = history.filter(item => 
                new Date(item.timestamp) <= new Date(filter.dateTo)
            );
        }
        
        if (filter.sortBy) {
            switch (filter.sortBy) {
                case 'date':
                    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    break;
                case 'count':
                    history.sort((a, b) => b.count - a.count);
                    break;
                case 'type':
                    history.sort((a, b) => a.type.localeCompare(b.type));
                    break;
            }
        }
        
        if (filter.limit) {
            history = history.slice(0, filter.limit);
        }
        
        return history;
    }
    
    getItemById(id) {
        return this.clipboardHistory.find(item => item.id === id);
    }
    
    async copyFromHistory(id) {
        const item = this.getItemById(id);
        
        if (!item) {
            Utils.showToast('Item não encontrado no histórico', 'error');
            return false;
        }
        
        return await this.copyToClipboard(item.text, {
            source: 'history',
            successMessage: 'Item copiado do histórico'
        });
    }
    
    removeFromHistory(id) {
        const index = this.clipboardHistory.findIndex(item => item.id === id);
        
        if (index > -1) {
            this.clipboardHistory.splice(index, 1);
            this.saveHistory();
            return true;
        }
        
        return false;
    }
    
    clearHistory() {
        this.clipboardHistory = [];
        this.lastClipboardContent = '';
        this.saveHistory();
        Utils.showToast('Histórico do clipboard limpo');
    }
    
    saveHistory() {
        try {
            const dataToSave = this.clipboardHistory.slice(0, this.maxHistory);
            localStorage.setItem('ultra_clipboard_history', JSON.stringify(dataToSave));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.clipboardHistory = this.clipboardHistory.slice(0, 25);
                this.saveHistory();
            }
        }
    }
    
    loadHistory() {
        try {
            const data = localStorage.getItem('ultra_clipboard_history');
            if (data) {
                const parsed = JSON.parse(data);
                this.clipboardHistory = parsed.slice(0, this.maxHistory);
            }
        } catch {
            this.clipboardHistory = [];
        }
    }
    
    setupAutoClean() {
        if (this.autoCleanEnabled) {
            this.watchInterval = setInterval(() => {
                this.cleanOldEntries();
            }, this.autoCleanInterval);
        }
    }
    
    cleanOldEntries(daysOld = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysOld);
        
        const before = this.clipboardHistory.length;
        
        this.clipboardHistory = this.clipboardHistory.filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate > cutoff || item.count > 5;
        });
        
        const removed = before - this.clipboardHistory.length;
        
        if (removed > 0) {
            this.saveHistory();
            console.log(`Limpeza automática: ${removed} itens removidos do histórico`);
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.pasteFromClipboard();
            }
            
            if (e.ctrlKey && e.altKey && e.key === 'C') {
                e.preventDefault();
                const selectedText = window.getSelection().toString();
                if (selectedText) {
                    this.copyToClipboard(selectedText);
                }
            }
        });
    }
    
    async shareContent(text, options = {}) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: options.title || 'Compartilhar',
                    text: text,
                    url: options.url || ''
                });
                
                return true;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro ao compartilhar:', error);
                }
                return false;
            }
        } else {
            const copied = await this.copyToClipboard(text, {
                successMessage: 'Link copiado (compartilhamento não suportado)'
            });
            return copied;
        }
    }
    
    getStats() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const todayItems = this.clipboardHistory.filter(item => 
            item.timestamp.startsWith(today)
        );
        
        const typeCount = {};
        this.clipboardHistory.forEach(item => {
            typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        });
        
        const mostCopied = [...this.clipboardHistory]
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        return {
            totalItems: this.clipboardHistory.length,
            todayItems: todayItems.length,
            types: typeCount,
            mostCopied: mostCopied,
            oldestItem: this.clipboardHistory[this.clipboardHistory.length - 1] || null,
            newestItem: this.clipboardHistory[0] || null,
            storageUsed: new Blob([JSON.stringify(this.clipboardHistory)]).size
        };
    }
    
    searchHistory(query) {
        if (!query || query.trim().length === 0) return [];
        
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        
        return this.clipboardHistory.filter(item => {
            const searchText = (item.text + ' ' + (item.label || '')).toLowerCase();
            return searchTerms.every(term => searchText.includes(term));
        });
    }
    
    exportHistory(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.clipboardHistory, null, 2);
            case 'csv':
                return this.exportAsCSV(this.clipboardHistory);
            case 'txt':
                return this.clipboardHistory
                    .map(item => `[${item.timestamp}] ${item.text}`)
                    .join('\n\n');
            default:
                return JSON.stringify(this.clipboardHistory, null, 2);
        }
    }
    
    exportAsCSV(items) {
        const headers = ['ID', 'Texto', 'Tipo', 'Data', 'Contagem', 'Label'];
        const rows = items.map(item => [
            item.id,
            `"${item.text.replace(/"/g, '""')}"`,
            item.type,
            item.timestamp,
            item.count,
            item.label || ''
        ]);
        
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    
    importHistory(data) {
        try {
            const imported = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (!Array.isArray(imported)) {
                throw new Error('Formato inválido');
            }
            
            let added = 0;
            
            imported.forEach(item => {
                if (item.text && item.timestamp) {
                    const exists = this.clipboardHistory.some(
                        existing => existing.text === item.text
                    );
                    
                    if (!exists) {
                        this.clipboardHistory.unshift({
                            id: item.id || Utils.generateId(),
                            text: item.text,
                            preview: Utils.truncate(item.text, 100),
                            type: item.type || this.detectType(item.text),
                            source: 'imported',
                            label: item.label || '',
                            timestamp: item.timestamp,
                            count: item.count || 1,
                            metadata: item.metadata || {}
                        });
                        added++;
                    }
                }
            });
            
            this.clipboardHistory.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            if (this.clipboardHistory.length > this.maxHistory) {
                this.clipboardHistory = this.clipboardHistory.slice(0, this.maxHistory);
            }
            
            this.saveHistory();
            
            Utils.showToast(`${added} itens importados com sucesso`);
            return added;
            
        } catch (error) {
            Utils.showToast('Erro ao importar: ' + error.message, 'error');
            return 0;
        }
    }
    
    startWatching() {
        if (!this.watchInterval) {
            this.watchInterval = setInterval(async () => {
                try {
                    if (navigator.clipboard && navigator.clipboard.readText && window.isSecureContext) {
                        const text = await navigator.clipboard.readText();
                        
                        if (text && text !== this.lastClipboardContent) {
                            this.addToHistory(text, {
                                source: 'watch',
                                type: this.detectType(text)
                            });
                            this.lastClipboardContent = text;
                        }
                    }
                } catch {
                    // Ignorar erros de leitura do clipboard
                }
            }, 2000);
        }
    }
    
    stopWatching() {
        if (this.watchInterval) {
            clearInterval(this.watchInterval);
            this.watchInterval = null;
        }
    }
    
    destroy() {
        this.stopWatching();
        
        if (this.autoCleanEnabled) {
            clearInterval(this.autoCleanInterval);
        }
        
        this.saveHistory();
    }
}

// Instância global para compatibilidade
if (typeof window !== 'undefined') {
    window.clipboardManager = new ClipboardManager();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClipboardManager;
}