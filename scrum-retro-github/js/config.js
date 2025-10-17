// Configurações da aplicação
const CONFIG = {
  // Configurações do repositório GitHub
  REPO_OWNER: 'SEU-USUARIO-GITHUB',        // ⚠️ ALTERE: Seu usuário GitHub
  REPO_NAME: 'scrum-retro-board',          // ⚠️ ALTERE: Nome do seu repositório
  BRANCH: 'main',                          // Branch principal
  
  // APIs
  GITHUB_API_BASE: 'https://api.github.com',
  
  // Configurações da aplicação
  MAX_VOTES_PER_USER: 3,
  ADMIN_PASSWORD: 'admin123',              // ⚠️ ALTERE: Senha de administrador
  AUTO_SAVE_INTERVAL: 30000,               // Auto-save a cada 30 segundos
  
  // Configurações de interface
  NOTIFICATION_DURATION: 3000,             // Duração das notificações (ms)
  SYNC_INTERVAL: 10000,                    // Sincronização a cada 10 segundos
  
  // Arquivos de dados
  DATA_FILES: {
    CARDS: 'data/cards.json',
    SETTINGS: 'data/settings.json', 
    USERS: 'data/users.json'
  },
  
  // Configurações de backup
  BACKUP_INTERVAL: 3600000,                // Backup a cada 1 hora
  MAX_BACKUPS: 24,                         // Manter 24 backups (1 dia)
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 30,
  
  // Debug
  DEBUG_MODE: false                        // Habilitar logs detalhados
};

// Token será definido dinamicamente via interface
let GITHUB_TOKEN = localStorage.getItem('github_token') || '';

// Validação de configuração
function validateConfig() {
  const errors = [];
  
  if (CONFIG.REPO_OWNER === 'SEU-USUARIO-GITHUB') {
    errors.push('REPO_OWNER não foi configurado');
  }
  
  if (CONFIG.REPO_NAME === 'scrum-retro-board' && CONFIG.REPO_OWNER === 'SEU-USUARIO-GITHUB') {
    errors.push('REPO_NAME precisa ser configurado');
  }
  
  if (!GITHUB_TOKEN) {
    errors.push('GitHub Token não configurado');
  }
  
  return errors;
}

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, GITHUB_TOKEN };
}