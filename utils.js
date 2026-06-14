// utils.js - Utilitários do Sistema Ultra Gerador de Links
// Versão 3.0 - Biblioteca de Funções Utilitárias

class Utils {
    // Gerador de IDs únicos
    static generateId(length = 16) {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        const extraRandom = Math.random().toString(36).substring(2, 10);
        return `${timestamp}-${randomPart}-${extraRandom}`.substring(0, length);
    }
    
    // Gerador de IDs curtos
    static generateShortId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const randomValues = new Uint8Array(length);
        
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(randomValues);
        } else {
            for (let i = 0; i < length; i++) {
                randomValues[i] = Math.floor(Math.random() * 256);
            }
        }
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(randomValues[i] % chars.length);
        }
        
        return result;
    }
    
    // Formatação de data
    static formatDate(date) {
        if (!date) return 'Data não disponível';
        
        try {
            const dateObj = new Date(date);
            
            if (isNaN(dateObj.getTime())) {
                return 'Data inválida';
            }
            
            const now = new Date();
            const diff = now - dateObj;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (seconds < 60) return 'Agora mesmo';
            if (minutes < 60) return `${minutes} min atrás`;
            if (hours < 24) return `${hours} h atrás`;
            if (days < 7) return `${days} d atrás`;
            
            const options = { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            
            return dateObj.toLocaleDateString('pt-BR', options);
            
        } catch (error) {
            return 'Data inválida';
        }
    }
    
    // Formatação de data completa
    static formatFullDate(date) {
        if (!date) return '';
        
        try {
            const dateObj = new Date(date);
            const options = { 
                weekday: 'long',
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            return dateObj.toLocaleDateString('pt-BR', options);
        } catch {
            return '';
        }
    }
    
    // Debounce para otimização
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle para eventos frequentes
    static throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    }
    
    // Escape HTML para segurança
    static escapeHtml(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return String(text).replace(/[&<>"'`=\/]/g, (char) => map[char]);
    }
    
    // Unescape HTML
    static unescapeHtml(text) {
        if (!text) return '';
        
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }
    
    // Sistema de Toast Notifications
    static showToast(message, type = 'success', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) {
            const newContainer = document.createElement('div');
            newContainer.id = 'toast-container';
            document.body.appendChild(newContainer);
            return this.showToast(message, type, duration);
        }
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const backgrounds = {
            success: '#00BFA6',
            error: '#FF6584',
            warning: '#FFB800',
            info: '#6C63FF'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.backgroundColor = backgrounds[type] || backgrounds.info;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        return toast;
    }
    
    // Validação de URL
    static isValidUrl(url) {
        if (!url) return false;
        
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }
    
    // Validação de email
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Validação de string vazia
    static isEmpty(str) {
        return !str || str.trim().length === 0;
    }
    
    // Capitalizar primeira letra
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    // Truncar texto
    static truncate(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Slugify
    static slugify(text) {
        if (!text) return '';
        
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Gerar string aleatória
    static randomString(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Copiar para clipboard
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                textarea.style.pointerEvents = 'none';
                document.body.appendChild(textarea);
                textarea.select();
                
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error('Erro ao copiar:', error);
            return false;
        }
    }
    
    // Local Storage com expiração
    static setStorageWithExpiry(key, value, ttl = 86400000) {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl,
        };
        localStorage.setItem(key, JSON.stringify(item));
    }
    
    static getStorageWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        const now = new Date();
        
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        
        return item.value;
    }
    
    // Formatar bytes
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Formatar número
    static formatNumber(number) {
        return new Intl.NumberFormat('pt-BR').format(number);
    }
    
    // Parse query string
    static parseQueryString(url) {
        const params = {};
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
            });
        } catch {
            const queryString = url.split('?')[1];
            if (queryString) {
                queryString.split('&').forEach(pair => {
                    const [key, value] = pair.split('=');
                    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
                });
            }
        }
        return params;
    }
    
    // Build query string
    static buildQueryString(params) {
        return Object.keys(params)
            .filter(key => params[key] !== null && params[key] !== undefined)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    }
    
    // Merge de objetos
    static deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
        
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else if (Array.isArray(source[key])) {
                    target[key] = [...(target[key] || []), ...source[key]];
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return this.deepMerge(target, ...sources);
    }
    
    // Verificar se é objeto
    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
    
    // Delay assíncrono
    static async delay(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Retry com backoff
    static async retry(fn, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                await this.delay(delay * Math.pow(2, i));
            }
        }
    }
    
    // Sanitizar input
    static sanitizeInput(input) {
        if (!input) return '';
        return input.replace(/[<>{}]/g, '').trim();
    }
    
    // Validar comprimento
    static validateLength(value, min, max, fieldName = 'Campo') {
        if (!value) return true;
        if (value.length < min) {
            Utils.showToast(`${fieldName} deve ter no mínimo ${min} caracteres`, 'warning');
            return false;
        }
        if (value.length > max) {
            Utils.showToast(`${fieldName} deve ter no máximo ${max} caracteres`, 'warning');
            return false;
        }
        return true;
    }
    
    // Gerar cor aleatória
    static randomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    // Converter hex para rgb
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Detectar dispositivo móvel
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Detectar touch
    static isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }
    
    // Obter parâmetros da URL atual
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
    
    // Adicionar evento com cleanup
    static addEventListenerWithCleanup(element, event, handler) {
        element.addEventListener(event, handler);
        return () => element.removeEventListener(event, handler);
    }
    
    // Clamp number
    static clamp(number, min, max) {
        return Math.min(Math.max(number, min), max);
    }
    
    // Shuffle array
    static shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    // Remover duplicatas de array
    static uniqueArray(array) {
        return [...new Set(array)];
    }
    
    // Agrupar array por chave
    static groupBy(array, key) {
        return array.reduce((result, item) => {
            (result[item[key]] = result[item[key]] || []).push(item);
            return result;
        }, {});
    }
    
    // Logger formatado
    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        
        switch (level) {
            case 'error':
                console.error(prefix, message, data || '');
                break;
            case 'warn':
                console.warn(prefix, message, data || '');
                break;
            case 'info':
                console.info(prefix, message, data || '');
                break;
            default:
                console.log(prefix, message, data || '');
        }
    }
    
    // Verificar se está online
    static isOnline() {
        return navigator.onLine;
    }
    
    // Obter tipo de conexão
    static getConnectionType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection ? connection.effectiveType : 'desconhecido';
    }
    
    // Salvar arquivo
    static downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Ler arquivo
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    // Performance timer
    static measurePerformance(fn, label = 'Performance') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    // Memoize function
    static memoize(fn) {
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }
    
    // Compose functions
    static compose(...fns) {
        return fns.reduce((f, g) => (...args) => f(g(...args)));
    }
    
    // Pipe functions
    static pipe(...fns) {
        return fns.reduceRight((f, g) => (...args) => f(g(...args)));
    }
}

// Polyfills e compatibilidade
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }
        if (start + search.length > this.length) {
            return false;
        }
        return this.indexOf(search, start) !== -1;
    };
}

if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
        if (this == null) {
            throw new TypeError('"this" é null ou undefined');
        }
        const o = Object(this);
        const len = o.length >>> 0;
        if (len === 0) return false;
        const n = fromIndex | 0;
        let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (o[k] === searchElement) return true;
            k++;
        }
        return false;
    };
}

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}