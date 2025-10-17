# 🔄 Guia de Migração - GITHUB_TOKEN → REPO_SECRET_TOKEN

## 📋 **O que mudou?**

Para evitar conflitos com tokens padrão do GitHub Actions, alteramos o nome da variável de:
- ❌ `GITHUB_TOKEN` 
- ✅ `REPO_SECRET_TOKEN`

## 🛠️ **Como migrar (2 minutos)**

### **Se você já tinha configurado o sistema:**

#### **1. Atualizar Repository Secret**
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. **Delete** o secret antigo: `GITHUB_TOKEN`
3. **Crie um novo** secret:
   ```
   Name: REPO_SECRET_TOKEN
   Secret: [mesmo token que você usava antes]
   ```

#### **2. Limpar dados locais (opcional)**
Se quiser limpar os dados salvos no navegador:
```javascript
// No console do navegador (F12)
localStorage.removeItem('github_token');
localStorage.clear(); // Ou isso para limpar tudo
```

#### **3. Reconfigurar na interface**
1. Acesse sua aplicação
2. Configure novamente o token (mesmo token de antes)
3. Sistema funcionará normalmente

## ✅ **Nenhuma perda de dados**

- ✅ **Seus dados** continuam intactos no repositório
- ✅ **Funcionalidades** permanecem as mesmas
- ✅ **Performance** inalterada
- ✅ **Apenas** o nome da variável mudou

## 🚨 **Problemas comuns após migração**

### **Erro: "Repository Secret Token não configurado"**
- **Causa**: Sistema não encontra o novo token
- **Solução**: Configure o token novamente na interface

### **Erro 401 - Unauthorized**  
- **Causa**: Secret não foi criado ou nome está errado
- **Solução**: Verifique se o secret se chama exatamente `REPO_SECRET_TOKEN`

### **Interface não carrega configuração**
- **Causa**: Dados antigos no localStorage
- **Solução**: Limpe o localStorage do navegador

## 🎯 **Verificar se migração funcionou**

1. **Acesse a aplicação**
2. **Configure o token** (pode usar o mesmo de antes)
3. **Teste criar um cartão**
4. **Verifique** se aparece no repositório GitHub

## 💡 **Por que a mudança?**

O nome `GITHUB_TOKEN` é reservado pelo GitHub Actions e pode causar conflitos. O novo nome `REPO_SECRET_TOKEN` é mais específico e evita problemas futuros.

## 🆘 **Precisa de ajuda?**

Se encontrar problemas:
1. Verifique se o secret está criado com o nome correto
2. Confirme que o token tem permissões `repo` e `workflow`  
3. Teste o token em https://api.github.com/user
4. Limpe o cache do navegador se necessário

**A migração é simples e rápida! 🚀**