```markdown
# 🚀 Ultra Gerador de Links v3.0

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6%2B-yellow.svg)
![Status](https://img.shields.io/badge/status-stable-brightgreen.svg)
![PWA](https://img.shields.io/badge/PWA-ready-purple.svg)

Um sistema completo e profissional para gerar, encurtar links e criar QR Codes, desenvolvido para funcionar perfeitamente no celular usando o ACode.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Módulos](#-módulos)
- [Temas](#-temas)
- [Atalhos](#-atalhos)
- [Requisitos](#-requisitos)
- [Compatibilidade](#-compatibilidade)
- [Capturas de Tela](#-capturas-de-tela)
- [Tecnologias](#-tecnologias)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 🎯 Funcionalidades

### 🔗 Gerador de Links com Parâmetros
- Adicione múltiplos parâmetros UTM e query strings
- Autocomplete inteligente para parâmetros comuns
- Preview em tempo real do link gerado
- Cópia em formato Markdown
- Validação de URLs
- Detecção de parâmetros duplicados
- Suporte a encoding automático

### ✂️ Encurtador de URLs
- Encurtamento local sem dependência de APIs externas
- Alias personalizados
- Códigos automáticos seguros
- Estatísticas de cliques
- Proteção por senha
- Data de expiração
- Lista negra de domínios
- Exportação/Importação de URLs

### 📱 Gerador de QR Code
- Algoritmo nativo sem bibliotecas externas
- Correção de erros nível H (30%)
- Cores personalizáveis
- Logo central opcional
- Download em PNG/JPEG/WEBP
- Cópia para clipboard
- Histórico de QR Codes gerados

### 💬 Gerador de Link WhatsApp
- Suporte a 20+ países
- Templates de mensagens prontos
- Variáveis personalizáveis
- Histórico de números
- Formatação automática
- Link direto, web e API

### 📋 Histórico
- Armazenamento local de todos os links
- Favoritos e arquivamento
- Tags para organização
- Busca e filtros avançados
- Exportação JSON/CSV
- Limpeza automática

### 🎨 Temas
- Dark (padrão)
- Light
- Ocean (azul)
- Forest (verde)
- Neon (roxo)
- Sunset (pôr do sol)

### 📱 PWA
- Instalável no celular
- Funciona offline
- Service Worker
- Manifest.json
- Ícones adaptativos

---

## 📁 Estrutura do Projeto

```

/ultra-gerador-links/
│
├── index.html              # Página principal
├── manifest.json           # Manifesto PWA
├── sw.js                   # Service Worker
├── README.md               # Documentação
│
├── css/
│   ├── style.css           # Estilos principais (800+ linhas)
│   ├── responsive.css      # Sistema responsivo completo
│   └── themes.css          # 6 temas completos
│
├── js/
│   ├── app.js              # Aplicação principal
│   ├── utils.js            # Utilitários (50+ funções)
│   ├── validator.js        # Sistema de validação
│   ├── generator.js        # Gerador de links
│   ├── shortener.js        # Encurtador de URLs
│   ├── qrcode.js           # Gerador de QR Code
│   ├── whatsapp.js         # Gerador WhatsApp
│   ├── history.js          # Gerenciador de histórico
│   └── clipboard.js        # Gerenciador de clipboard
│
├── data/
│   └── history.json        # Dados de exemplo
│
└── assets/
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── fonts/

```

---

## 🚀 Instalação

### No ACode (Celular)

1. **Abra o ACode** no seu celular
2. **Crie um novo projeto** ou pasta
3. **Copie todos os arquivos** para a estrutura acima
4. **Abra o `index.html`** no navegador
5. **Pronto!** O sistema está funcionando!

### No Computador

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ultra-gerador-links.git

# Entre na pasta
cd ultra-gerador-links

# Abra no navegador
# Ou use um servidor local:
npx serve .

# Ou com Python:
python -m http.server 8000
```

Instalar como PWA

1. Acesse o site pelo navegador
2. No Chrome/Edge: Menu → "Instalar aplicativo"
3. No Safari (iOS): Compartilhar → "Adicionar à Tela de Início"

---

📖 Como Usar

Gerar Link com Parâmetros

