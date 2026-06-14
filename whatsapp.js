// whatsapp.js - Gerador de Links WhatsApp Completo
// Versão 3.0 - Sistema Profissional de Links WhatsApp

class WhatsAppLinkGenerator {
    constructor() {
        this.countryCodes = [];
        this.defaultCountry = '55';
        this.defaultDDD = '11';
        this.maxMessageLength = 4096;
        this.recentNumbers = [];
        this.maxRecentNumbers = 20;
        this.messageTemplates = [];
        
        this.init();
    }
    
    init() {
        this.loadCountryCodes();
        this.loadRecentNumbers();
        this.loadMessageTemplates();
        this.setupDefaultTemplates();
    }
    
    loadCountryCodes() {
        this.countryCodes = [
            { code: '55', country: 'Brasil', flag: '🇧🇷', mask: '(00) 00000-0000', length: 11 },
            { code: '1', country: 'EUA/Canadá', flag: '🇺🇸', mask: '(000) 000-0000', length: 10 },
            { code: '351', country: 'Portugal', flag: '🇵🇹', mask: '000 000 000', length: 9 },
            { code: '34', country: 'Espanha', flag: '🇪🇸', mask: '000 000 000', length: 9 },
            { code: '54', country: 'Argentina', flag: '🇦🇷', mask: '00 0000-0000', length: 10 },
            { code: '56', country: 'Chile', flag: '🇨🇱', mask: '0 0000 0000', length: 9 },
            { code: '57', country: 'Colômbia', flag: '🇨🇴', mask: '000 000 0000', length: 10 },
            { code: '52', country: 'México', flag: '🇲🇽', mask: '00 0000 0000', length: 10 },
            { code: '44', country: 'Reino Unido', flag: '🇬🇧', mask: '0000 000000', length: 10 },
            { code: '49', country: 'Alemanha', flag: '🇩🇪', mask: '0000 0000000', length: 11 },
            { code: '33', country: 'França', flag: '🇫🇷', mask: '0 00 00 00 00', length: 9 },
            { code: '39', country: 'Itália', flag: '🇮🇹', mask: '000 000 0000', length: 10 },
            { code: '81', country: 'Japão', flag: '🇯🇵', mask: '00-0000-0000', length: 10 },
            { code: '86', country: 'China', flag: '🇨🇳', mask: '000 0000 0000', length: 11 },
            { code: '91', country: 'Índia', flag: '🇮🇳', mask: '00000 00000', length: 10 },
            { code: '7', country: 'Rússia', flag: '🇷🇺', mask: '000 000-00-00', length: 10 },
            { code: '61', country: 'Austrália', flag: '🇦🇺', mask: '0000 000 000', length: 9 },
            { code: '971', country: 'Emirados Árabes', flag: '🇦🇪', mask: '00 000 0000', length: 9 },
            { code: '972', country: 'Israel', flag: '🇮🇱', mask: '000-000-0000', length: 9 },
            { code: '27', country: 'África do Sul', flag: '🇿🇦', mask: '00 000 0000', length: 9 }
        ];
    }
    
