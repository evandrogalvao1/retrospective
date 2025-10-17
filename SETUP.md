# 🛠️ Setup Completo - GitHub Retrospective

## 🚀 **Configuração em 5 Minutos**

### **Passo 1: Preparar Repositório**

1. **Fork este repositório** ou **crie um novo**
2. **Clone localmente** (opcional)
3. **Estrutura criada automaticamente**

### **Passo 2: Configurar GitHub Pages**

1. Vá em **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: main / (root)
4. **Save**
5. **URL será gerada**: `https://username.github.io/repository-name`

### **Passo 3: Configurar GitHub Token (Importante)**

**Para persistência de dados, você precisa de um GitHub Token:**

1. **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. **Scopes necessários**:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. **Copie o token** (só aparece uma vez!)

### **Passo 4: Configurar Secrets**

1. **Seu repositório** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**:
   ```
   Name: REPO_SECRET_TOKEN
   Secret: [cole o token aqui]
   ```

### **Passo 5: Configurar o Sistema**

Edite o arquivo `js/config.js`:

```javascript
const CONFIG = {
  // Configurações do seu repositório
  REPO_OWNER: 'seu-usuario-github',    // Seu usuário GitHub
  REPO_NAME: 'scrum-retro-board',      // Nome do repositório
  BRANCH: 'main',                      // Branch principal
  
  // Repository Secret Token (será lido dos secrets)
  REPO_SECRET_TOKEN: '', // Deixe vazio - será configurado via interface
  
  // Configurações da aplicação
  MAX_VOTES_PER_USER: 3,
  ADMIN_PASSWORD: 'admin12345',
  AUTO_SAVE_INTERVAL: 30000, // 30 segundos
  
  // URLs
  GITHUB_API_BASE: 'https://api.github.com',
  PAGES_URL: 'https://github.com/evandrogalvao1/retrospective'
};
```

## 🧪 **Teste Local (Opcional)**

Se quiser testar localmente:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo

# Serve localmente (Python)
python -m http.server 8000

# Ou (Node.js)
npx serve .

# Acesse http://localhost:8000
```

## 📊 **Como Funciona**

### **Persistência de Dados:**
1. **Interface** envia dados via JavaScript
2. **GitHub API** salva em arquivos JSON no repositório
3. **GitHub Actions** faz backup automático
4. **Dados versionados** no Git

### **Fluxo de Dados:**
```
Usuario Cria Cartão
       ↓
JavaScript captura
       ↓
GitHub API salva em data/cards.json
       ↓
Commit automático no repositório  
       ↓
Outros usuários veem atualização
```

## 🔧 **Configurações Avançadas**

### **Backup Automático:**
O sistema cria backups automáticos em `data/backups/` a cada hora.

### **Múltiplos Boards:**
Para ter vários boards, crie branches diferentes:
```bash
git checkout -b retrospectiva-sprint-1
git checkout -b retrospectiva-sprint-2
```

### **Customização:**
- **Visual**: Edite `css/style.css`
- **Funcionalidades**: Edite `js/app.js`
- **Configurações**: Edite `js/config.js`

## 🚨 **Troubleshooting**

### **Erro 403 - Forbidden:**
- ✅ Verifique se o Repository Secret Token está correto
- ✅ Confirme os scopes do token (repo, workflow)
- ✅ Verifique se o repositório existe

### **Dados não salvam:**
- ✅ Verifique network tab no navegador
- ✅ Confirme configuração em `js/config.js`
- ✅ Teste o token na GitHub API

### **GitHub Pages não atualiza:**
- ✅ Aguarde 2-3 minutos para propagação
- ✅ Force refresh (Ctrl+F5)
- ✅ Verifique Settings > Pages

## 🎯 **Primeiro Uso**

1. **Acesse a URL** do GitHub Pages
2. **Configure Repository Secret Token** na primeira tela
3. **Faça login** com nome e matrícula
4. **Crie cartões** e teste o sistema
5. **Verifique** se dados aparecem em `data/` no repositório

## 💡 **Dicas Importantes**

- ✅ **Token é sensível** - nunca compartilhe
- ✅ **Dados são públicos** - repositório público = dados visíveis
- ✅ **Backup local** - faça clone periodicamente
- ✅ **Rate Limits** - GitHub API tem limites (5000 requests/hora)

## 🌟 **Próximos Passos**

Após configuração básica:
1. **Teste com equipe** pequena
2. **Customize visual** conforme necessário
3. **Configure backups** adicionais se necessário
4. **Documente** processo para equipe