1. Vá para a aba 🔗 Gerador
2. Digite a URL base (ex: https://meusite.com)
3. Adicione parâmetros (ex: utm_source = facebook)
4. Clique em ⚡ Gerar Link Completo
5. Copie o link gerado!

Encurtar URL

1. Vá para a aba ✂️ Encurtador
2. Cole a URL longa
3. (Opcional) Defina um alias personalizado
4. Clique em ✂️ Encurtar URL
5. Use o link curto gerado!

Criar QR Code

1. Vá para a aba 📱 QR Code
2. Digite a URL
3. Escolha tamanho e cor
4. Clique em 📱 Gerar QR Code
5. Baixe ou copie o QR Code!

Gerar Link WhatsApp

1. Vá para a aba 💬 WhatsApp
2. Selecione o país
3. Digite o número
4. (Opcional) Escreva uma mensagem
5. Clique em 💬 Gerar Link WhatsApp
6. Abra a conversa ou copie o link!

---

🔧 Módulos

app.js

Sistema principal que orquestra todos os módulos.

Classe: UltraLinkGenerator

· Inicialização de módulos
· Navegação entre abas
· Gerenciamento de temas
· Atalhos de teclado

utils.js

Biblioteca de utilitários com 50+ funções.

Classe: Utils

· generateId() - Gerar IDs únicos
· formatDate() - Formatar datas
· escapeHtml() - Sanitizar HTML
· showToast() - Notificações
· copyToClipboard() - Clipboard
· debounce() / throttle() - Performance

validator.js

Sistema completo de validação.

Classe: Validator

· isValidUrl() - Validar URLs
· isValidEmail() - Validar emails
· isValidAlias() - Validar aliases
· validateForm() - Validar formulários
· sanitizeInput() - Sanitizar dados

generator.js

Gerador de links com parâmetros UTM.

Classe: LinkGenerator

· addParamRow() - Adicionar parâmetro
· generateLink() - Gerar link completo
· collectParams() - Coletar parâmetros
· buildUrl() - Construir URL final

shortener.js

Encurtador de URLs local.

Classe: LinkShortener

· shortenUrl() - Encurtar URL
· getOriginalUrl() - Resolver URL
· deleteUrl() - Remover URL
· getStats() - Estatísticas

qrcode.js

Gerador de QR Code nativo.

Classe: QRCodeGenerator

· generateQRCode() - Gerar QR Code
· downloadQRCode() - Baixar imagem
· renderHistory() - Histórico visual

whatsapp.js

Gerador de links WhatsApp.

Classe: WhatsAppLinkGenerator

· generateLink() - Gerar link
· applyTemplate() - Aplicar template
· getRecentNumbers() - Histórico

history.js

Gerenciador de histórico.

Classe: HistoryManager

· addToHistory() - Adicionar item
· getHistory() - Filtrar histórico
· exportHistory() - Exportar dados
· renderHistory() - Interface

clipboard.js

Gerenciador de clipboard.

Classe: ClipboardManager

· copyToClipboard() - Copiar texto
· pasteFromClipboard() - Colar texto
· copyFormatted() - Copiar formatado

---

🎨 Temas

Temas Disponíveis

Tema Descrição Cores Principais
🌙 Dark Escuro profissional Roxo #6C63FF
☀️ Light Claro limpo Roxo #6C63FF
🌊 Ocean Azul oceano Azul #0077B6
🌲 Forest Verde natureza Verde #2D6A4F
💜 Neon Roxo neon Roxo #BB86FC
🌅 Sunset Pôr do sol Vermelho #FF6B6B

Como trocar de tema

· Botão: Clique no ícone 🌙/☀️ no cabeçalho
· Atalho: Ctrl + K
· Automático: Detecta preferência do sistema

---

⌨️ Atalhos

Atalho Ação
Ctrl + K Alternar tema
Ctrl + 1 Aba Gerador
Ctrl + 2 Aba Encurtador
Ctrl + 3 Aba QR Code
Ctrl + 4 Aba WhatsApp
Ctrl + 5 Aba Histórico
Enter Gerar/Encurtar

---

📋 Requisitos

Mínimos

· Navegador com suporte a ES6+
· JavaScript habilitado
· localStorage disponível
· 5MB de espaço livre

Recomendados

· Chrome 90+ / Firefox 88+ / Safari 14+
· Conexão com internet (para algumas funções)
· Tela de 320px ou maior

---

🌐 Compatibilidade

Navegador Versão Mínima Status
Chrome 90+ ✅ Total
Firefox 88+ ✅ Total
Safari 14+ ✅ Total
Edge 90+ ✅ Total
Opera 76+ ✅ Total
Samsung Internet 14+ ✅ Total
iOS Safari 14+ ✅ Total
Android Chrome 90+ ✅ Total

---

📸 Capturas de Tela

Tela Principal (Dark)

```
┌─────────────────────────────────┐
│         ⚡ Ultra Gerador        │
│    [🔗] [✂️] [📱] [💬] [📋]    │
├─────────────────────────────────┤
│                                 │
│   🌐 URL Base                   │
│   ┌─────────────────────────┐   │
│   │ https://exemplo.com     │   │
│   └─────────────────────────┘   │
│                                 │
│   ➕ Adicionar Parâmetro        │
│                                 │
│   ⚡ Gerar Link Completo        │
│                                 │
│   ✅ Link Gerado                │
│   ┌─────────────────────────┐   │
│   │ https://exemplo.com?... │   │
│   └─────────────────────────┘   │
│   [📋 Copiar] [🔗 Testar]      │
│                                 │
└─────────────────────────────────┘
```

---

🛠️ Tecnologias

· HTML5 - Estrutura semântica
· CSS3 - Design moderno com variáveis
· JavaScript ES6+ - Programação orientada a objetos
· localStorage - Persistência de dados
· Canvas API - Geração de QR Code
· Clipboard API - Cópia para área de transferência
· Service Worker - Funcionamento offline
· Web Share API - Compartilhamento nativo

---

🤝 Contribuição

Contribuições são bem-vindas!

Como contribuir

1. Fork o projeto
2. Crie uma branch (git checkout -b feature/nova-funcionalidade)
3. Commit suas mudanças (git commit -m 'Adiciona nova funcionalidade')
4. Push para a branch (git push origin feature/nova-funcionalidade)
5. Abra um Pull Request

Áreas para contribuir

· 🐛 Correção de bugs
· ✨ Novas funcionalidades
· 🌍 Traduções
· 📝 Documentação
· 🎨 Temas novos
· 📱 Melhorias mobile

---

📄 Licença

Este projeto está licenciado sob a licença MIT.

```
MIT License

Copyright (c) 2026 Ultra Gerador de Links

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

🙏 Agradecimentos

· A todos os contribuidores
· À comunidade open source
· Aos usuários que reportam bugs
· Aos criadores de conteúdo que inspiram

---

🏆 Funcionalidades Premium (Gratuitas!)

· ✅ 6 temas completos
· ✅ QR Code nativo
· ✅ Encurtador local
· ✅ Gerador WhatsApp
· ✅ Histórico ilimitado
· ✅ PWA instalável
· ✅ Funciona offline
· ✅ Zero dependências
· ✅ Sem rastreamento
· ✅ 100% gratuito