    setupDefaultTemplates() {
        if (this.messageTemplates.length === 0) {
            this.messageTemplates = [
                {
                    id: 'template_001',
                    name: 'Saudação Simples',
                    category: 'saudacao',
                    message: 'Olá! Tudo bem? Vi seu contato e gostaria de conversar.',
                    variables: []
                },
                {
                    id: 'template_002',
                    name: 'Orçamento',
                    category: 'negocios',
                    message: 'Olá! Gostaria de solicitar um orçamento para {servico}. Pode me ajudar?',
                    variables: ['servico']
                },
                {
                    id: 'template_003',
                    name: 'Agendamento',
                    category: 'negocios',
                    message: 'Olá! Gostaria de agendar um horário para {data}. Qual disponibilidade?',
                    variables: ['data']
                },
                {
                    id: 'template_004',
                    name: 'Suporte Técnico',
                    category: 'suporte',
                    message: 'Olá! Estou com um problema no {produto}. Pode me ajudar?',
                    variables: ['produto']
                },
                {
                    id: 'template_005',
                    name: 'Confirmação',
                    category: 'negocios',
                    message: 'Olá! Apenas confirmando {assunto} para amanhã. Está tudo certo?',
                    variables: ['assunto']
                },
                {
                    id: 'template_006',
                    name: 'Convite',
                    category: 'social',
                    message: 'Olá {nome}! Gostaria de te convidar para {evento} no dia {data}. Vai ser incrível!',
                    variables: ['nome', 'evento', 'data']
                },
                {
                    id: 'template_007',
                    name: 'Agradecimento',
                    category: 'social',
                    message: 'Olá! Muito obrigado por {motivo}. Foi muito especial!',
                    variables: ['motivo']
                },
                {
                    id: 'template_008',
                    name: 'Promoção',
                    category: 'marketing',
                    message: '🔥 Promoção imperdível! {produto} com {desconto} de desconto. Aproveite: {link}',
                    variables: ['produto', 'desconto', 'link']
                },
                {
                    id: 'template_009',
                    name: 'Lembrete',
                    category: 'utilidades',
                    message: '⏰ Lembrete: {compromisso} em {tempo}. Não se esqueça!',
                    variables: ['compromisso', 'tempo']
                },
                {
                    id: 'template_010',
                    name: 'Feliz Aniversário',
                    category: 'social',
                    message: '🎂 Feliz aniversário, {nome}! Muitas felicidades e realizações! 🎉',
                    variables: ['nome']
                }
            ];
        }
    }
    
    loadRecentNumbers() {
        try {
            var data = localStorage.getItem('whatsapp_recent_numbers');
            if (data) {
                this.recentNumbers = JSON.parse(data);
                if (this.recentNumbers.length > this.maxRecentNumbers) {
                    this.recentNumbers = this.recentNumbers.slice(0, this.maxRecentNumbers);
                }
            }
        } catch (e) {
            this.recentNumbers = [];
        }
    }
    
