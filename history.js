// history.js - Sistema de Gerenciamento de Histórico
// Versão 3.0 - Gerenciador de Histórico Completo e Corrigido

class HistoryManager {
    // Inicialização estática
    static init() {
        if (!HistoryManager.isLoaded) {
            HistoryManager.loadHistory();
            HistoryManager.startAutoSave();
            HistoryManager.setupStorageListener();
            HistoryManager.isLoaded = true;
        }
    }
    
    // Carregamento e salvamento
    static loadHistory() {
        try {
            var data = localStorage.getItem(HistoryManager.STORAGE_KEY);
            
            if (data) {
                var parsed = JSON.parse(data);
                
                if (Array.isArray(parsed)) {
                    HistoryManager.history = parsed.map(function(item) {
                        return HistoryManager.normalizeItem(item);
                    });
                    
                    HistoryManager.history.sort(function(a, b) {
                        var dateA = new Date(a.timestamp || a.date);
                        var dateB = new Date(b.timestamp || b.date);
                        return dateB - dateA;
                    });
                    
                    if (HistoryManager.history.length > HistoryManager.MAX_ITEMS) {
                        HistoryManager.history = HistoryManager.history.slice(0, HistoryManager.MAX_ITEMS);
                        HistoryManager.saveHistory();
                    }
                    
                    HistoryManager.updateStats();
                    console.log('✅ Histórico carregado: ' + HistoryManager.history.length + ' itens');
                } else {
                    throw new Error('Formato inválido');
                }
            } else {
                HistoryManager.history = [];
            }
            
            if (HistoryManager.history.length === 0) {
                HistoryManager.recoverFromBackup();
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar histórico:', error);
            HistoryManager.history = [];
            HistoryManager.recoverFromBackup();
        }
        
        return HistoryManager.history;
    }
    
    static saveHistory() {
        try {
            if (HistoryManager.history.length > 0) {
                HistoryManager.createBackup();
            }
            
            if (HistoryManager.history.length > HistoryManager.MAX_ITEMS) {
                HistoryManager.cleanupOldItems();
            }
            
            var json = JSON.stringify(HistoryManager.history);
            
            if (json.length > HistoryManager.MAX_STORAGE_SIZE) {
                console.warn('⚠️ Histórico muito grande, reduzindo...');
                HistoryManager.history = HistoryManager.history.slice(0, Math.floor(HistoryManager.history.length * 0.7));
                return HistoryManager.saveHistory();
            }
            
            localStorage.setItem(HistoryManager.STORAGE_KEY, json);
            HistoryManager.lastSaveTime = new Date().toISOString();
            HistoryManager.updateStats();
            
            return true;
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('❌ Storage cheio, limpando itens antigos...');
                HistoryManager.history = HistoryManager.history.slice(0, Math.floor(HistoryManager.history.length * 0.5));
                return HistoryManager.saveHistory();
            } else {
                console.error('❌ Erro ao salvar histórico:', error);
                return false;
            }
        }
    }
    
    static createBackup() {
        try {
            localStorage.setItem(HistoryManager.BACKUP_KEY, JSON.stringify(HistoryManager.history.slice(0, 100)));
        } catch (e) {
            // Ignorar erro de backup
        }
    }
    
