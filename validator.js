// validator.js - Sistema de Validação Completo
// Versão 3.0 - Validador Profissional para Links e Dados

class Validator {
    // Constantes de validação
    static PATTERNS = {
        URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        URL_STRICT: /^https?:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        PHONE: /^\+?[\d\s\(\)\-]{8,20}$/,
        DOMAIN: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/,
        IPV4: /^(\d{1,3}\.){3}\d{1,3}$/,
        IPV6: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
        SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
        PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        HEX_COLOR: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
        BASE64: /^[A-Za-z0-9+/=]+$/,
        JSON: /^[\],:{}\s]*$/,
        ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
        ALPHA: /^[a-zA-Z]+$/,
        NUMERIC: /^\d+$/,
        DECIMAL: /^\d+\.?\d*$/,
        DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
        TIME_24H: /^([01]\d|2[0-3]):([0-5]\d)$/,
        CREDIT_CARD: /^\d{13,19}$/,
        ZIP_CODE: /^\d{5}-?\d{3}$/,
        MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
        LATITUDE: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
        LONGITUDE: /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
    };

    static MESSAGES = {
        REQUIRED: 'Este campo é obrigatório',
        INVALID_URL: 'URL inválida. Use o formato: https://exemplo.com',
        INVALID_EMAIL: 'Email inválido',
        INVALID_PHONE: 'Telefone inválido',
        INVALID_DOMAIN: 'Domínio inválido',
        INVALID_IP: 'Endereço IP inválido',
        INVALID_SLUG: 'Slug inválido. Use apenas letras minúsculas e hífens',
        INVALID_USERNAME: 'Nome de usuário inválido (3-20 caracteres, letras, números, _ e -)',
        WEAK_PASSWORD: 'Senha fraca. Mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial',
        INVALID_COLOR: 'Cor hexadecimal inválida',
        INVALID_BASE64: 'String Base64 inválida',
        INVALID_JSON: 'JSON inválido',
        NOT_ALPHANUMERIC: 'Apenas letras e números permitidos',
        NOT_ALPHA: 'Apenas letras permitidas',
        NOT_NUMERIC: 'Apenas números permitidos',
        NOT_DECIMAL: 'Número decimal inválido',
        INVALID_DATE: 'Data inválida. Use o formato: YYYY-MM-DD',
        INVALID_TIME: 'Hora inválida. Use o formato: HH:MM (24h)',
        INVALID_CREDIT_CARD: 'Número de cartão de crédito inválido',
        INVALID_ZIP: 'CEP inválido',
        INVALID_MAC: 'Endereço MAC inválido',
        INVALID_LATITUDE: 'Latitude inválida (-90 a 90)',
        INVALID_LONGITUDE: 'Longitude inválida (-180 a 180)',
        MIN_LENGTH: (min) => `Mínimo de ${min} caracteres`,
        MAX_LENGTH: (max) => `Máximo de ${max} caracteres`,
        MIN_VALUE: (min) => `Valor mínimo: ${min}`,
        MAX_VALUE: (max) => `Valor máximo: ${max}`,
        EXACT_LENGTH: (len) => `Deve ter exatamente ${len} caracteres`,
        BETWEEN_LENGTH: (min, max) => `Deve ter entre ${min} e ${max} caracteres`,
        NOT_EQUAL: 'Os valores não conferem',
        ALREADY_EXISTS: 'Este valor já existe',
        INVALID_FORMAT: 'Formato inválido'
    };

    // Validação principal de URL
    static isValidUrl(url, strict = false) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            const urlObj = new URL(url.trim());
            
            if (strict) {
                return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') 
                    && urlObj.hostname.includes('.');
            }
            
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
            
        } catch {
            if (!strict) {
                return this.PATTERNS.URL.test(url.trim());
            }
            return false;
        }
    }

    // Validação detalhada de URL
    static validateUrlDetailed(url) {
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            details: {}
        };

        if (!url || typeof url !== 'string') {
            result.errors.push('URL não fornecida');
            return result;
        }

        const trimmedUrl = url.trim();

        if (trimmedUrl.length === 0) {
            result.errors.push('URL está vazia');
            return result;
        }

        if (trimmedUrl.length > 2048) {
            result.errors.push('URL muito longa (máximo 2048 caracteres)');
        }

        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
            result.warnings.push('URL não começa com http:// ou https://');
        }

        if (trimmedUrl.includes(' ')) {
            result.errors.push('URL contém espaços');
        }

        try {
            const urlObj = new URL(trimmedUrl);
            
            result.details = {
                protocol: urlObj.protocol,
                hostname: urlObj.hostname,
                port: urlObj.port,
                pathname: urlObj.pathname,
                search: urlObj.search,
                hash: urlObj.hash
            };

            if (!urlObj.hostname.includes('.')) {
                result.errors.push('Hostname inválido');
            }

            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                result.errors.push('Protocolo não suportado');
            }

            const suspiciousChars = /[<>{}|\\^~\[\]`]/;
            if (suspiciousChars.test(trimmedUrl)) {
                result.warnings.push('URL contém caracteres suspeitos');
            }

            result.isValid = result.errors.length === 0;

        } catch {
            result.errors.push('Formato de URL inválido');
        }

        return result;
    }

    // Validação de alias para encurtador
    static isValidAlias(alias) {
        if (!alias || typeof alias !== 'string') return false;
        
        const trimmed = alias.trim();
        
        if (trimmed.length < 3) {
            return false;
        }
        
        if (trimmed.length > 30) {
            return false;
        }
        
        if (!/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
            return false;
        }
        
        if (trimmed.startsWith('-') || trimmed.startsWith('_') || 
            trimmed.endsWith('-') || trimmed.endsWith('_')) {
            return false;
        }
        
        const reserved = [
            'admin', 'api', 'login', 'logout', 'register', 'dashboard',
            'settings', 'profile', 'home', 'about', 'contact', 'help',
            'terms', 'privacy', 'security', 'root', 'null', 'undefined'
        ];
        
        return !reserved.includes(trimmed.toLowerCase());
    }

    // Validação de parâmetro UTM
    static isValidUtmParam(param) {
        if (!param || typeof param !== 'string') return false;
        
        const validUtmParams = [
            'utm_source', 'utm_medium', 'utm_campaign', 
            'utm_term', 'utm_content', 'utm_id'
        ];
        
        return validUtmParams.includes(param.toLowerCase());
    }

    // Validação de campo obrigatório
    static validateRequired(value, fieldName = 'Campo') {
        const result = {
            isValid: true,
            error: null
        };

        if (value === null || value === undefined) {
            result.isValid = false;
            result.error = `${fieldName} é obrigatório`;
            return result;
        }

        if (typeof value === 'string' && value.trim().length === 0) {
            result.isValid = false;
            result.error = `${fieldName} não pode estar vazio`;
            return result;
        }

        return result;
    }

    // Validação de comprimento
    static validateLength(value, min = null, max = null, fieldName = 'Campo') {
        const result = {
            isValid: true,
            error: null
        };

        if (!value) return result;

        const length = typeof value === 'string' ? value.length : value.toString().length;

        if (min !== null && length < min) {
            result.isValid = false;
            result.error = this.MESSAGES.MIN_LENGTH(min);
            return result;
        }

        if (max !== null && length > max) {
            result.isValid = false;
            result.error = this.MESSAGES.MAX_LENGTH(max);
            return result;
        }

        return result;
    }

    // Validação de range numérico
    static validateRange(value, min = null, max = null, fieldName = 'Valor') {
        const result = {
            isValid: true,
            error: null
        };

        const num = Number(value);

        if (isNaN(num)) {
            result.isValid = false;
            result.error = `${fieldName} deve ser um número`;
            return result;
        }

        if (min !== null && num < min) {
            result.isValid = false;
            result.error = this.MESSAGES.MIN_VALUE(min);
            return result;
        }

        if (max !== null && num > max) {
            result.isValid = false;
            result.error = this.MESSAGES.MAX_VALUE(max);
            return result;
        }

        return result;
    }

    // Validação de email
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        return this.PATTERNS.EMAIL.test(email.trim());
    }

    // Validação de email detalhada
    static validateEmail(email) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!email || typeof email !== 'string') {
            result.errors.push('Email não fornecido');
            result.isValid = false;
            return result;
        }

        const trimmed = email.trim();

        if (trimmed.length === 0) {
            result.errors.push('Email vazio');
            result.isValid = false;
            return result;
        }

        if (trimmed.length > 254) {
            result.errors.push('Email muito longo');
            result.isValid = false;
        }

        if (!this.PATTERNS.EMAIL.test(trimmed)) {
            result.errors.push('Formato de email inválido');
            result.isValid = false;
        }

        if (trimmed.includes('..')) {
            result.errors.push('Email contém pontos consecutivos');
            result.isValid = false;
        }

        const [localPart, domain] = trimmed.split('@');
        
        if (localPart && localPart.length > 64) {
            result.errors.push('Parte local do email muito longa');
            result.isValid = false;
        }

        if (domain && !domain.includes('.')) {
            result.errors.push('Domínio inválido');
            result.isValid = false;
        }

        const commonDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
        if (domain && commonDomains.includes(domain.toLowerCase())) {
            if (localPart && localPart.includes('+')) {
                result.warnings.push('Emails do Gmail ignoram tudo após o +');
            }
        }

        return result;
    }

    // Sanitização de input
    static sanitizeInput(input, type = 'text') {
        if (!input) return '';

        let sanitized = input.trim();

        switch (type) {
            case 'url':
                sanitized = sanitized.replace(/[<>"']/g, '');
                break;
            case 'email':
                sanitized = sanitized.replace(/[<>()\[\]\\,;:\s]/g, '');
                break;
            case 'text':
                sanitized = sanitized.replace(/[<>]/g, '');
                break;
            case 'alphanumeric':
                sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, '');
                break;
            case 'numeric':
                sanitized = sanitized.replace(/[^\d.-]/g, '');
                break;
            case 'alpha':
                sanitized = sanitized.replace(/[^a-zA-Z]/g, '');
                break;
            case 'slug':
                sanitized = sanitized
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                break;
            default:
                sanitized = sanitized.replace(/[<>]/g, '');
        }

        return sanitized;
    }

    // Validação de força de senha
    static validatePasswordStrength(password) {
        const result = {
            isValid: false,
            strength: 0,
            score: 0,
            feedback: []
        };

        if (!password || password.length < 8) {
            result.feedback.push('Mínimo de 8 caracteres');
            return result;
        }

        if (password.length >= 12) result.score++;
        if (password.length >= 16) result.score++;

        if (/[a-z]/.test(password)) result.score++;
        if (/[A-Z]/.test(password)) result.score++;
        if (/\d/.test(password)) result.score++;
        if (/[@$!%*?&]/.test(password)) result.score++;
        if (/[^a-zA-Z\d@$!%*?&]/.test(password)) result.score++;

        if (/(.)\1{2,}/.test(password)) {
            result.feedback.push('Evite caracteres repetidos');
            result.score--;
        }

        if (/^[a-zA-Z]+$/.test(password)) {
            result.feedback.push('Adicione números e símbolos');
        }

        result.strength = Math.min(result.score, 5);
        result.isValid = result.strength >= 3;

        switch (result.strength) {
            case 0:
            case 1:
                result.level = 'Muito Fraca';
                break;
            case 2:
                result.level = 'Fraca';
                break;
            case 3:
                result.level = 'Média';
                break;
            case 4:
                result.level = 'Forte';
                break;
            case 5:
                result.level = 'Muito Forte';
                break;
        }

        return result;
    }

    // Validação de formulário completo
    static validateForm(rules, data) {
        const result = {
            isValid: true,
            errors: {}
        };

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            const fieldErrors = [];

            if (fieldRules.required) {
                const requiredCheck = this.validateRequired(value, fieldRules.label || field);
                if (!requiredCheck.isValid) {
                    fieldErrors.push(requiredCheck.error);
                }
            }

            if (value && fieldRules.minLength) {
                const lengthCheck = this.validateLength(value, fieldRules.minLength, null, fieldRules.label || field);
                if (!lengthCheck.isValid) {
                    fieldErrors.push(lengthCheck.error);
                }
            }

            if (value && fieldRules.maxLength) {
                const lengthCheck = this.validateLength(value, null, fieldRules.maxLength, fieldRules.label || field);
                if (!lengthCheck.isValid) {
                    fieldErrors.push(lengthCheck.error);
                }
            }

            if (value && fieldRules.pattern) {
                if (!fieldRules.pattern.test(value)) {
                    fieldErrors.push(fieldRules.patternMessage || this.MESSAGES.INVALID_FORMAT);
                }
            }

            if (value && fieldRules.custom) {
                const customCheck = fieldRules.custom(value);
                if (!customCheck.isValid) {
                    fieldErrors.push(customCheck.error);
                }
            }

            if (fieldErrors.length > 0) {
                result.errors[field] = fieldErrors;
                result.isValid = false;
            }
        }

        return result;
    }

    // Validação de igualdade
    static validateMatch(value1, value2, fieldName1 = 'Campo 1', fieldName2 = 'Campo 2') {
        const result = {
            isValid: true,
            error: null
        };

        if (value1 !== value2) {
            result.isValid = false;
            result.error = `${fieldName1} e ${fieldName2} não conferem`;
        }

        return result;
    }

    // Validação de unicidade
    static validateUnique(value, existingValues, fieldName = 'Valor') {
        const result = {
            isValid: true,
            error: null
        };

        if (existingValues.includes(value)) {
            result.isValid = false;
            result.error = this.MESSAGES.ALREADY_EXISTS;
        }

        return result;
    }

    // Validação de nome de domínio
    static isValidDomain(domain) {
        if (!domain || typeof domain !== 'string') return false;
        
        if (domain.length > 253) return false;
        
        return this.PATTERNS.DOMAIN.test(domain.toLowerCase());
    }

    // Validação de IP
    static isValidIP(ip) {
        if (!ip || typeof ip !== 'string') return false;
        
        if (this.PATTERNS.IPV4.test(ip)) {
            const parts = ip.split('.');
            return parts.every(part => {
                const num = parseInt(part, 10);
                return num >= 0 && num <= 255;
            });
        }
        
        return this.PATTERNS.IPV6.test(ip);
    }

    // Validação de data
    static isValidDate(date) {
        if (!date || !this.PATTERNS.DATE_ISO.test(date)) return false;
        
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        
        return dateObj.getFullYear() === year && 
               dateObj.getMonth() === month - 1 && 
               dateObj.getDate() === day;
    }

    // Valida todos os inputs de um container
    static validateContainer(containerElement) {
        const inputs = containerElement.querySelectorAll('input[required], input[data-validate]');
        const results = {
            isValid: true,
            errors: []
        };

        inputs.forEach(input => {
            const value = input.value;
            
            if (input.required && !value.trim()) {
                results.errors.push({
                    element: input,
                    message: this.MESSAGES.REQUIRED
                });
                results.isValid = false;
            }

            if (input.type === 'url' && value) {
                if (!this.isValidUrl(value)) {
                    results.errors.push({
                        element: input,
                        message: this.MESSAGES.INVALID_URL
                    });
                    results.isValid = false;
                }
            }

            if (input.type === 'email' && value) {
                if (!this.isValidEmail(value)) {
                    results.errors.push({
                        element: input,
                        message: this.MESSAGES.INVALID_EMAIL
                    });
                    results.isValid = false;
                }
            }
        });

        return results;
    }

    // Limpar erros de validação
    static clearErrors(containerElement) {
        const errorElements = containerElement.querySelectorAll('.validation-error');
        errorElements.forEach(el => el.remove());

        const invalidInputs = containerElement.querySelectorAll('.invalid');
        invalidInputs.forEach(input => input.classList.remove('invalid'));
    }

    // Mostrar erro de validação
    static showFieldError(inputElement, message) {
        this.clearFieldError(inputElement);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.textContent = message;
        
        inputElement.classList.add('invalid');
        inputElement.parentNode.appendChild(errorDiv);
    }

    // Limpar erro de campo
    static clearFieldError(inputElement) {
        inputElement.classList.remove('invalid');
        
        const errorDiv = inputElement.parentNode.querySelector('.validation-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validator;
}