    saveRecentNumbers() {
        try {
            localStorage.setItem('whatsapp_recent_numbers', JSON.stringify(this.recentNumbers));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this.recentNumbers = this.recentNumbers.slice(0, 10);
                this.saveRecentNumbers();
            }
        }
    }
    
    loadMessageTemplates() {
        try {
            var data = localStorage.getItem('whatsapp_templates');
            if (data) {
                var parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    this.messageTemplates = parsed;
                }
            }
        } catch (e) {
            this.messageTemplates = [];
        }
    }
    
    saveMessageTemplates() {
        try {
            localStorage.setItem('whatsapp_templates', JSON.stringify(this.messageTemplates));
        } catch (e) {}
    }
    
    sanitizePhoneNumber(phone) {
        if (!phone) return '';
        return phone.replace(/[^\d]/g, '');
    }
    
    formatPhoneNumber(phone, countryCode) {
        var sanitized = this.sanitizePhoneNumber(phone);
        
        if (!countryCode) {
            countryCode = this.defaultCountry;
        }
        
        if (sanitized.indexOf(countryCode) === 0) {
            sanitized = sanitized.substring(countryCode.length);
        }
        
        if (sanitized.length > 0 && sanitized[0] === '0') {
            sanitized = sanitized.substring(1);
        }
        
        return sanitized;
    }
    
    validatePhoneNumber(phone, countryCode) {
        var result = {
            isValid: false,
            sanitized: '',
            fullNumber: '',
            errors: [],
            warnings: []
        };
        
        if (!phone || phone.trim().length === 0) {
            result.errors.push('Número de telefone é obrigatório');
            return result;
        }
        
        var sanitized = this.sanitizePhoneNumber(phone);
        
        if (sanitized.length < 8) {
            result.errors.push('Número muito curto');
            return result;
        }
        
        if (sanitized.length > 15) {
            result.errors.push('Número muito longo');
            return result;
        }
        
        if (!countryCode) {
            countryCode = this.defaultCountry;
        }
        
        if (sanitized.indexOf(countryCode) === 0) {
            sanitized = sanitized.substring(countryCode.length);
        }
        
        if (sanitized.length > 0 && sanitized[0] === '0') {
            sanitized = sanitized.substring(1);
        }
        
        var countryInfo = this.getCountryByCode(countryCode);
        
        if (countryInfo && sanitized.length !== countryInfo.length) {
            result.warnings.push('Número de dígitos diferente do esperado para ' + countryInfo.country);
        }
        
        result.sanitized = sanitized;
        result.fullNumber = countryCode + sanitized;
        result.isValid = true;
        
        return result;
    }
    
    getCountryByCode(code) {
        for (var i = 0; i < this.countryCodes.length; i++) {
            if (this.countryCodes[i].code === code) {
                return this.countryCodes[i];
            }
        }
        return null;
    }
    
    encodeMessage(message) {
        if (!message) return '';
        
        var encoded = encodeURIComponent(message);
        
        encoded = encoded
            .replace(/%20/g, '+')
            .replace(/%0A/g, '%0A')
            .replace(/%21/g, '!')
            .replace(/%27/g, "'")
            .replace(/%28/g, '(')
            .replace(/%29/g, ')')
            .replace(/%2C/g, ',')
            .replace(/%2E/g, '.')
            .replace(/%3A/g, ':')
            .replace(/%3B/g, ';')
            .replace(/%3F/g, '?');
        
        return encoded;
    }
    
    generateLink(options) {
        try {
            if (!options) {
                options = {};
            }
            
            var phone = options.phone || '';
            var message = options.message || '';
            var countryCode = options.countryCode || this.defaultCountry;
            
            var validation = this.validatePhoneNumber(phone, countryCode);
            
            if (!validation.isValid) {
                Utils.showToast(validation.errors[0] || 'Número inválido', 'error');
                return null;
            }
            
            var fullNumber = validation.fullNumber;
            var baseUrl = 'https://wa.me/' + fullNumber;
            
            if (message && message.trim().length > 0) {
                if (message.length > this.maxMessageLength) {
                    Utils.showToast('Mensagem muito longa. Máximo ' + this.maxMessageLength + ' caracteres', 'warning');
                    message = message.substring(0, this.maxMessageLength);
                }
                
                var encodedMessage = this.encodeMessage(message.trim());
                baseUrl += '?text=' + encodedMessage;
            }
            
            this.addToRecent({
                phone: validation.sanitized,
                countryCode: countryCode,
                fullNumber: fullNumber,
                message: message,
                timestamp: new Date().toISOString()
            });
            
            HistoryManager.addToHistory({
                type: 'whatsapp',
                original: 'Tel: ' + fullNumber,
                generated: baseUrl,
                phone: fullNumber,
                message: message,
                timestamp: new Date().toISOString()
            });
            
            return baseUrl;
            
        } catch (error) {
            Utils.showToast('Erro ao gerar link: ' + error.message, 'error');
            return null;
        }
    }
    
    generateQuickLink(phone) {
        return this.generateLink({
            phone: phone,
            message: '',
            countryCode: this.defaultCountry
        });
    }
    
    generateMessageLink(phone, message) {
        return this.generateLink({
            phone: phone,
            message: message,
            countryCode: this.defaultCountry
        });
    }
    
    generateInternationalLink(phone, countryCode, message) {
        return this.generateLink({
            phone: phone,
            countryCode: countryCode,
            message: message || ''
        });
    }
    
    addToRecent(entry) {
        var exists = false;
        
        for (var i = 0; i < this.recentNumbers.length; i++) {
            if (this.recentNumbers[i].fullNumber === entry.fullNumber) {
                this.recentNumbers[i].timestamp = entry.timestamp;
                this.recentNumbers[i].message = entry.message;
                this.recentNumbers[i].count = (this.recentNumbers[i].count || 1) + 1;
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            entry.count = 1;
            this.recentNumbers.unshift(entry);
        }
        
        if (this.recentNumbers.length > this.maxRecentNumbers) {
            this.recentNumbers = this.recentNumbers.slice(0, this.maxRecentNumbers);
        }
        
        this.saveRecentNumbers();
    }
    
    getRecentNumbers(limit) {
        if (!limit) {
            limit = 10;
        }
        
        return this.recentNumbers.slice(0, limit);
    }
    
    clearRecentNumbers() {
        this.recentNumbers = [];
        this.saveRecentNumbers();
        Utils.showToast('Histórico de números limpo');
    }
    
    applyTemplate(templateId, variables) {
        var template = null;
        
        for (var i = 0; i < this.messageTemplates.length; i++) {
            if (this.messageTemplates[i].id === templateId) {
                template = this.messageTemplates[i];
                break;
            }
        }
        
        if (!template) {
            return '';
        }
        
        var message = template.message;
        
        if (template.variables && template.variables.length > 0) {
            for (var j = 0; j < template.variables.length; j++) {
                var varName = template.variables[j];
                var varValue = '';
                
                if (variables && variables[varName]) {
                    varValue = variables[varName];
                }
                
                message = message.replace('{' + varName + '}', varValue);
            }
        }
        
        return message;
    }
    
    getTemplates(category) {
        if (!category) {
            return this.messageTemplates;
        }
        
        return this.messageTemplates.filter(function(template) {
            return template.category === category;
        });
    }
    
    getTemplateCategories() {
        var categories = {};
        
        for (var i = 0; i < this.messageTemplates.length; i++) {
            var cat = this.messageTemplates[i].category;
            if (!categories[cat]) {
                categories[cat] = {
                    name: cat,
                    count: 0,
                    icon: this.getCategoryIcon(cat)
                };
            }
            categories[cat].count++;
        }
        
        var result = [];
        for (var key in categories) {
            result.push(categories[key]);
        }
        
        return result;
    }
    
    getCategoryIcon(category) {
        var icons = {
            'saudacao': '👋',
            'negocios': '💼',
            'suporte': '🔧',
            'social': '🎉',
            'marketing': '📢',
            'utilidades': '🛠️'
        };
        
        return icons[category] || '💬';
    }
    
    addCustomTemplate(name, category, message, variables) {
        var template = {
            id: 'custom_' + Utils.generateShortId(),
            name: name,
            category: category || 'personalizado',
            message: message,
            variables: variables || [],
            isCustom: true,
            createdAt: new Date().toISOString()
        };
        
        this.messageTemplates.push(template);
        this.saveMessageTemplates();
        
        Utils.showToast('Template criado com sucesso');
        return template;
    }
    
    deleteTemplate(templateId) {
        var index = -1;
        
        for (var i = 0; i < this.messageTemplates.length; i++) {
            if (this.messageTemplates[i].id === templateId) {
                index = i;
                break;
            }
        }
        
        if (index > -1) {
            this.messageTemplates.splice(index, 1);
            this.saveMessageTemplates();
            Utils.showToast('Template removido');
            return true;
        }
        
        return false;
    }
    
    getWhatsAppWebLink(phone, message) {
        var options = {
            phone: phone,
            message: message || '',
            countryCode: this.defaultCountry
        };
        
        var link = this.generateLink(options);
        
        if (link) {
            link = link.replace('https://wa.me/', 'https://web.whatsapp.com/send?phone=');
        }
        
        return link;
    }
    
    getWhatsAppAPILink(phone, message) {
        var options = {
            phone: phone,
            message: message || '',
            countryCode: this.defaultCountry
        };
        
        var link = this.generateLink(options);
        
        if (link) {
            link = link.replace('https://wa.me/', 'https://api.whatsapp.com/send?phone=');
        }
        
        return link;
    }
    
    getCountryCodes() {
        return this.countryCodes;
    }
    
    getDefaultCountry() {
        var self = this;
        var found = this.countryCodes.find(function(c) {
            return c.code === self.defaultCountry;
        });
        
        return found || this.countryCodes[0];
    }
    
    setDefaultCountry(code) {
        this.defaultCountry = code;
        localStorage.setItem('whatsapp_default_country', code);
    }
    
    loadDefaultCountry() {
        var saved = localStorage.getItem('whatsapp_default_country');
        if (saved) {
            this.defaultCountry = saved;
        }
    }
    
    getStats() {
        var today = new Date().toISOString().split('T')[0];
        var todayCount = 0;
        var totalLinks = 0;
        
        for (var i = 0; i < this.recentNumbers.length; i++) {
            totalLinks += (this.recentNumbers[i].count || 1);
            if (this.recentNumbers[i].timestamp.indexOf(today) === 0) {
                todayCount++;
            }
        }
        
        return {
            totalLinks: totalLinks,
            uniqueNumbers: this.recentNumbers.length,
            todayLinks: todayCount,
            templates: this.messageTemplates.length,
            mostUsed: this.recentNumbers.length > 0 ? this.recentNumbers[0] : null
        };
    }
    
    renderWhatsAppInterface(containerId) {
        var container = document.getElementById(containerId || 'whatsapp-container');
        
        if (!container) {
            console.warn('Container WhatsApp não encontrado');
            return;
        }
        
        var self = this;
        var countries = this.countryCodes;
        var recentNumbers = this.getRecentNumbers(5);
        
        var html = '' +
            '<div class="whatsapp-section">' +
                '<div class="section-header">' +
                    '<h2>💬 Gerador de Link WhatsApp</h2>' +
                    '<p>Crie links diretos para conversas no WhatsApp</p>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>🌍 País</label>' +
                    '<select id="whatsapp-country" class="country-select">';
        
        for (var i = 0; i < countries.length; i++) {
            var selected = countries[i].code === self.defaultCountry ? ' selected' : '';
            html += '<option value="' + countries[i].code + '"' + selected + '>' +
                countries[i].flag + ' ' + countries[i].country + ' (+' + countries[i].code + ')' +
                '</option>';
        }
        
        html += '' +
                    '</select>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>📱 Número de Telefone</label>' +
                    '<input type="tel" id="whatsapp-phone" placeholder="(11) 99999-9999" autocomplete="off">' +
                    '<span class="input-help" id="whatsapp-mask-info"></span>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>💬 Mensagem (opcional)</label>' +
                    '<textarea id="whatsapp-message" rows="4" placeholder="Digite sua mensagem... (máx. 4096 caracteres)" maxlength="4096"></textarea>' +
                    '<div class="message-counter">' +
                        '<span id="whatsapp-char-count">0</span>/' + this.maxMessageLength + ' caracteres' +
                    '</div>' +
                '</div>';
        
        if (recentNumbers.length > 0) {
            html += '' +
                '<div class="recent-numbers">' +
                    '<label>📞 Números Recentes</label>' +
                    '<div class="recent-list">';
            
            for (var j = 0; j < recentNumbers.length; j++) {
                var recent = recentNumbers[j];
                html += '' +
                    '<div class="recent-item" data-phone="' + recent.phone + '" data-code="' + recent.countryCode + '">' +
                        '<span class="recent-flag">' + (self.getCountryByCode(recent.countryCode) ? self.getCountryByCode(recent.countryCode).flag : '📱') + '</span>' +
                        '<span class="recent-phone">+' + recent.countryCode + ' ' + recent.phone + '</span>' +
                        '<span class="recent-count">' + (recent.count > 1 ? recent.count + 'x' : '') + '</span>' +
                    '</div>';
            }
            
            html += '' +
                    '</div>' +
                '</div>';
        }
        
        html += '' +
                '<div class="template-section">' +
                    '<label>📝 Templates de Mensagem</label>' +
                    '<div class="template-list" id="whatsapp-templates">';
        
        var templates = this.getTemplates();
        
        for (var k = 0; k < templates.length; k++) {
            var tpl = templates[k];
            html += '' +
                '<div class="template-item" data-template-id="' + tpl.id + '">' +
                    '<span class="template-icon">' + self.getCategoryIcon(tpl.category) + '</span>' +
                    '<span class="template-name">' + tpl.name + '</span>' +
                '</div>';
        }
        
        html += '' +
                    '</div>' +
                '</div>' +
                '<div class="whatsapp-actions">' +
                    '<button id="whatsapp-generate" class="btn-primary">' +
                        '<span>💬</span> Gerar Link WhatsApp' +
                    '</button>' +
                    '<button id="whatsapp-copy" class="btn-secondary" style="display:none;">' +
                        '<span>📋</span> Copiar Link' +
                    '</button>' +
                    '<button id="whatsapp-open" class="btn-success" style="display:none;">' +
                        '<span>🚀</span> Abrir Conversa' +
                    '</button>' +
                '</div>' +
                '<div id="whatsapp-result" style="display:none;">' +
                    '<div class="form-group">' +
                        '<label>✅ Link Gerado</label>' +
                        '<div class="input-with-button">' +
                            '<input type="text" id="whatsapp-link" readonly>' +
                            '<button id="whatsapp-copy-result" class="btn-copy">📋</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="qr-preview" id="whatsapp-qr-preview"></div>' +
                '</div>' +
            '</div>';
        
        container.innerHTML = html;
        
        this.attachWhatsAppEventListeners(container);
    }
    
    attachWhatsAppEventListeners(container) {
        var self = this;
        
        var countrySelect = document.getElementById('whatsapp-country');
        var phoneInput = document.getElementById('whatsapp-phone');
        var messageInput = document.getElementById('whatsapp-message');
        var generateBtn = document.getElementById('whatsapp-generate');
        var charCount = document.getElementById('whatsapp-char-count');
        var maskInfo = document.getElementById('whatsapp-mask-info');
        
        if (countrySelect) {
            countrySelect.addEventListener('change', function() {
                self.defaultCountry = this.value;
                self.updatePhoneMask(this.value);
                
                if (phoneInput) {
                    phoneInput.value = '';
                }
            });
            
            self.updatePhoneMask(countrySelect.value);
        }
        
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                var formatted = self.formatPhoneForDisplay(this.value, self.defaultCountry);
                this.value = formatted;
            });
            
            phoneInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (generateBtn) {
                        generateBtn.click();
                    }
                }
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', function() {
                var count = this.value.length;
                if (charCount) {
                    charCount.textContent = count;
                }
                
                if (count > self.maxMessageLength * 0.9) {
                    charCount.style.color = '#FF6584';
                } else if (count > self.maxMessageLength * 0.7) {
                    charCount.style.color = '#FFB800';
                } else {
                    charCount.style.color = '';
                }
            });
        }
        
        if (generateBtn) {
            generateBtn.addEventListener('click', function() {
                var phone = phoneInput ? phoneInput.value : '';
                var message = messageInput ? messageInput.value : '';
                var countryCode = countrySelect ? countrySelect.value : self.defaultCountry;
                
                var link = self.generateLink({
                    phone: phone,
                    message: message,
                    countryCode: countryCode
                });
                
                if (link) {
                    var resultDiv = document.getElementById('whatsapp-result');
                    var linkInput = document.getElementById('whatsapp-link');
                    var copyBtn = document.getElementById('whatsapp-copy');
                    var openBtn = document.getElementById('whatsapp-open');
                    
                    if (resultDiv) resultDiv.style.display = 'block';
                    if (linkInput) linkInput.value = link;
                    if (copyBtn) copyBtn.style.display = 'inline-flex';
                    if (openBtn) openBtn.style.display = 'inline-flex';
                    
                    if (resultDiv) {
                        resultDiv.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }
        
        var copyBtn = document.getElementById('whatsapp-copy');
        var copyResultBtn = document.getElementById('whatsapp-copy-result');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                var linkInput = document.getElementById('whatsapp-link');
                if (linkInput && linkInput.value) {
                    ClipboardManager.copyToClipboard(linkInput.value);
                }
            });
        }
        
        if (copyResultBtn) {
            copyResultBtn.addEventListener('click', function() {
                var linkInput = document.getElementById('whatsapp-link');
                if (linkInput && linkInput.value) {
                    ClipboardManager.copyToClipboard(linkInput.value);
                }
            });
        }
        
        var openBtn = document.getElementById('whatsapp-open');
        if (openBtn) {
            openBtn.addEventListener('click', function() {
                var linkInput = document.getElementById('whatsapp-link');
                if (linkInput && linkInput.value) {
                    window.open(linkInput.value, '_blank');
                }
            });
        }
        
        var recentItems = container.querySelectorAll('.recent-item');
        for (var i = 0; i < recentItems.length; i++) {
            (function(item) {
                item.addEventListener('click', function() {
                    var phone = this.getAttribute('data-phone');
                    var code = this.getAttribute('data-code');
                    
                    if (phoneInput) phoneInput.value = phone;
                    if (countrySelect) countrySelect.value = code;
                    if (messageInput) messageInput.focus();
                });
            })(recentItems[i]);
        }
        
        var templateItems = container.querySelectorAll('.template-item');
        for (var j = 0; j < templateItems.length; j++) {
            (function(item) {
                item.addEventListener('click', function() {
                    var templateId = this.getAttribute('data-template-id');
                    var template = null;
                    
                    for (var k = 0; k < self.messageTemplates.length; k++) {
                        if (self.messageTemplates[k].id === templateId) {
                            template = self.messageTemplates[k];
                            break;
                        }
                    }
                    
                    if (template && messageInput) {
                        if (template.variables && template.variables.length > 0) {
                            var variables = {};
                            
                            for (var l = 0; l < template.variables.length; l++) {
                                var varName = template.variables[l];
                                var varValue = prompt('Digite o valor para "' + varName + '":');
                                
                                if (varValue === null) {
                                    return;
                                }
                                
                                variables[varName] = varValue || '{' + varName + '}';
                            }
                            
                            messageInput.value = self.applyTemplate(templateId, variables);
                        } else {
                            messageInput.value = template.message;
                        }
                        
                        messageInput.dispatchEvent(new Event('input'));
                        Utils.showToast('Template "' + template.name + '" aplicado');
                    }
                });
            })(templateItems[j]);
        }
    }
    
    updatePhoneMask(countryCode) {
        var country = this.getCountryByCode(countryCode);
        var maskInfo = document.getElementById('whatsapp-mask-info');
        
        if (maskInfo && country) {
            maskInfo.textContent = 'Formato: ' + country.mask + ' (' + country.length + ' dígitos)';
        }
    }
    
    formatPhoneForDisplay(phone, countryCode) {
        var sanitized = this.sanitizePhoneNumber(phone);
        
        if (!countryCode) {
            countryCode = this.defaultCountry;
        }
        
        if (sanitized.indexOf(countryCode) === 0) {
            sanitized = sanitized.substring(countryCode.length);
        }
        
        if (sanitized.length > 0 && sanitized[0] === '0') {
            sanitized = sanitized.substring(1);
        }
        
        var country = this.getCountryByCode(countryCode);
        
        if (!country) {
            return sanitized;
        }
        
        if (country.code === '55') {
            if (sanitized.length > 2) {
                sanitized = '(' + sanitized.substring(0, 2) + ') ' + sanitized.substring(2);
            }
            if (sanitized.length > 10) {
                sanitized = sanitized.substring(0, 10) + '-' + sanitized.substring(10, 14);
            }
        }
        
        return sanitized;
    }
    
    exportLinks(format) {
        if (!format) {
            format = 'json';
        }
        
        var data = {
            generatedAt: new Date().toISOString(),
            recentNumbers: this.recentNumbers,
            templates: this.messageTemplates,
            stats: this.getStats()
        };
        
        switch (format) {
            case 'json':
                Utils.downloadFile(
                    JSON.stringify(data, null, 2),
                    'whatsapp-links-' + new Date().toISOString().split('T')[0] + '.json',
                    'application/json'
                );
                break;
            case 'csv':
                var csvContent = 'Telefone,País,Mensagem,Data,Contagem\n';
                
                for (var i = 0; i < this.recentNumbers.length; i++) {
                    var item = this.recentNumbers[i];
                    var country = this.getCountryByCode(item.countryCode);
                    csvContent += '"' + item.fullNumber + '",' +
                        '"' + (country ? country.country : '') + '",' +
                        '"' + (item.message || '').replace(/"/g, '""') + '",' +
                        '"' + item.timestamp + '",' +
                        '"' + (item.count || 1) + '"\n';
                }
                
                Utils.downloadFile(
                    csvContent,
                    'whatsapp-links-' + new Date().toISOString().split('T')[0] + '.csv',
                    'text/csv'
                );
                break;
        }
        
        Utils.showToast('Links exportados com sucesso');
    }
}

// Inicialização
if (typeof window !== 'undefined') {
    window.whatsAppGenerator = new WhatsAppLinkGenerator();
    
    document.addEventListener('DOMContentLoaded', function() {
        window.whatsAppGenerator.loadDefaultCountry();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WhatsAppLinkGenerator;
}