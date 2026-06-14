// qrcode.js - Sistema Gerador de QR Code
// Versão 3.0 - QR Code Generator Nativo e Completo

class QRCodeGenerator {
    constructor() {
        this.currentQR = null;
        this.qrHistory = [];
        this.maxHistory = 20;
        this.defaultSize = 300;
        this.defaultColor = '#000000';
        this.defaultBackground = '#FFFFFF';
        this.errorCorrectionLevel = 'H';
        this.qrVersion = 0;
        
        this.init();
    }
    
    init() {
        this.loadHistory();
        this.setupStyles();
    }
    
    setupStyles() {
        if (!document.getElementById('qrcode-styles')) {
            const styles = document.createElement('style');
            styles.id = 'qrcode-styles';
            styles.textContent = `
                .qr-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                
                .qr-canvas-wrapper {
                    position: relative;
                    display: inline-block;
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                
                .qr-canvas-wrapper canvas {
                    display: block;
                    max-width: 100%;
                    height: auto;
                }
                
                .qr-logo-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 8px;
                    padding: 5px;
                }
                
                .qr-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .qr-option-group {
                    background: rgba(255,255,255,0.05);
                    padding: 15px;
                    border-radius: 8px;
                }
                
                .qr-option-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--primary);
                    font-weight: 600;
                }
                
                .qr-history-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 10px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    margin-bottom: 10px;
                }
                
                .qr-history-item canvas {
                    width: 50px;
                    height: 50px;
                }
                
                .qr-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    margin: 20px 0;
                }
                
                .qr-stat-card {
                    background: rgba(255,255,255,0.05);
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                }
                
                .qr-stat-value {
                    font-size: 1.5em;
                    font-weight: bold;
                    color: var(--primary);
                }
                
                .qr-loading {
                    display: inline-block;
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: var(--primary);
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .qr-download-btn {
                    background: var(--success);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    async generateQRCode(url, size = null, color = null, options = {}) {
        try {
            if (!url || typeof url !== 'string') {
                throw new Error('URL não fornecida');
            }
            
            url = url.trim();
            
            if (!Validator.isValidUrl(url)) {
                throw new Error('URL inválida');
            }
            
            const qrSize = size || this.defaultSize;
            const qrColor = color || this.defaultColor;
            const backgroundColor = options.backgroundColor || this.defaultBackground;
            const logo = options.logo || null;
            
            const container = document.getElementById('qrcode-display');
            if (!container) {
                throw new Error('Container do QR Code não encontrado');
            }
            
            container.innerHTML = '<div class="qr-loading"></div>';
            
            await Utils.delay(100);
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = qrSize;
            canvas.height = qrSize;
            
            const qrData = this.encodeQRData(url, this.errorCorrectionLevel);
            const matrix = this.createQRMatrix(qrData);
            
            this.renderQRMatrix(ctx, matrix, qrSize, qrColor, backgroundColor);
            
            if (logo) {
                await this.addLogoToQR(ctx, logo, qrSize);
            }
            
            if (options.addBorder) {
                this.addQRBorder(ctx, qrSize, options.borderColor || qrColor);
            }
            
            container.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.className = 'qr-canvas-wrapper';
            wrapper.appendChild(canvas);
            container.appendChild(wrapper);
            
            this.currentQR = {
                url: url,
                canvas: canvas,
                size: qrSize,
                color: qrColor,
                backgroundColor: backgroundColor,
                timestamp: new Date().toISOString(),
                options: options
            };
            
            this.addToHistory(url, canvas);
            
            if (document.getElementById('qrcode-container')) {
                document.getElementById('qrcode-container').style.display = 'block';
            }
            
            HistoryManager.addToHistory({
                type: 'qrcode',
                original: url,
                generated: 'QR Code gerado',
                size: qrSize,
                timestamp: new Date().toISOString()
            });
            
            return canvas;
            
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            Utils.showToast(error.message || 'Erro ao gerar QR Code', 'error');
            
            const container = document.getElementById('qrcode-display');
            if (container) {
                container.innerHTML = `
                    <div style="text-align:center;color:#FF6584;">
                        <p>❌ Erro ao gerar QR Code</p>
                        <p style="font-size:0.9em;">${error.message}</p>
                    </div>
                `;
            }
            
            return null;
        }
    }
    
    encodeQRData(data, errorLevel = 'H') {
        const binary = this.stringToBinary(data);
        
        const dataBits = binary.length;
        let version = this.determineQRVersion(dataBits, errorLevel);
        this.qrVersion = version;
        
        const encodedData = this.addErrorCorrection(binary, errorLevel, version);
        
        return {
            data: encodedData,
            version: version,
            errorLevel: errorLevel,
            originalLength: dataBits
        };
    }
    
    stringToBinary(str) {
        let binary = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            if (charCode < 128) {
                binary += charCode.toString(2).padStart(8, '0');
            } else if (charCode < 2048) {
                binary += ((charCode >> 6) | 0xC0).toString(2).padStart(8, '0');
                binary += ((charCode & 0x3F) | 0x80).toString(2).padStart(8, '0');
            } else {
                binary += ((charCode >> 12) | 0xE0).toString(2).padStart(8, '0');
                binary += (((charCode >> 6) & 0x3F) | 0x80).toString(2).padStart(8, '0');
                binary += ((charCode & 0x3F) | 0x80).toString(2).padStart(8, '0');
            }
        }
        
        const modeIndicator = '0100';
        const charCountIndicator = str.length.toString(2).padStart(8, '0');
        
        binary = modeIndicator + charCountIndicator + binary;
        
        const terminator = '0000';
        binary += terminator;
        
        while (binary.length % 8 !== 0) {
            binary += '0';
        }
        
        const padBytes = ['11101100', '00010001'];
        let padIndex = 0;
        while (binary.length < this.getDataCapacityForVersion(this.determineQRVersion(str.length, 'H'))) {
            binary += padBytes[padIndex % 2];
            padIndex++;
        }
        
        return binary;
    }
    
    determineQRVersion(dataLength, errorLevel) {
        const capacities = {
            'L': [152, 272, 440, 640, 864, 1088, 1248, 1552, 1856, 2192, 2592, 2960, 3424, 3688, 4184, 4712, 5176, 5768, 6360, 6888, 7456, 8048, 8752, 9392, 10208, 10960, 11744, 12272, 13048, 13880, 14744, 15640, 16568, 17528, 18448, 19416, 20536, 21568, 22616, 23688],
            'M': [128, 224, 352, 512, 688, 864, 992, 1232, 1456, 1728, 2032, 2320, 2672, 2920, 3320, 3736, 4056, 4504, 5016, 5352, 5712, 6256, 6880, 7312, 7760, 8432, 9256, 9808, 10336, 10984, 11720, 12448, 13136, 13872, 14656, 15416, 16224, 17016, 17872, 18728],
            'Q': [104, 176, 272, 384, 496, 608, 704, 880, 1056, 1232, 1440, 1648, 1952, 2112, 2400, 2704, 2960, 3264, 3664, 3888, 4208, 4624, 4960, 5344, 5680, 6160, 6640, 7008, 7392, 7800, 8336, 8832, 9232, 9856, 10368, 11008, 11584, 12208, 12816, 13424],
            'H': [72, 128, 208, 288, 368, 480, 528, 688, 800, 976, 1120, 1264, 1440, 1576, 1784, 1968, 2208, 2408, 2680, 2880, 3088, 3384, 3640, 3856, 4160, 4440, 4808, 5088, 5368, 5728, 6080, 6416, 6728, 7120, 7512, 7912, 8280, 8728, 9112, 9568]
        };
        
        const levelCapacities = capacities[errorLevel] || capacities['H'];
        
        for (let i = 0; i < levelCapacities.length; i++) {
            if (levelCapacities[i] >= dataLength) {
                return i + 1;
            }
        }
        
        return 40;
    }
    
    getDataCapacityForVersion(version) {
        const capacities = [208, 359, 567, 807, 1079, 1383, 1568, 1936, 2336, 2768, 3232, 3728, 4256, 4656, 5248, 5888, 6528, 7216, 7936, 8688, 9256, 10064, 10928, 11728, 12736, 13648, 14672, 15392, 16448, 17504, 18608, 19776, 20960, 22176, 23344, 24640, 26096, 27408, 28768, 30160];
        return capacities[Math.min(version - 1, capacities.length - 1)];
    }
    
    addErrorCorrection(data, errorLevel, version) {
        let encoded = data;
        
        while (encoded.length < this.getDataCapacityForVersion(version)) {
            encoded += '0';
        }
        
        return encoded;
    }
    
    createQRMatrix(qrData) {
        const version = qrData.version;
        const size = 17 + version * 4;
        const matrix = [];
        
        for (let i = 0; i < size; i++) {
            matrix[i] = new Array(size).fill(null);
        }
        
        this.addFinderPatterns(matrix, size);
        this.addTimingPatterns(matrix, size);
        this.addAlignmentPatterns(matrix, version);
        this.addDarkModule(matrix, version);
        
        this.placeData(matrix, qrData.data, size);
        
        this.applyMask(matrix, size, this.determineBestMask(matrix, size));
        
        this.addFormatInfo(matrix, size, qrData.errorLevel, 0);
        this.addVersionInfo(matrix, version);
        
        return matrix;
    }
    
    addFinderPatterns(matrix, size) {
        const positions = [
            [0, 0],
            [0, size - 7],
            [size - 7, 0]
        ];
        
        positions.forEach(([row, col]) => {
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    if (i === 0 || i === 6 || j === 0 || j === 6) {
                        matrix[row + i][col + j] = true;
                    } else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) {
                        matrix[row + i][col + j] = true;
                    } else {
                        matrix[row + i][col + j] = false;
                    }
                }
            }
            
            for (let i = -1; i <= 7; i++) {
                for (let j = -1; j <= 7; j++) {
                    const r = row + i;
                    const c = col + j;
                    if (r >= 0 && r < size && c >= 0 && c < size && matrix[r][c] === null) {
                        matrix[r][c] = false;
                    }
                }
            }
        });
    }
    
    addTimingPatterns(matrix, size) {
        for (let i = 8; i < size - 8; i++) {
            if (matrix[6][i] === null) {
                matrix[6][i] = i % 2 === 0;
            }
            if (matrix[i][6] === null) {
                matrix[i][6] = i % 2 === 0;
            }
        }
    }
    
    addAlignmentPatterns(matrix, version) {
        if (version < 2) return;
        
        const positions = this.getAlignmentPatternPositions(version);
        
        positions.forEach(row => {
            positions.forEach(col => {
                if (this.isPositionAvailable(matrix, row, col)) {
                    for (let i = -2; i <= 2; i++) {
                        for (let j = -2; j <= 2; j++) {
                            const r = row + i;
                            const c = col + j;
                            if (r >= 0 && r < matrix.length && c >= 0 && c < matrix.length) {
                                if (matrix[r][c] === null) {
                                    matrix[r][c] = (i === -2 || i === 2 || j === -2 || j === 2 || (i === 0 && j === 0));
                                }
                            }
                        }
                    }
                }
            });
        });
    }
    
    getAlignmentPatternPositions(version) {
        if (version === 1) return [];
        
        const positions = [6];
        const size = 17 + version * 4;
        const step = version > 1 ? Math.floor(size / 7) : 0;
        
        for (let i = size - 7; i > 6; i -= step) {
            positions.push(i);
        }
        
        return positions;
    }
    
    isPositionAvailable(matrix, row, col) {
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                const r = row + i;
                const c = col + j;
                if (r >= 0 && r < matrix.length && c >= 0 && c < matrix.length) {
                    if (matrix[r][c] !== null) return false;
                }
            }
        }
        return true;
    }
    
    addDarkModule(matrix, version) {
        if (version >= 2) {
            const size = 17 + version * 4;
            matrix[size - 8][8] = true;
        }
    }
    
    placeData(matrix, data, size) {
        let dataIndex = 0;
        let goingUp = true;
        let col = size - 1;
        
        while (col > 0) {
            if (col === 6) col--;
            
            for (let row = goingUp ? size - 1 : 0; goingUp ? row >= 0 : row < size; row += goingUp ? -1 : 1) {
                for (let c = col; c > col - 2; c--) {
                    if (matrix[row][c] === null && dataIndex < data.length) {
                        matrix[row][c] = data[dataIndex] === '1';
                        dataIndex++;
                    }
                }
            }
            
            goingUp = !goingUp;
            col -= 2;
        }
    }
    
    applyMask(matrix, size, maskPattern) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (matrix[row][col] !== null && matrix[row][col] !== undefined) {
                    if (this.shouldMask(row, col, maskPattern)) {
                        matrix[row][col] = !matrix[row][col];
                    }
                }
            }
        }
    }
    
    shouldMask(row, col, pattern) {
        switch (pattern) {
            case 0: return (row + col) % 2 === 0;
            case 1: return row % 2 === 0;
            case 2: return col % 3 === 0;
            case 3: return (row + col) % 3 === 0;
            case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
            case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
            case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
            case 7: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
            default: return false;
        }
    }
    
    determineBestMask(matrix, size) {
        let bestMask = 0;
        let lowestPenalty = Infinity;
        
        for (let mask = 0; mask < 8; mask++) {
            const testMatrix = matrix.map(row => [...row]);
            this.applyMask(testMatrix, size, mask);
            const penalty = this.calculatePenalty(testMatrix, size);
            
            if (penalty < lowestPenalty) {
                lowestPenalty = penalty;
                bestMask = mask;
            }
        }
        
        return bestMask;
    }
    
    calculatePenalty(matrix, size) {
        let penalty = 0;
        
        for (let row = 0; row < size; row++) {
            let consecutive = 1;
            for (let col = 1; col < size; col++) {
                if (matrix[row][col] === matrix[row][col - 1]) {
                    consecutive++;
                } else {
                    if (consecutive >= 5) penalty += consecutive - 2;
                    consecutive = 1;
                }
            }
            if (consecutive >= 5) penalty += consecutive - 2;
        }
        
        for (let col = 0; col < size; col++) {
            let consecutive = 1;
            for (let row = 1; row < size; row++) {
                if (matrix[row][col] === matrix[row - 1][col]) {
                    consecutive++;
                } else {
                    if (consecutive >= 5) penalty += consecutive - 2;
                    consecutive = 1;
                }
            }
            if (consecutive >= 5) penalty += consecutive - 2;
        }
        
        for (let row = 0; row < size - 1; row++) {
            for (let col = 0; col < size - 1; col++) {
                if (matrix[row][col] === matrix[row][col + 1] &&
                    matrix[row][col] === matrix[row + 1][col] &&
                    matrix[row][col] === matrix[row + 1][col + 1]) {
                    penalty += 3;
                }
            }
        }
        
        const totalModules = size * size;
        const darkModules = matrix.flat().filter(m => m === true).length;
        const darkPercentage = (darkModules / totalModules) * 100;
        const deviation = Math.abs(darkPercentage - 50);
        penalty += Math.floor(deviation / 5) * 10;
        
        return penalty;
    }
    
    addFormatInfo(matrix, size, errorLevel, maskPattern) {
        const formatBits = this.getFormatBits(errorLevel, maskPattern);
        
        const positions = [
            [0, 0, 1], [0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1],
            [0, 7, 1], [0, 8, 1], [1, 8, 1], [2, 8, 1], [3, 8, 1], [4, 8, 1],
            [5, 8, 1], [7, 8, 1], [8, 8, 1], [8, 7, 0], [8, 5, 0], [8, 4, 0],
            [8, 3, 0], [8, 2, 0], [8, 1, 0], [8, 0, 0], [7, 0, 0], [5, 0, 0],
            [4, 0, 0], [3, 0, 0], [2, 0, 0], [1, 0, 0], [0, 6, 1]
        ];
        
        for (let i = 0; i < 15; i++) {
            const [row, col, direction] = positions[i];
            const bit = (formatBits >> i) & 1;
            
            if (direction === 1) {
                matrix[row][col] = bit === 1;
            } else {
                matrix[row][size - 1 - col] = bit === 1;
            }
        }
    }
    
    getFormatBits(errorLevel, maskPattern) {
        const errorLevelBits = { 'L': 1, 'M': 0, 'Q': 3, 'H': 2 };
        const bits = (errorLevelBits[errorLevel] << 3) | maskPattern;
        
        let formatBits = bits << 10;
        const generator = 0x537;
        
        for (let i = 4; i >= 0; i--) {
            if (formatBits & (1 << (i + 10))) {
                formatBits ^= generator << i;
            }
        }
        
        return ((bits << 10) | (formatBits & 0x3FF)) ^ 0x5412;
    }
    
    addVersionInfo(matrix, version) {
        if (version < 7) return;
        
        const versionBits = this.getVersionBits(version);
        const size = 17 + version * 4;
        
        for (let i = 0; i < 18; i++) {
            const bit = (versionBits >> i) & 1;
            const row = Math.floor(i / 3);
            const col = (i % 3) + size - 11;
            
            matrix[row][col] = bit === 1;
            matrix[col][row] = bit === 1;
        }
    }
    
    getVersionBits(version) {
        let bits = version << 12;
        const generator = 0x1F25;
        
        for (let i = 5; i >= 0; i--) {
            if (bits & (1 << (i + 12))) {
                bits ^= generator << i;
            }
        }
        
        return (version << 12) | (bits & 0xFFF);
    }
    
    renderQRMatrix(ctx, matrix, size, color, backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);
        
        const moduleSize = size / matrix.length;
        
        ctx.fillStyle = color;
        
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    ctx.fillRect(
                        col * moduleSize,
                        row * moduleSize,
                        moduleSize,
                        moduleSize
                    );
                }
            }
        }
    }
    
    async addLogoToQR(ctx, logo, qrSize) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const logoSize = qrSize * 0.22;
                const logoX = (qrSize - logoSize) / 2;
                const logoY = (qrSize - logoSize) / 2;
                
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
                
                ctx.beginPath();
                ctx.roundRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10, 8);
                ctx.clip();
                
                ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
                
                resolve();
            };
            
            img.onerror = () => resolve();
            img.src = logo;
        });
    }
    
    addQRBorder(ctx, size, color) {
        const borderSize = size * 0.05;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = borderSize;
        ctx.strokeRect(
            borderSize / 2,
            borderSize / 2,
            size - borderSize,
            size - borderSize
        );
    }
    
    downloadQRCode(format = 'png', filename = 'qrcode') {
        if (!this.currentQR || !this.currentQR.canvas) {
            Utils.showToast('Gere um QR Code primeiro', 'error');
            return;
        }
        
        try {
            const canvas = this.currentQR.canvas;
            let dataUrl;
            let extension;
            
            switch (format.toLowerCase()) {
                case 'jpg':
                case 'jpeg':
                    dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                    extension = 'jpg';
                    break;
                case 'webp':
                    dataUrl = canvas.toDataURL('image/webp', 0.95);
                    extension = 'webp';
                    break;
                case 'png':
                default:
                    dataUrl = canvas.toDataURL('image/png');
                    extension = 'png';
            }
            
            const link = document.createElement('a');
            link.download = `${filename}.${extension}`;
            link.href = dataUrl;
            link.click();
            
            Utils.showToast(`QR Code baixado como ${extension.toUpperCase()}`);
            
        } catch (error) {
            Utils.showToast('Erro ao baixar QR Code', 'error');
        }
    }
    
    copyQRToClipboard() {
        if (!this.currentQR || !this.currentQR.canvas) {
            Utils.showToast('Gere um QR Code primeiro', 'error');
            return;
        }
        
        try {
            this.currentQR.canvas.toBlob(async (blob) => {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);
                Utils.showToast('QR Code copiado para área de transferência');
            });
        } catch (error) {
            Utils.showToast('Erro ao copiar QR Code', 'error');
        }
    }
    
    addToHistory(url, canvas) {
        this.qrHistory.unshift({
            url: url,
            canvas: canvas,
            timestamp: new Date().toISOString()
        });
        
        if (this.qrHistory.length > this.maxHistory) {
            this.qrHistory = this.qrHistory.slice(0, this.maxHistory);
        }
        
        this.saveHistory();
        this.renderHistory();
    }
    
    loadHistory() {
        try {
            const data = localStorage.getItem('ultra_qrcode_history');
            if (data) {
                const parsed = JSON.parse(data);
                this.qrHistory = parsed.slice(0, this.maxHistory);
            }
        } catch {
            this.qrHistory = [];
        }
    }
    
    saveHistory() {
        try {
            const dataToSave = this.qrHistory.map(item => ({
                url: item.url,
                timestamp: item.timestamp
            }));
            localStorage.setItem('ultra_qrcode_history', JSON.stringify(dataToSave));
        } catch {}
    }
    
    renderHistory() {
        const container = document.getElementById('qrcode-history-list');
        if (!container) return;
        
        if (this.qrHistory.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;">Nenhum QR Code gerado ainda</p>';
            return;
        }
        
        container.innerHTML = this.qrHistory.map((item, index) => `
            <div class="qr-history-item">
                <canvas width="50" height="50"></canvas>
                <div class="qr-history-info">
                    <div class="qr-history-url">${Utils.escapeHtml(Utils.truncate(item.url, 50))}</div>
                    <div class="qr-history-date">${Utils.formatDate(item.timestamp)}</div>
                </div>
                <button onclick="window.app.qrGenerator.regenerateFromHistory(${index})" 
                        class="btn-small" title="Regenerar">
                    🔄
                </button>
            </div>
        `).join('');
        
        this.qrHistory.forEach((item, index) => {
            const canvas = container.querySelectorAll('canvas')[index];
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                tempCanvas.width = 50;
                tempCanvas.height = 50;
                
                const qrData = this.encodeQRData(item.url, 'M');
                const matrix = this.createQRMatrix(qrData);
                this.renderQRMatrix(tempCtx, matrix, 50, '#000000', '#FFFFFF');
                
                ctx.drawImage(tempCanvas, 0, 0);
            }
        });
    }
    
    regenerateFromHistory(index) {
        if (index >= 0 && index < this.qrHistory.length) {
            const item = this.qrHistory[index];
            document.getElementById('qr-url').value = item.url;
            this.generateQRCode(item.url);
            Utils.showToast('QR Code regenerado do histórico');
        }
    }
    
    getQRStats() {
        return {
            totalGenerated: this.qrHistory.length,
            todayGenerated: this.qrHistory.filter(item => {
                const today = new Date().toISOString().split('T')[0];
                return item.timestamp.startsWith(today);
            }).length,
            averageSize: this.qrHistory.length > 0 ? this.defaultSize : 0,
            mostRecent: this.qrHistory[0] || null
        };
    }
    
    clearHistory() {
        this.qrHistory = [];
        this.saveHistory();
        localStorage.removeItem('ultra_qrcode_history');
        this.renderHistory();
        Utils.showToast('Histórico de QR Codes limpo');
    }
}

if (!HTMLCanvasElement.prototype.toBlob) {
    HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
        const dataURL = this.toDataURL(type, quality);
        const binStr = atob(dataURL.split(',')[1]);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        
        for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }
        
        callback(new Blob([arr], { type: type || 'image/png' }));
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRCodeGenerator;
}