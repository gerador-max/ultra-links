// generator.js - Gerador de Links com Parâmetros
// Versão 3.0 - Sistema Completo de Geração de URLs

class LinkGenerator {
    constructor() {
        this.paramCount = 0;
        this.maxParams = 20;
        this.commonParams = [
            { name: 'utm_source', placeholder: 'facebook, google, newsletter...' },
            { name: 'utm_medium', placeholder: 'social, email, cpc...' },
            { name: 'utm_campaign', placeholder: 'promo_verao, lancamento...' },
            { name: 'utm_term', placeholder: 'palavras-chave' },
            { name: 'utm_content', placeholder: 'banner, texto, video...' },
            { name: 'ref', placeholder: 'codigo_referencia' },
            { name: 'affiliate_id', placeholder: 'seu_id_afiliado' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupAutoComplete();
        this.setupRealTimePreview();
        this.addInitialParams();
    }
    
    addInitialParams() {
        this.addParamRow(false);
        this.addParamRow(false);
    }
    
    setupAutoComplete() {
        var self = this;
        var paramNameInput = document.getElementById('param-name');
        
        if (paramNameInput) {
            paramNameInput.addEventListener('input', function(e) {
                self.showSuggestions(e.target);
            });
            
            paramNameInput.addEventListener('blur', function() {
                setTimeout(function() {
                    var datalist = document.getElementById('param-suggestions');
                    if (datalist) {
                        datalist.remove();
                    }
                }, 200);
            });
        }
    }
    
    showSuggestions(input) {
        var datalist = document.getElementById('param-suggestions');
        
        if (!datalist) {
            datalist = document.createElement('div');
            datalist.id = 'param-suggestions';
            datalist.className = 'suggestions-dropdown';
            input.parentNode.appendChild(datalist);
        }
        
        var value = input.value.toLowerCase();
        var self = this;
        
        var suggestions = this.commonParams.filter(function(param) {
            return param.name.toLowerCase().indexOf(value) !== -1;
        });
        
        if (suggestions.length === 0 || value.length === 0) {
            datalist.style.display = 'none';
            return;
        }
        
        datalist.style.display = 'block';
        
        datalist.innerHTML = suggestions.map(function(param) {
            return '<div class="suggestion-item" data-value="' + param.name + '">' +
                '<strong>' + param.name + '</strong>' +
                '<small>' + param.placeholder + '</small>' +
                '</div>';
        }).join('');
        
        var items = datalist.querySelectorAll('.suggestion-item');
        
        items.forEach(function(item) {
            item.addEventListener('click', function() {
                input.value = this.getAttribute('data-value');
                datalist.style.display = 'none';
                
                var valueInput = document.getElementById('param-value');
                var found = self.commonParams.find(function(p) {
                    return p.name === input.value;
                });
                
                if (found && valueInput) {
                    valueInput.placeholder = found.placeholder;
                    valueInput.focus();
                }
            });
        });
    }
    
    setupRealTimePreview() {
        var self = this;
        
        var baseUrlInput = document.getElementById('base-url');
        var paramNameInput = document.getElementById('param-name');
        var paramValueInput = document.getElementById('param-value');
        
        if (baseUrlInput) {
            baseUrlInput.addEventListener('input', function() {
                self.updateRealTimePreview();
            });
        }
        
        if (paramNameInput) {
            paramNameInput.addEventListener('input', function() {
                self.updateRealTimePreview();
            });
        }
        
        if (paramValueInput) {
            paramValueInput.addEventListener('input', function() {
                self.updateRealTimePreview();
            });
        }
        
        var paramsContainer = document.getElementById('params-container');
        if (paramsContainer) {
            paramsContainer.addEventListener('input', function() {
                self.updateRealTimePreview();
            });
        }
    }
    
    updateRealTimePreview() {
        var resultContainer = document.getElementById('result-container');
        var generatedLink = document.getElementById('generated-link');
        
        if (!resultContainer || !generatedLink) {
            return;
        }
        
        var baseUrl = document.getElementById('base-url').value;
        
        if (!baseUrl || !Validator.isValidUrl(baseUrl)) {
            return;
        }
        
        var params = this.collectParams();
        var finalUrl = this.buildUrl(baseUrl, params);
        
        if (finalUrl && params.length > 0) {
            generatedLink.value = finalUrl;
            resultContainer.style.display = 'block';
            this.updateLinkPreview(finalUrl);
        }
    }
    
    addParamRow(focusNew) {
        if (focusNew === undefined) {
            focusNew = true;
        }
        
        if (this.paramCount >= this.maxParams) {
            Utils.showToast('Máximo de ' + this.maxParams + ' parâmetros atingido', 'warning');
            return null;
        }
        
        this.paramCount++;
        var container = document.getElementById('params-container');
        
        if (!container) {
            return null;
        }
        
        var paramId = 'param-' + Date.now();
        var self = this;
        
        var row = document.createElement('div');
        row.className = 'param-row';
        row.setAttribute('data-param-id', paramId);
        
        row.innerHTML = '' +
            '<div class="param-inputs">' +
                '<div class="param-field">' +
                    '<label>Parâmetro</label>' +
                    '<input type="text" class="param-key" placeholder="nome_parametro" autocomplete="off" maxlength="50">' +
                '</div>' +
                '<div class="param-field">' +
                    '<label>Valor</label>' +
                    '<input type="text" class="param-value" placeholder="valor_parametro" autocomplete="off" maxlength="200">' +
                '</div>' +
                '<button class="remove-param" title="Remover parâmetro">' +
                    '<span>×</span>' +
                '</button>' +
            '</div>';
        
        container.appendChild(row);
        
        var removeBtn = row.querySelector('.remove-param');
        removeBtn.addEventListener('click', function() {
            self.removeParamRow(row);
        });
        
        var keyInput = row.querySelector('.param-key');
        var valueInput = row.querySelector('.param-value');
        
        if (keyInput && valueInput) {
            keyInput.addEventListener('input', function() {
                self.validateParamName(keyInput);
                self.updateRealTimePreview();
            });
            
            valueInput.addEventListener('input', function() {
                self.updateRealTimePreview();
            });
            
            keyInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (keyInput.value) {
                        valueInput.focus();
                    }
                }
            });
            
            valueInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (keyInput.value && valueInput.value) {
                        self.addParamRow(true);
                    }
                }
            });
        }
        
        row.style.animation = 'fadeIn 0.3s ease';
        
        if (focusNew) {
            setTimeout(function() {
                if (keyInput) {
                    keyInput.focus();
                }
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
        
        return row;
    }
    
    removeParamRow(row) {
        if (!row) {
            return;
        }
        
        var self = this;
        
        row.style.animation = 'fadeOut 0.3s ease forwards';
        
        setTimeout(function() {
            if (row.parentNode) {
                row.parentNode.removeChild(row);
                self.paramCount--;
                self.updateRealTimePreview();
            }
        }, 300);
    }
    
    validateParamName(input) {
        var value = input.value;
        var sanitized = value.replace(/[^a-zA-Z0-9_\-\[\]]/g, '');
        
        if (value !== sanitized) {
            input.value = sanitized;
            Utils.showToast('Caracteres especiais removidos do parâmetro', 'warning');
        }
        
        if (value.length > 50) {
            input.value = value.substring(0, 50);
        }
        
        var allKeys = document.querySelectorAll('.param-key');
        var duplicate = false;
        var self = this;
        
        allKeys.forEach(function(key) {
            if (key !== input && key.value === input.value && input.value !== '') {
                duplicate = true;
            }
        });
        
        if (duplicate) {
            input.style.borderColor = '#FF6584';
            input.setCustomValidity('Parâmetro duplicado');
        } else {
            input.style.borderColor = '#00BFA6';
            input.setCustomValidity('');
        }
    }
    
    generateLink() {
        try {
            var baseUrl = document.getElementById('base-url').value.trim();
            
            if (!baseUrl) {
                throw new Error('URL Base é obrigatória');
            }
            
            if (!Validator.isValidUrl(baseUrl)) {
                Utils.showToast('URL base inválida. Use formato: https://exemplo.com', 'error');
                return null;
            }
            
            var params = this.collectParams();
            var finalUrl = this.buildUrl(baseUrl, params);
            
            var resultContainer = document.getElementById('result-container');
            var generatedLink = document.getElementById('generated-link');
            
            if (resultContainer && generatedLink) {
                generatedLink.value = finalUrl;
                resultContainer.style.display = 'block';
                resultContainer.scrollIntoView({ behavior: 'smooth' });
            }
            
            this.updateLinkPreview(finalUrl);
            
            HistoryManager.addToHistory({
                type: 'gerador',
                original: baseUrl,
                generated: finalUrl,
                params: params,
                timestamp: new Date().toISOString()
            });
            
            return finalUrl;
            
        } catch (error) {
            Utils.showToast(error.message || 'Erro ao gerar link', 'error');
            return null;
        }
    }
    
    collectParams() {
        var params = [];
        
        var mainParamNameEl = document.getElementById('param-name');
        var mainParamValueEl = document.getElementById('param-value');
        
        var mainParamName = mainParamNameEl ? mainParamNameEl.value.trim() : '';
        var mainParamValue = mainParamValueEl ? mainParamValueEl.value.trim() : '';
        
        if (mainParamName && mainParamValue) {
            params.push({
                key: this.encodeParam(mainParamName),
                value: this.encodeParam(mainParamValue)
            });
        }
        
        var rows = document.querySelectorAll('.param-row');
        
        rows.forEach(function(row) {
            var keyInput = row.querySelector('.param-key');
            var valueInput = row.querySelector('.param-value');
            
            var key = keyInput ? keyInput.value.trim() : '';
            var value = valueInput ? valueInput.value.trim() : '';
            
            if (key && value) {
                params.push({
                    key: encodeURIComponent(key).replace(/%20/g, '+'),
                    value: encodeURIComponent(value).replace(/%20/g, '+')
                });
            }
        });
        
        return this.removeDuplicates(params);
    }
    
    removeDuplicates(params) {
        var seen = {};
        return params.filter(function(param) {
            var key = param.key.toLowerCase();
            if (seen[key]) {
                return false;
            }
            seen[key] = true;
            return true;
        });
    }
    
    encodeParam(param) {
        return encodeURIComponent(param).replace(/%20/g, '+');
    }
    
    buildUrl(baseUrl, params) {
        try {
            var url = new URL(baseUrl);
            
            params.forEach(function(param) {
                url.searchParams.set(param.key, param.value);
            });
            
            return url.toString();
            
        } catch (error) {
            var separator = baseUrl.indexOf('?') !== -1 ? '&' : '?';
            
            var queryString = params.map(function(param) {
                return param.key + '=' + param.value;
            }).join('&');
            
            if (queryString) {
                return baseUrl + separator + queryString;
            }
            
            return baseUrl;
        }
    }
    
    updateLinkPreview(url) {
        var previewBox = document.getElementById('link-preview');
        
        if (!previewBox) {
            return;
        }
        
        try {
            var urlObj = new URL(url);
            var params = [];
            
            urlObj.searchParams.forEach(function(value, key) {
                params.push({ key: key, value: value });
            });
            
            var html = '' +
                '<div class="preview-header">' +
                    '<span>📋 Preview do Link</span>' +
                    '<span class="param-count">' + params.length + ' parâmetros</span>' +
                '</div>' +
                '<div class="preview-url">' + Utils.escapeHtml(url) + '</div>';
            
            if (params.length > 0) {
                html += '<div class="preview-params">';
                
                params.forEach(function(param) {
                    html += '' +
                        '<div class="param-tag">' +
                            '<span class="param-key-tag">' + Utils.escapeHtml(param.key) + '</span>' +
                            '<span class="param-value-tag">' + Utils.escapeHtml(param.value) + '</span>' +
                        '</div>';
                });
                
                html += '</div>';
            } else {
                html += '<div class="no-params">Nenhum parâmetro adicionado</div>';
            }
            
            html += '' +
                '<div class="preview-actions">' +
                    '<button onclick="window.app.generator.copyAsMarkdown()" class="btn-small">📝 Copiar Markdown</button>' +
                    '<button onclick="window.app.generator.openLink()" class="btn-small">🔗 Testar Link</button>' +
                '</div>';
            
            previewBox.innerHTML = html;
            
        } catch (error) {
            previewBox.innerHTML = '' +
                '<div class="preview-header">📋 Preview do Link</div>' +
                '<div class="preview-url">' + Utils.escapeHtml(url) + '</div>';
        }
    }
    
    copyAsMarkdown() {
        var linkInput = document.getElementById('generated-link');
        var link = linkInput ? linkInput.value : '';
        
        if (!link) {
            return;
        }
        
        var markdown = '[Link Gerado](' + link + ')';
        ClipboardManager.copyToClipboard(markdown);
        Utils.showToast('Link copiado em formato Markdown');
    }
    
    openLink() {
        var linkInput = document.getElementById('generated-link');
        var link = linkInput ? linkInput.value : '';
        
        if (!link) {
            return;
        }
        
        window.open(link, '_blank');
    }
    
    clearAll() {
        var baseUrlInput = document.getElementById('base-url');
        var paramNameInput = document.getElementById('param-name');
        var paramValueInput = document.getElementById('param-value');
        
        if (baseUrlInput) baseUrlInput.value = '';
        if (paramNameInput) paramNameInput.value = '';
        if (paramValueInput) paramValueInput.value = '';
        
        var container = document.getElementById('params-container');
        if (container) {
            container.innerHTML = '';
        }
        
        this.paramCount = 0;
        
        var resultContainer = document.getElementById('result-container');
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }
        
        this.addInitialParams();
        
        Utils.showToast('Campos limpos com sucesso');
    }
    
    getCurrentUrl() {
        var baseUrlInput = document.getElementById('base-url');
        var baseUrl = baseUrlInput ? baseUrlInput.value.trim() : '';
        
        if (!baseUrl) {
            return null;
        }
        
        var params = this.collectParams();
        return this.buildUrl(baseUrl, params);
    }
}

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkGenerator;
}