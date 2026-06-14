// app.js - Sistema Principal Ultra Gerador de Links
// Versão 3.0 - Completamente Funcional

class UltraLinkGenerator {
    constructor() {
        this.generator = null;
        this.shortener = null;
        this.qrGenerator = null;
        this.currentSection = 'gerador';
        this.isOnline = navigator.onLine;
        
        this.init();
    }
    
    init() {
        try {
            this.initializeModules();
            this.setupNavigation();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            this.loadTheme();
            this.loadLastSection();
            this.checkOnlineStatus();
            HistoryManager.renderHistory();
            this.showWelcomeMessage();
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showToast('Erro ao iniciar aplicação', 'error');
        }
    }
    
    initializeModules() {
        this.generator = new LinkGenerator();
        this.shortener = new LinkShortener();
        this.qrGenerator = new QRCodeGenerator();
    }
    
    setupNavigation() {
        const navButtons = document.querySelectorAll('#main-nav button');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const sectionId = button.getAttribute('data-section');
                if (sectionId) {
                    this.navigateTo(sectionId);
                }
            });
        });
    }
    
    navigateTo(sectionId) {
        try {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`section-${sectionId}`);
            if (!targetSection) {
                throw new Error(`Seção ${sectionId} não encontrada`);
            }
            
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            document.querySelectorAll('#main-nav button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeButton = document.getElementById(`btn-${sectionId}`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            localStorage.setItem('lastSection', sectionId);
            
            if (sectionId === 'historico') {
                HistoryManager.renderHistory();
            }
            
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Erro na navegação:', error);
            this.showToast('Erro ao navegar', 'error');
        }
    }
    
    setupEventListeners() {
        this.setupGeneratorEvents();
        this.setupShortenerEvents();
        this.setupQRCodeEvents();
        this.setupHistoryEvents();
        this.setupThemeToggle();
        this.setupOnlineOfflineEvents();
    }
    
    setupGeneratorEvents() {
        const addParamBtn = document.getElementById('add-param');
        const generateBtn = document.getElementById('generate-link');
        const copyBtn = document.getElementById('copy-link');
        const baseUrlInput = document.getElementById('base-url');
        
        if (addParamBtn) {
            addParamBtn.addEventListener('click', () => {
                this.generator.addParamRow();
            });
        }
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                try {
                    const resultContainer = document.getElementById('result-container');
                    const generatedLink = this.generator.generateLink();
                    
                    if (generatedLink) {
                        if (resultContainer) {
                            resultContainer.style.display = 'block';
                            resultContainer.scrollIntoView({ behavior: 'smooth' });
                        }
                        this.showToast('Link gerado com sucesso!');
                        this.updateLinkPreview(generatedLink);
                    }
                } catch (error) {
                    console.error('Erro ao gerar link:', error);
                    this.showToast('Erro ao gerar link. Verifique os dados.', 'error');
                }
            });
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const linkInput = document.getElementById('generated-link');
                if (linkInput && linkInput.value) {
                    ClipboardManager.copyToClipboard(linkInput.value);
                    this.animateButton(copyBtn);
                }
            });
        }
        
        if (baseUrlInput) {
            baseUrlInput.addEventListener('input', () => {
                document.getElementById('result-container').style.display = 'none';
            });
        }
    }
    
    setupShortenerEvents() {
        const shortenBtn = document.getElementById('shorten-url');
        const copyShortBtn = document.getElementById('copy-short');
        
        if (shortenBtn) {
            shortenBtn.addEventListener('click', () => {
                try {
                    const longUrl = document.getElementById('long-url').value;
                    const customAlias = document.getElementById('custom-alias').value;
                    
                    if (!longUrl) {
                        this.showToast('Por favor, insira uma URL', 'error');
                        return;
                    }
                    
                    const shortUrl = this.shortener.shortenUrl(longUrl, customAlias);
                    
                    if (shortUrl) {
                        const resultDiv = document.getElementById('short-result');
                        const shortenedInput = document.getElementById('shortened-url');
                        
                        if (shortenedInput) {
                            shortenedInput.value = shortUrl;
                        }
                        
                        if (resultDiv) {
                            resultDiv.style.display = 'block';
                            resultDiv.scrollIntoView({ behavior: 'smooth' });
                        }
                        
                        this.updateShortenerStats(longUrl, shortUrl);
                        this.showToast('URL encurtada com sucesso!');
                    }
                } catch (error) {
                    console.error('Erro ao encurtar:', error);
                    this.showToast('Erro ao encurtar URL', 'error');
                }
            });
        }
        
        if (copyShortBtn) {
            copyShortBtn.addEventListener('click', () => {
                const shortInput = document.getElementById('shortened-url');
                if (shortInput && shortInput.value) {
                    ClipboardManager.copyToClipboard(shortInput.value);
                    this.animateButton(copyShortBtn);
                }
            });
        }
    }
    
    setupQRCodeEvents() {
        const generateQRBtn = document.getElementById('generate-qr');
        const downloadQRBtn = document.getElementById('download-qr');
        
        if (generateQRBtn) {
            generateQRBtn.addEventListener('click', async () => {
                try {
                    const url = document.getElementById('qr-url').value;
                    const size = parseInt(document.getElementById('qr-size').value);
                    const color = document.getElementById('qr-color').value;
                    
                    if (!url) {
                        this.showToast('Por favor, insira uma URL', 'error');
                        return;
                    }
                    
                    generateQRBtn.disabled = true;
                    generateQRBtn.innerHTML = '<span>⏳</span> Gerando...';
                    
                    await this.qrGenerator.generateQRCode(url, size, color);
                    
                    const container = document.getElementById('qrcode-container');
                    if (container) {
                        container.style.display = 'block';
                        container.scrollIntoView({ behavior: 'smooth' });
                    }
                    
                    this.showToast('QR Code gerado com sucesso!');
                    
                } catch (error) {
                    console.error('Erro ao gerar QR Code:', error);
                    this.showToast('Erro ao gerar QR Code', 'error');
                } finally {
                    generateQRBtn.disabled = false;
                    generateQRBtn.innerHTML = '<span>📱</span> Gerar QR Code';
                }
            });
        }
        
        if (downloadQRBtn) {
            downloadQRBtn.addEventListener('click', () => {
                this.qrGenerator.downloadQRCode();
            });
        }
    }
    
    setupHistoryEvents() {
        const clearBtn = document.getElementById('clear-history');
        const exportBtn = document.getElementById('export-history');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
                    HistoryManager.clearHistory();
                    this.showToast('Histórico limpo com sucesso');
                }
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                HistoryManager.exportHistory();
                this.showToast('Histórico exportado com sucesso');
            });
        }
    }
    
    setupThemeToggle() {
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.toggleTheme();
            } else if (e.ctrlKey && e.key === '1') {
                e.preventDefault();
                this.navigateTo('gerador');
            } else if (e.ctrlKey && e.key === '2') {
                e.preventDefault();
                this.navigateTo('encurtador');
            } else if (e.ctrlKey && e.key === '3') {
                e.preventDefault();
                this.navigateTo('qrcode');
            } else if (e.ctrlKey && e.key === '4') {
                e.preventDefault();
                this.navigateTo('historico');
            }
        });
    }
    
    setupOnlineOfflineEvents() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showToast('🌐 Conectado à internet');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showToast('📡 Modo offline - Funcionalidade limitada');
        });
    }
    
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIconDark = document.querySelector('.theme-icon-dark');
        const themeIconLight = document.querySelector('.theme-icon-light');
        
        if (themeIconDark && themeIconLight) {
            if (newTheme === 'light') {
                themeIconDark.style.display = 'none';
                themeIconLight.style.display = 'inline';
            } else {
                themeIconDark.style.display = 'inline';
                themeIconLight.style.display = 'none';
            }
        }
        
        this.showToast(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado`);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        
        const themeIconDark = document.querySelector('.theme-icon-dark');
        const themeIconLight = document.querySelector('.theme-icon-light');
        
        if (themeIconDark && themeIconLight) {
            if (savedTheme === 'light') {
                themeIconDark.style.display = 'none';
                themeIconLight.style.display = 'inline';
            } else {
                themeIconDark.style.display = 'inline';
                themeIconLight.style.display = 'none';
            }
        }
    }
    
    loadLastSection() {
        const lastSection = localStorage.getItem('lastSection') || 'gerador';
        this.navigateTo(lastSection);
    }
    
    checkOnlineStatus() {
        this.isOnline = navigator.onLine;
        if (!this.isOnline) {
            setTimeout(() => {
                this.showToast('📡 Você está offline. Os links ainda funcionam!');
            }, 1000);
        }
    }
    
    updateLinkPreview(url) {
        const previewBox = document.getElementById('link-preview');
        if (previewBox) {
            previewBox.innerHTML = `
                <div class="preview-header">📋 Preview do Link</div>
                <div class="preview-url">${Utils.escapeHtml(url)}</div>
                <div class="preview-params">
                    ${this.extractParams(url).map(param => 
                        `<span class="param-tag">${Utils.escapeHtml(param.key)}: ${Utils.escapeHtml(param.value)}</span>`
                    ).join('')}
                </div>
            `;
        }
    }
    
    extractParams(url) {
        try {
            const urlObj = new URL(url);
            const params = [];
            urlObj.searchParams.forEach((value, key) => {
                params.push({ key, value });
            });
            return params;
        } catch {
            return [];
        }
    }
    
    updateShortenerStats(originalUrl, shortUrl) {
        const originalLength = document.getElementById('original-length');
        const shortLength = document.getElementById('short-length');
        const reductionPercent = document.getElementById('reduction-percent');
        
        if (originalLength && shortLength && reductionPercent) {
            const origLen = originalUrl.length;
            const shortLen = shortUrl.length;
            const reduction = Math.round(((origLen - shortLen) / origLen) * 100);
            
            originalLength.textContent = origLen;
            shortLength.textContent = shortLen;
            reductionPercent.textContent = reduction + '%';
        }
    }
    
    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
    
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    showWelcomeMessage() {
        const hasHistory = HistoryManager.getHistory().length > 0;
        if (!hasHistory) {
            setTimeout(() => {
                this.showToast('👋 Bem-vindo! Comece gerando seu primeiro link.', 'info');
            }, 500);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new UltraLinkGenerator();
        console.log('✅ Ultra Gerador de Links v3.0 iniciado com sucesso');
    } catch (error) {
        console.error('❌ Erro fatal ao iniciar aplicação:', error);
        document.body.innerHTML = `
            <div style="text-align:center;padding:50px;color:white;">
                <h1>⚠️ Erro de Inicialização</h1>
                <p>Não foi possível carregar a aplicação.</p>
                <p>Verifique se todos os arquivos JavaScript estão presentes.</p>
                <button onclick="location.reload()" style="padding:15px;margin-top:20px;">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(() => {
            console.log('✅ Service Worker registrado');
        }).catch((error) => {
            console.log('ℹ️ Service Worker não registrado:', error);
        });
    });
}

window.addEventListener('error', (event) => {
    console.error('Erro global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada não tratada:', event.reason);
});