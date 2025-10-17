# 🚀 Quick Start - GitHub Retrospective

## ⚡ Setup em 2 minutos

### 1. **Fork/Clone este repositório**
```bash
git clone https://github.com/SEU-USUARIO/scrum-retro-board.git
cd scrum-retro-board
```

### 2. **Ativar GitHub Pages**
- Vá em **Settings** → **Pages**  
- **Source**: Deploy from a branch
- **Branch**: main / (root)
- **Save**

### **Criar Repository Secret Token**
- https://github.com/settings/tokens/new
- **Scopes**: `repo` + `workflow`
- **Copie o token** (só aparece uma vez!)

### 4. **Configurar o sistema**
- Acesse sua URL: `https://SEU-USUARIO.github.io/SEU-REPO`
- Configure Repository Secret Token na primeira tela
- Faça login e use!

## 📋 **Como usar**

1. **Login**: Nome + Matrícula (+ senha admin se for administrador)
2. **Criar cartões**: Clique nos botões "+" em cada coluna
3. **Votar**: Clique em "Votar" nos cartões (máx. 3 votos por usuário)
4. **Administrar**: Use os botões administrativos (só para admins)

## 🔧 **Personalização**

### **Alterar configurações básicas** (`js/config.js`):
```javascript
CONFIG.MAX_VOTES_PER_USER = 5;        // Máximo de votos por usuário
CONFIG.ADMIN_PASSWORD = 'minha123';    // Senha de administrador
CONFIG.SYNC_INTERVAL = 15000;          // Sync a cada 15 segundos
```

### **Personalizar visual** (`css/style.css`):
- Cores, fontes, layout
- Responsividade
- Animações

### **Adicionar funcionalidades** (`js/app.js`):
- Novas colunas
- Tipos de cartão
- Integrações

## 🎯 **Funcionalidades**

- ✅ **Colaboração em tempo real** - Múltiplos usuários simultâneos
- ✅ **Persistência automática** - Dados salvos no GitHub automaticamente  
- ✅ **Sistema de votos** - Limite configurável por usuário
- ✅ **Administração** - Controles para Scrum Master
- ✅ **Backup automático** - A cada 6 horas via GitHub Actions
- ✅ **Exportação** - Download em JSON/CSV
- ✅ **Responsive** - Funciona em desktop, tablet e mobile
- ✅ **PWA Ready** - Pode ser instalado como app

## 🚨 **Troubleshooting**

### **Erro 403 - Forbidden**
- ✅ Verifique se o Repository Secret Token tem permissões `repo` e `workflow`
- ✅ Confirme se o repositório existe e está acessível
- ✅ Teste o token em https://api.github.com/user (deve retornar seus dados)

### **Dados não salvam**
- ✅ Abra DevTools (F12) → Network tab para ver requests
- ✅ Verifique se `CONFIG.REPO_OWNER` e `CONFIG.REPO_NAME` estão corretos
- ✅ Teste conexão no console: `app.gitHub.testConnection()`

### **GitHub Pages não atualiza**
- ✅ Aguarde 2-3 minutos para propagação
- ✅ Force refresh (Ctrl+Shift+R)
- ✅ Verifique Actions tab se há erro no deploy

## 💡 **Dicas Avançadas**

### **Múltiplos Boards**
Crie branches para diferentes sprints:
```bash
git checkout -b sprint-1
git checkout -b sprint-2
```

### **Domínio customizado**
Adicione arquivo `CNAME` com seu domínio:
```
retrospectiva.meusite.com
```

### **Analytics**
Adicione Google Analytics editando `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

### **PWA (App Mobile)**
O sistema já está configurado como PWA. Para instalar:
- Chrome: Menu → "Instalar app"
- Safari: Compartilhar → "Adicionar à tela inicial"

## 🎊 **Pronto para usar!**

Seu sistema de retrospectiva está 100% funcional e hospedado gratuitamente no GitHub! 

**URL de acesso**: `https://SEU-USUARIO.github.io/SEU-REPO`

### **Próximos passos**:
1. Compartilhe a URL com sua equipe
2. Customize conforme necessário
3. Configure backups adicionais se desejado
4. Monitore uso via GitHub Insights