    static recoverFromBackup() {
        try {
            var backup = localStorage.getItem(HistoryManager.BACKUP_KEY);
            if (backup) {
                var parsed = JSON.parse(backup);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    HistoryManager.history = parsed.map(function(item) {
                        return HistoryManager.normalizeItem(item);
                    });
                    HistoryManager.saveHistory();
                    console.log('✅ Histórico recuperado do backup');
                    return true;
                }
            }
        } catch (e) {
            // Ignorar erro de recuperação
        }
        return false;
    }
    
    // Normalização
    static normalizeItem(item) {
        return {
            id: item.id || Utils.generateId(),
            type: item.type || 'desconhecido',
            original: item.original || '',
            generated: item.generated || '',
            shortCode: item.shortCode || null,
            params: item.params || [],
            size: item.size || null,
            timestamp: item.timestamp || item.date || new Date().toISOString(),
            date: item.date || item.timestamp || new Date().toISOString(),
            metadata: item.metadata || {},
            tags: item.tags || [],
            favorite: item.favorite || false,
            archived: item.archived || false,
            count: item.count || 1,
            lastAccessed: item.lastAccessed || null
        };
    }
    
    // Adicionar ao histórico
    static addToHistory(entry) {
        try {
            if (!entry || !entry.type) {
                console.warn('⚠️ Tentativa de adicionar entrada inválida ao histórico');
                return null;
            }
            
            var recentItems = HistoryManager.history.slice(0, 10);
            var duplicate = null;
            
            for (var i = 0; i < recentItems.length; i++) {
                var item = recentItems[i];
                if (item.type === entry.type && 
                    item.original === entry.original && 
                    item.generated === entry.generated) {
                    duplicate = item;
                    break;
                }
            }
            
            if (duplicate) {
                duplicate.count = (duplicate.count || 1) + 1;
                duplicate.lastAccessed = new Date().toISOString();
                duplicate.timestamp = new Date().toISOString();
                
                var dupIndex = HistoryManager.history.indexOf(duplicate);
                if (dupIndex > 0) {
                    HistoryManager.history.splice(dupIndex, 1);
                    HistoryManager.history.unshift(duplicate);
                }
                
                HistoryManager.saveHistory();
                HistoryManager.notifyListeners('update', duplicate);
                
                return duplicate;
            }
            
            var historyItem = HistoryManager.normalizeItem({
                id: entry.id || Utils.generateId(),
                type: entry.type,
                original: entry.original,
                generated: entry.generated,
                shortCode: entry.shortCode,
                params: entry.params,
                size: entry.size,
                timestamp: entry.timestamp || new Date().toISOString(),
                date: entry.date || new Date().toISOString(),
                metadata: entry.metadata,
                tags: entry.tags,
                favorite: entry.favorite,
                archived: entry.archived,
                count: entry.count,
                lastAccessed: entry.lastAccessed
            });
            
            HistoryManager.history.unshift(historyItem);
            
            var sameType = HistoryManager.history.filter(function(item) {
                return item.type === historyItem.type;
            });
            
            if (sameType.length > HistoryManager.MAX_ITEMS_PER_TYPE) {
                var toRemove = sameType[sameType.length - 1];
                var removeIndex = HistoryManager.history.indexOf(toRemove);
                if (removeIndex > -1) {
                    HistoryManager.history.splice(removeIndex, 1);
                }
            }
            
            if (HistoryManager.history.length > HistoryManager.MAX_ITEMS) {
                HistoryManager.cleanupOldItems();
            }
            
            HistoryManager.saveHistory();
            HistoryManager.notifyListeners('add', historyItem);
            
            return historyItem;
            
        } catch (error) {
            console.error('❌ Erro ao adicionar ao histórico:', error);
            return null;
        }
    }
    
    // Atualizar item
    static updateItem(id, updates) {
        var index = -1;
        
        for (var i = 0; i < HistoryManager.history.length; i++) {
            if (HistoryManager.history[i].id === id) {
                index = i;
                break;
            }
        }
        
        if (index === -1) {
            return null;
        }
        
        var allowedUpdates = ['tags', 'favorite', 'archived', 'metadata', 'original', 'generated'];
        
        for (var j = 0; j < allowedUpdates.length; j++) {
            var key = allowedUpdates[j];
            if (updates[key] !== undefined) {
                HistoryManager.history[index][key] = updates[key];
            }
        }
        
        HistoryManager.history[index].lastModified = new Date().toISOString();
        
        HistoryManager.saveHistory();
        HistoryManager.notifyListeners('update', HistoryManager.history[index]);
        
        return HistoryManager.history[index];
    }
    
    // Remover item
    static removeItem(id) {
        var index = -1;
        
        for (var i = 0; i < HistoryManager.history.length; i++) {
            if (HistoryManager.history[i].id === id) {
                index = i;
                break;
            }
        }
        
        if (index === -1) {
            return false;
        }
        
        var removed = HistoryManager.history.splice(index, 1)[0];
        
        HistoryManager.saveHistory();
        HistoryManager.notifyListeners('remove', removed);
        
        return true;
    }
    
    // Remover múltiplos itens
    static removeItems(ids) {
        if (!Array.isArray(ids)) {
            return 0;
        }
        
        var removed = 0;
        
        for (var i = 0; i < ids.length; i++) {
            if (HistoryManager.removeItem(ids[i])) {
                removed++;
            }
        }
        
        return removed;
    }
    
    // Limpar histórico
    static clearHistory(options) {
        if (!options) {
            options = {};
        }
        
        var type = options.type || null;
        var olderThan = options.olderThan || null;
        var keepFavorites = options.keepFavorites || false;
        var keepArchived = options.keepArchived || false;
        
        if (!type && !olderThan && !keepFavorites && !keepArchived) {
            var backup = HistoryManager.history.slice(0, 20);
            HistoryManager.history = [];
            HistoryManager.saveHistory();
            localStorage.setItem(HistoryManager.BACKUP_KEY, JSON.stringify(backup));
            HistoryManager.notifyListeners('clear', null);
            return true;
        }
        
        var before = HistoryManager.history.length;
        
        HistoryManager.history = HistoryManager.history.filter(function(item) {
            if (keepFavorites && item.favorite) return true;
            if (keepArchived && item.archived) return true;
            if (type && item.type !== type) return true;
            if (olderThan) {
                var itemDate = new Date(item.timestamp);
                var cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - olderThan);
                if (itemDate > cutoff) return true;
            }
            return false;
        });
        
        var removed = before - HistoryManager.history.length;
        
        if (removed > 0) {
            HistoryManager.saveHistory();
            HistoryManager.notifyListeners('clear', { removed: removed, filter: options });
        }
        
        return removed;
    }
    
    // Obter histórico
    static getHistory(filters) {
        if (!filters) {
            filters = {};
        }
        
        var result = HistoryManager.history.slice();
        
        if (filters.type) {
            result = result.filter(function(item) {
                return item.type === filters.type;
            });
        }
        
        if (filters.types && Array.isArray(filters.types)) {
            result = result.filter(function(item) {
                return filters.types.indexOf(item.type) !== -1;
            });
        }
        
        if (filters.search) {
            var search = filters.search.toLowerCase();
            result = result.filter(function(item) {
                var found = false;
                if (item.original && item.original.toLowerCase().indexOf(search) !== -1) found = true;
                if (item.generated && item.generated.toLowerCase().indexOf(search) !== -1) found = true;
                if (item.tags) {
                    for (var i = 0; i < item.tags.length; i++) {
                        if (item.tags[i].toLowerCase().indexOf(search) !== -1) {
                            found = true;
                            break;
                        }
                    }
                }
                return found;
            });
        }
        
        if (filters.favorite !== undefined) {
            result = result.filter(function(item) {
                return item.favorite === filters.favorite;
            });
        }
        
        if (filters.archived !== undefined) {
            result = result.filter(function(item) {
                return item.archived === filters.archived;
            });
        }
        
        if (filters.dateFrom) {
            result = result.filter(function(item) {
                return new Date(item.timestamp) >= new Date(filters.dateFrom);
            });
        }
        
        if (filters.dateTo) {
            result = result.filter(function(item) {
                return new Date(item.timestamp) <= new Date(filters.dateTo);
            });
        }
        
        if (filters.hasParams) {
            result = result.filter(function(item) {
                return item.params && item.params.length > 0;
            });
        }
        
        if (filters.sortBy) {
            var order = filters.sortOrder === 'asc' ? 1 : -1;
            
            switch (filters.sortBy) {
                case 'date':
                case 'timestamp':
                    result.sort(function(a, b) {
                        return order * (new Date(b.timestamp) - new Date(a.timestamp));
                    });
                    break;
                case 'type':
                    result.sort(function(a, b) {
                        var compareA = a.type || '';
                        var compareB = b.type || '';
                        if (compareA < compareB) return -1 * order;
                        if (compareA > compareB) return 1 * order;
                        return 0;
                    });
                    break;
                case 'count':
                    result.sort(function(a, b) {
                        return order * (b.count - a.count);
                    });
                    break;
                case 'original':
                    result.sort(function(a, b) {
                        var origA = a.original || '';
                        var origB = b.original || '';
                        if (origA < origB) return -1 * order;
                        if (origA > origB) return 1 * order;
                        return 0;
                    });
                    break;
            }
        }
        
        if (filters.page && filters.limit) {
            var start = (filters.page - 1) * filters.limit;
            result = result.slice(start, start + filters.limit);
        } else if (filters.limit) {
            result = result.slice(0, filters.limit);
        }
        
        return result;
    }
    
    // Buscar item por ID
    static getItemById(id) {
        for (var i = 0; i < HistoryManager.history.length; i++) {
            if (HistoryManager.history[i].id === id) {
                return HistoryManager.history[i];
            }
        }
        return null;
    }
    
    // Buscar por URL
    static findByUrl(url) {
        return HistoryManager.history.filter(function(item) {
            return item.original === url || item.generated === url;
        });
    }
    
    // Alternar favorito
    static toggleFavorite(id) {
        var item = HistoryManager.getItemById(id);
        
        if (!item) {
            return null;
        }
        
        item.favorite = !item.favorite;
        HistoryManager.saveHistory();
        HistoryManager.notifyListeners('update', item);
        
        return item;
    }
    
    // Arquivar/Desarquivar
    static toggleArchive(id) {
        var item = HistoryManager.getItemById(id);
        
        if (!item) {
            return null;
        }
        
        item.archived = !item.archived;
        HistoryManager.saveHistory();
        HistoryManager.notifyListeners('update', item);
        
        return item;
    }
    
    // Adicionar/remover tags
    static addTag(id, tag) {
        var item = HistoryManager.getItemById(id);
        
        if (!item) {
            return null;
        }
        
        if (!item.tags) {
            item.tags = [];
        }
        
        if (item.tags.indexOf(tag) === -1) {
            item.tags.push(tag);
            HistoryManager.saveHistory();
            HistoryManager.notifyListeners('update', item);
        }
        
        return item;
    }
    
    static removeTag(id, tag) {
        var item = HistoryManager.getItemById(id);
        
        if (!item || !item.tags) {
            return null;
        }
        
        var index = item.tags.indexOf(tag);
        if (index > -1) {
            item.tags.splice(index, 1);
            HistoryManager.saveHistory();
            HistoryManager.notifyListeners('update', item);
        }
        
        return item;
    }
    
    // Obter todas as tags
    static getAllTags() {
        var tags = {};
        var result = [];
        
        for (var i = 0; i < HistoryManager.history.length; i++) {
            var itemTags = HistoryManager.history[i].tags;
            if (itemTags && Array.isArray(itemTags)) {
                for (var j = 0; j < itemTags.length; j++) {
                    if (!tags[itemTags[j]]) {
                        tags[itemTags[j]] = true;
                        result.push(itemTags[j]);
                    }
                }
            }
        }
        
        result.sort();
        return result;
    }
    
    // Estatísticas
    static updateStats() {
        var now = new Date();
        var today = now.toISOString().split('T')[0];
        var thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        var thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        var typeCount = {};
        var totalGenerated = 0;
        var todayCount = 0;
        var weekCount = 0;
        var monthCount = 0;
        var favoriteCount = 0;
        var archivedCount = 0;
        
        for (var i = 0; i < HistoryManager.history.length; i++) {
            var item = HistoryManager.history[i];
            
            typeCount[item.type] = (typeCount[item.type] || 0) + 1;
            totalGenerated++;
            
            if (item.timestamp && item.timestamp.indexOf(today) === 0) todayCount++;
            if (item.timestamp && item.timestamp >= thisWeek) weekCount++;
            if (item.timestamp && item.timestamp >= thisMonth) monthCount++;
            
            if (item.favorite) favoriteCount++;
            if (item.archived) archivedCount++;
        }
        
        HistoryManager.stats = {
            total: totalGenerated,
            today: todayCount,
            thisWeek: weekCount,
            thisMonth: monthCount,
            favorites: favoriteCount,
            archived: archivedCount,
            types: typeCount,
            oldestItem: HistoryManager.history.length > 0 ? HistoryManager.history[HistoryManager.history.length - 1] : null,
            newestItem: HistoryManager.history.length > 0 ? HistoryManager.history[0] : null,
            lastUpdated: new Date().toISOString()
        };
        
        return HistoryManager.stats;
    }
    
    static getStats() {
        if (!HistoryManager.stats) {
            return HistoryManager.updateStats();
        }
        return HistoryManager.stats;
    }
    
    // Renderizar histórico na interface
    static renderHistory(containerId, options) {
        if (!containerId) {
            containerId = 'history-list';
        }
        
        if (!options) {
            options = {};
        }
        
        var container = document.getElementById(containerId);
        
        if (!container) {
            console.warn('⚠️ Container de histórico não encontrado: ' + containerId);
            return;
        }
        
        var history = HistoryManager.getHistory(options);
        
        if (history.length === 0) {
            container.innerHTML = '' +
                '<div class="history-empty">' +
                    '<span class="empty-icon">📋</span>' +
                    '<h3>Nenhum histórico encontrado</h3>' +
                    '<p>Seus links gerados aparecerão aqui</p>' +
                '</div>';
            return;
        }
        
        var statsFavorites = HistoryManager.stats ? HistoryManager.stats.favorites : 0;
        
        var html = '' +
            '<div class="history-stats-bar">' +
                '<span>Total: ' + history.length + ' itens</span>' +
                '<span>Favoritos: ' + statsFavorites + '</span>' +
            '</div>' +
            '<div class="history-grid">';
        
        for (var i = 0; i < history.length; i++) {
            html += HistoryManager.renderHistoryItem(history[i]);
        }
        
        html += '</div>';
        
        container.innerHTML = html;
        
        HistoryManager.attachHistoryEventListeners(container);
    }
    
    static renderHistoryItem(item) {
        var icon = HistoryManager.getTypeIcon(item.type);
        var timeAgo = HistoryManager.getTimeAgo(item.timestamp);
        var favoriteIcon = item.favorite ? '⭐' : '';
        var isActive = item.favorite ? 'active' : '';
        
        var originalHtml = '';
        if (item.original) {
            originalHtml = '' +
                '<div class="history-original">' +
                    '<label>Original:</label>' +
                    '<span>' + Utils.escapeHtml(Utils.truncate(item.original, 60)) + '</span>' +
                '</div>';
        }
        
        var generatedHtml = '';
        if (item.generated) {
            generatedHtml = '' +
                '<div class="history-generated">' +
                    '<label>Gerado:</label>' +
                    '<span>' + Utils.escapeHtml(Utils.truncate(item.generated, 60)) + '</span>' +
                '</div>';
        }
        
        var paramsHtml = '';
        if (item.params && item.params.length > 0) {
            paramsHtml = '' +
                '<div class="history-params">' +
                    '<label>Parâmetros:</label>' +
                    '<span>' + item.params.length + '</span>' +
                '</div>';
        }
        
        var tagsHtml = '';
        if (item.tags && item.tags.length > 0) {
            tagsHtml = '<div class="history-tags">';
            for (var i = 0; i < item.tags.length; i++) {
                tagsHtml += '<span class="tag">' + Utils.escapeHtml(item.tags[i]) + '</span>';
            }
            tagsHtml += '</div>';
        }
        
        var countHtml = '';
        if (item.count > 1) {
            countHtml = '<div class="history-count">Gerado ' + item.count + 'x</div>';
        }
        
        var urlForActions = Utils.escapeHtml(item.generated || item.original || '');
        
        return '' +
            '<div class="history-item" data-id="' + item.id + '" data-type="' + item.type + '">' +
                '<div class="history-item-header">' +
                    '<span class="history-type-icon">' + icon + '</span>' +
                    '<span class="history-type">' + HistoryManager.getTypeLabel(item.type) + '</span>' +
                    '<span class="history-favorite ' + isActive + '">' + favoriteIcon + '</span>' +
                    '<span class="history-time">' + timeAgo + '</span>' +
                '</div>' +
                '<div class="history-item-body">' +
                    originalHtml +
                    generatedHtml +
                    paramsHtml +
                '</div>' +
                '<div class="history-item-actions">' +
                    '<button class="btn-copy-history" data-url="' + urlForActions + '" title="Copiar">📋</button>' +
                    '<button class="btn-open-history" data-url="' + urlForActions + '" title="Abrir">🔗</button>' +
                    '<button class="btn-favorite-history" data-id="' + item.id + '" title="Favorito">' + (item.favorite ? '⭐' : '☆') + '</button>' +
                    '<button class="btn-delete-history" data-id="' + item.id + '" title="Remover">🗑️</button>' +
                '</div>' +
                tagsHtml +
                countHtml +
            '</div>';
    }
    
    static attachHistoryEventListeners(container) {
        var copyBtns = container.querySelectorAll('.btn-copy-history');
        for (var i = 0; i < copyBtns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var url = btn.getAttribute('data-url');
                    if (url) {
                        ClipboardManager.copyToClipboard(url);
                    }
                });
            })(copyBtns[i]);
        }
        
        var openBtns = container.querySelectorAll('.btn-open-history');
        for (var j = 0; j < openBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var url = btn.getAttribute('data-url');
                    if (url && Validator.isValidUrl(url)) {
                        window.open(url, '_blank');
                    }
                });
            })(openBtns[j]);
        }
        
        var favBtns = container.querySelectorAll('.btn-favorite-history');
        for (var k = 0; k < favBtns.length; k++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = btn.getAttribute('data-id');
                    if (id) {
                        HistoryManager.toggleFavorite(id);
                        HistoryManager.renderHistory();
                    }
                });
            })(favBtns[k]);
        }
        
        var delBtns = container.querySelectorAll('.btn-delete-history');
        for (var l = 0; l < delBtns.length; l++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = btn.getAttribute('data-id');
                    if (id && confirm('Remover este item do histórico?')) {
                        HistoryManager.removeItem(id);
                        HistoryManager.renderHistory();
                        Utils.showToast('Item removido');
                    }
                });
            })(delBtns[l]);
        }
        
        var items = container.querySelectorAll('.history-item');
        for (var m = 0; m < items.length; m++) {
            (function(item) {
                item.addEventListener('click', function() {
                    var id = item.getAttribute('data-id');
                    var historyItem = HistoryManager.getItemById(id);
                    if (historyItem && historyItem.generated) {
                        ClipboardManager.copyToClipboard(historyItem.generated);
                    }
                });
            })(items[m]);
        }
    }
    
    // Ícones e labels
    static getTypeIcon(type) {
        var icons = {
            'gerador': '🔗',
            'encurtador': '✂️',
            'qrcode': '📱',
            'clipboard': '📋',
            'importado': '📥',
            'desconhecido': '❓'
        };
        return icons[type] || '📎';
    }
    
    static getTypeLabel(type) {
        var labels = {
            'gerador': 'Link Gerado',
            'encurtador': 'URL Encurtada',
            'qrcode': 'QR Code',
            'clipboard': 'Clipboard',
            'importado': 'Importado'
        };
        return labels[type] || type;
    }
    
    static getTimeAgo(timestamp) {
        if (!timestamp) {
            return '';
        }
        
        var now = new Date();
        var date = new Date(timestamp);
        var diff = now - date;
        
        var seconds = Math.floor(diff / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);
        var weeks = Math.floor(days / 7);
        var months = Math.floor(days / 30);
        
        if (seconds < 60) return 'Agora';
        if (minutes < 60) return minutes + 'm atrás';
        if (hours < 24) return hours + 'h atrás';
        if (days < 7) return days + 'd atrás';
        if (weeks < 4) return weeks + 'sem atrás';
        if (months < 12) return months + 'mês atrás';
        
        return date.toLocaleDateString('pt-BR');
    }
    
    // Auto-save
    static startAutoSave() {
        if (HistoryManager.autoSaveTimer) {
            clearInterval(HistoryManager.autoSaveTimer);
        }
        
        HistoryManager.autoSaveTimer = setInterval(function() {
            HistoryManager.saveHistory();
        }, HistoryManager.AUTO_SAVE_INTERVAL);
    }
    
    static stopAutoSave() {
        if (HistoryManager.autoSaveTimer) {
            clearInterval(HistoryManager.autoSaveTimer);
            HistoryManager.autoSaveTimer = null;
        }
    }
    
    // Limpeza
    static cleanupOldItems() {
        var nonEssential = HistoryManager.history.filter(function(item) {
            return !item.favorite && !item.archived;
        });
        
        if (nonEssential.length > 0) {
            var removeCount = Math.floor(nonEssential.length * 0.3);
            var toRemove = nonEssential.slice(-removeCount);
            
            for (var i = 0; i < toRemove.length; i++) {
                var index = HistoryManager.history.indexOf(toRemove[i]);
                if (index > -1) {
                    HistoryManager.history.splice(index, 1);
                }
            }
        }
        
        if (HistoryManager.history.length > HistoryManager.MAX_ITEMS) {
            HistoryManager.history = HistoryManager.history.slice(0, HistoryManager.MAX_ITEMS);
        }
    }
    
    // Listener para mudanças no storage
    static setupStorageListener() {
        window.addEventListener('storage', function(e) {
            if (e.key === HistoryManager.STORAGE_KEY && e.newValue) {
                try {
                    var newData = JSON.parse(e.newValue);
                    if (Array.isArray(newData)) {
                        HistoryManager.history = newData.map(function(item) {
                            return HistoryManager.normalizeItem(item);
                        });
                        HistoryManager.updateStats();
                        HistoryManager.notifyListeners('reload', HistoryManager.history);
                    }
                } catch (err) {
                    // Ignorar erro
                }
            }
        });
    }
    
    // Sistema de listeners
    static addListener(callback) {
        if (typeof callback === 'function' && HistoryManager.listeners.indexOf(callback) === -1) {
            HistoryManager.listeners.push(callback);
        }
    }
    
    static removeListener(callback) {
        var index = HistoryManager.listeners.indexOf(callback);
        if (index > -1) {
            HistoryManager.listeners.splice(index, 1);
        }
    }
    
    static notifyListeners(event, data) {
        for (var i = 0; i < HistoryManager.listeners.length; i++) {
            try {
                HistoryManager.listeners[i](event, data);
            } catch (error) {
                console.error('Erro no listener:', error);
            }
        }
    }
    
    // Importação/Exportação
    static exportHistory(format) {
        if (!format) {
            format = 'json';
        }
        
        var data = HistoryManager.getHistory();
        var filename = 'historico-' + new Date().toISOString().split('T')[0];
        
        switch (format) {
            case 'json':
                Utils.downloadFile(
                    JSON.stringify(data, null, 2),
                    filename + '.json',
                    'application/json'
                );
                break;
            case 'csv':
                Utils.downloadFile(
                    HistoryManager.exportAsCSV(data),
                    filename + '.csv',
                    'text/csv'
                );
                break;
            default:
                Utils.downloadFile(
                    JSON.stringify(data, null, 2),
                    filename + '.json',
                    'application/json'
                );
        }
        
        Utils.showToast('Histórico exportado com sucesso');
    }
    
    static exportAsCSV(data) {
        var headers = ['ID', 'Tipo', 'Original', 'Gerado', 'Data', 'Favorito', 'Tags'];
        var rows = [];
        
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var row = [
                item.id,
                item.type,
                '"' + (item.original || '').replace(/"/g, '""') + '"',
                '"' + (item.generated || '').replace(/"/g, '""') + '"',
                item.timestamp,
                item.favorite ? 'Sim' : 'Não',
                '"' + (item.tags || []).join(';') + '"'
            ];
            rows.push(row.join(','));
        }
        
        return headers.join(',') + '\n' + rows.join('\n');
    }
    
    static importHistory(file) {
        return Utils.readFile(file).then(function(text) {
            try {
                var data = JSON.parse(text);
                
                if (!Array.isArray(data)) {
                    throw new Error('Formato inválido');
                }
                
                var imported = 0;
                var skipped = 0;
                
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    
                    if (item.type && (item.original || item.generated)) {
                        var exists = false;
                        
                        for (var j = 0; j < HistoryManager.history.length; j++) {
                            var existing = HistoryManager.history[j];
                            if (existing.original === item.original && 
                                existing.generated === item.generated) {
                                exists = true;
                                break;
                            }
                        }
                        
                        if (!exists) {
                            HistoryManager.addToHistory(item);
                            imported++;
                        } else {
                            skipped++;
                        }
                    }
                }
                
                var msg = imported + ' itens importados';
                if (skipped > 0) {
                    msg += ' (' + skipped + ' duplicados)';
                }
                
                Utils.showToast(msg);
                HistoryManager.renderHistory();
                
                return { imported: imported, skipped: skipped };
                
            } catch (error) {
                Utils.showToast('Erro ao importar: ' + error.message, 'error');
                return { imported: 0, skipped: 0, error: error.message };
            }
        }).catch(function(error) {
            Utils.showToast('Erro ao ler arquivo', 'error');
            return { imported: 0, skipped: 0, error: 'Erro ao ler arquivo' };
        });
    }
    
    // Destruir
    static destroy() {
        HistoryManager.stopAutoSave();
        HistoryManager.saveHistory();
        HistoryManager.listeners = [];
        HistoryManager.stats = null;
        HistoryManager.isLoaded = false;
    }
}

// Propriedades estáticas
HistoryManager.STORAGE_KEY = 'ultra_gerador_history';
HistoryManager.BACKUP_KEY = 'ultra_gerador_history_backup';
HistoryManager.MAX_ITEMS = 500;
HistoryManager.MAX_ITEMS_PER_TYPE = 100;
HistoryManager.AUTO_SAVE_INTERVAL = 5000;
HistoryManager.MAX_STORAGE_SIZE = 5 * 1024 * 1024;

// Estado estático
HistoryManager.history = [];
HistoryManager.isLoaded = false;
HistoryManager.lastSaveTime = null;
HistoryManager.autoSaveTimer = null;
HistoryManager.listeners = [];
HistoryManager.stats = null;

// Inicialização automática
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        HistoryManager.init();
    });
}

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}