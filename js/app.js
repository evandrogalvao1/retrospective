/**
 * Scrum Retrospective Board - GitHub Edition
 * Sistema completo de retrospectiva com persistência via GitHub
 */

class RetrospectiveApp {
  constructor() {
    this.gitHub = new GitHubAPI();
    this.boardData = {
      cards: [],
      settings: {},
      users: {},
      _meta: {}
    };
    this.currentUser = null;
    this.isAdmin = false;
    this.syncInterval = null;
    this.backupInterval = null;
    
    this.init();
  }

  /**
   * Inicialização da aplicação
   */
  async init() {
    console.log('🚀 Iniciando Scrum Retrospective Board - GitHub Edition');
    
    // Verificar configuração
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      this.showConfigurationScreen(configErrors);
      return;
    }

    // Verificar conexão com GitHub
    try {
      await this.testGitHubConnection();
      await this.loadBoardData();
      this.setupEventListeners();
      this.showLoginScreen();
      this.startAutoSync();
    } catch (error) {
      console.error('Erro na inicialização:', error);
      this.showConfigurationScreen([error.message]);
    }
  }

  /**
   * Testar conexão com GitHub
   */
  async testGitHubConnection() {
    const result = await this.gitHub.testConnection();
    if (!result.success) {
      throw new Error(`Erro de conexão GitHub: ${result.error}`);
    }
    console.log('✅ Conectado ao GitHub:', result.repo);
  }

  /**
   * Carregar dados do board
   */
  async loadBoardData() {
    try {
      this.setStatus('loading', '🔄 Carregando dados...');
      this.boardData = await this.gitHub.loadAllData();
      this.updateInterface();
      this.setStatus('connected', '✅ Conectado ao GitHub');
      console.log('📊 Dados carregados:', this.boardData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.setStatus('error', '❌ Erro ao carregar dados');
      this.showNotification('Erro ao carregar dados: ' + error.message, 'error');
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Login
    const loginBtn = document.getElementById('login-submit');
    if (loginBtn) {
      loginBtn.onclick = () => this.handleLogin();
    }

    // Configuração
    const configBtn = document.getElementById('config-submit');
    if (configBtn) {
      configBtn.onclick = () => this.handleConfiguration();
    }

    // Botões de adicionar cartão
    document.querySelectorAll('.add-card').forEach(btn => {
      btn.onclick = () => this.handleAddCard(btn.dataset.column);
    });

    // Botões administrativos
    const adminButtons = {
      'refresh-data': () => this.loadBoardData(),
      'export-data': () => this.exportData(),
      'change-max-votes': () => this.changeMaxVotes(),
      'create-backup': () => this.createBackup(),
      'toggle-sync': () => this.toggleSync()
    };

    Object.entries(adminButtons).forEach(([id, handler]) => {
      const btn = document.getElementById(id);
      if (btn) btn.onclick = handler;
    });

    // Auto-save ao sair da página
    window.addEventListener('beforeunload', () => {
      this.stopAutoSync();
    });
  }

  /**
   * Mostrar tela de configuração
   */
  showConfigurationScreen(errors = []) {
    const configHtml = `
      <div class="modal" id="config-modal">
        <div class="modal-content">
          <h2>🔧 Configuração Inicial</h2>
          <p>Configure sua conexão com o GitHub:</p>
          
          ${errors.length > 0 ? `
            <div class="error-list">
              <h3>❌ Problemas encontrados:</h3>
              <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div class="config-form">
            <label for="github-token">Repository Secret Token:</label>
            <input type="password" id="github-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
                   value="${REPO_SECRET_TOKEN}">
            <small>
              <a href="https://github.com/settings/tokens" target="_blank">
                Como criar um token GitHub
              </a>
            </small>
            
            <label for="repo-owner">Usuário GitHub:</label>
            <input type="text" id="repo-owner" value="${CONFIG.REPO_OWNER}">
            
            <label for="repo-name">Nome do Repositório:</label>
            <input type="text" id="repo-name" value="${CONFIG.REPO_NAME}">
            
            <button id="config-submit">💾 Salvar e Continuar</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', configHtml);
  }

  /**
   * Processar configuração
   */
  async handleConfiguration() {
    const token = document.getElementById('github-token').value.trim();
    const owner = document.getElementById('repo-owner').value.trim();
    const name = document.getElementById('repo-name').value.trim();

    if (!token || !owner || !name) {
      this.showNotification('Preencha todos os campos', 'error');
      return;
    }

    // Salvar configurações
    window.REPO_SECRET_TOKEN = token;
    localStorage.setItem('repo_secret_token', token);
    CONFIG.REPO_OWNER = owner;
    CONFIG.REPO_NAME = name;

    // Remover modal
    const modal = document.getElementById('config-modal');
    if (modal) modal.remove();

    // Tentar inicializar novamente
    try {
      await this.testGitHubConnection();
      await this.loadBoardData();
      this.setupEventListeners();
      this.showLoginScreen();
      this.startAutoSync();
      this.showNotification('Configuração salva com sucesso!', 'success');
    } catch (error) {
      this.showConfigurationScreen([error.message]);
    }
  }

  /**
   * Mostrar tela de login
   */
  showLoginScreen() {
    const loginModal = document.getElementById('user-modal');
    if (loginModal) {
      loginModal.style.display = 'flex';
    }
  }

  /**
   * Processar login
   */
  async handleLogin() {
    const name = document.getElementById('username-input').value.trim();
    const registry = document.getElementById('user-registry-input').value.trim();
    const adminPassword = document.getElementById('admin-password-input').value.trim();

    if (!name || !registry) {
      this.showNotification('Preencha nome e matrícula', 'error');
      return;
    }

    try {
      // Verificar se é admin
      this.isAdmin = adminPassword === this.boardData.settings.adminPassword;

      // Registrar/atualizar usuário
      const userData = {
        userId: registry.toLowerCase().trim(),
        name: name,
        registry: registry,
        lastAccess: new Date().toISOString(),
        isAdmin: this.isAdmin
      };

      await this.registerUser(userData);
      
      this.currentUser = userData;
      this.hideLoginScreen();
      this.showApp();
      this.updateUserInfo();
      this.updateAdminControls();
      
      this.showNotification('Login realizado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro no login:', error);
      this.showNotification('Erro ao fazer login: ' + error.message, 'error');
    }
  }

  /**
   * Registrar usuário
   */
  async registerUser(userData) {
    try {
      this.setStatus('loading', '👤 Registrando usuário...');
      
      const updatedUsers = await this.gitHub.saveUser(
        userData, 
        this.boardData.users, 
        this.boardData._meta.usersSha
      );
      
      this.boardData.users = updatedUsers;
      this.setStatus('connected', '✅ Usuário registrado');
      
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }

  /**
   * Esconder tela de login
   */
  hideLoginScreen() {
    const loginModal = document.getElementById('user-modal');
    if (loginModal) {
      loginModal.style.display = 'none';
    }
  }

  /**
   * Mostrar aplicação principal
   */
  showApp() {
    const app = document.getElementById('app');
    if (app) {
      app.style.display = 'block';
    }
  }

  /**
   * Atualizar informações do usuário na interface
   */
  updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo && this.currentUser) {
      const adminText = this.isAdmin ? ' - ADMIN' : '';
      userInfo.textContent = `Usuário: ${this.currentUser.name} (${this.currentUser.registry})${adminText}`;
    }
  }

  /**
   * Atualizar controles administrativos
   */
  updateAdminControls() {
    const adminControls = document.getElementById('admin-controls');
    if (adminControls) {
      adminControls.style.display = this.isAdmin ? 'flex' : 'none';
    }
  }

  /**
   * Atualizar interface com dados carregados
   */
  updateInterface() {
    this.renderCards();
    this.updateVotesDisplay();
    this.updateBoardInfo();
  }

  /**
   * Renderizar cartões
   */
  renderCards() {
    const columns = ['good', 'bad', 'improve'];
    
    columns.forEach(column => {
      const container = document.getElementById(`${column}-cards`);
      if (container) {
        container.innerHTML = '';
        
        const columnCards = this.boardData.cards.filter(
          card => card.column === column && card.status === 'active'
        );
        
        columnCards.forEach(card => {
          container.appendChild(this.createCardElement(card));
        });
      }
    });
  }

  /**
   * Criar elemento de cartão
   */
  createCardElement(card) {
    const element = document.createElement('div');
    element.className = 'card';
    element.dataset.id = card.id;

    const userVoted = card.votes && card.votes[this.currentUser?.userId];
    const totalVotes = this.getTotalVotes(card);
    const canVote = this.canUserVote(card);
    const canDelete = card.createdBy === this.currentUser?.userId;

    element.innerHTML = `
      <div class="card-content">${card.content}</div>
      <div class="card-meta">Criado por ${card.createdByName || 'Anônimo'}</div>
      <div class="card-actions">
        <div class="votes">
          <button class="vote-btn ${userVoted ? 'voted' : ''}" 
                  ${!canVote ? 'disabled' : ''} 
                  onclick="app.handleVote('${card.id}')">
            ${userVoted ? 'Remover Voto' : 'Votar'}
          </button>
          <span>${totalVotes} votos</span>
        </div>
        ${canDelete ? 
          `<button class="delete-btn" onclick="app.handleDeleteCard('${card.id}')">Excluir</button>` :
          '<span class="no-delete">Apenas o autor pode excluir</span>'
        }
      </div>
    `;

    return element;
  }

  /**
   * Verificar se usuário pode votar no cartão
   */
  canUserVote(card) {
    if (!this.currentUser) return false;
    
    const userVoted = card.votes && card.votes[this.currentUser.userId];
    if (userVoted) return true; // Pode remover voto
    
    const userVotedCards = this.getUserVotedCards();
    return userVotedCards.length < this.boardData.settings.maxVotesPerUser;
  }

  /**
   * Obter cartões em que o usuário votou
   */
  getUserVotedCards() {
    if (!this.currentUser) return [];
    
    return this.boardData.cards.filter(card => 
      card.votes && card.votes[this.currentUser.userId]
    );
  }

  /**
   * Obter total de votos do cartão
   */
  getTotalVotes(card) {
    if (!card.votes) return 0;
    return Object.values(card.votes).reduce((sum, count) => sum + count, 0);
  }

  /**
   * Processar adição de cartão
   */
  async handleAddCard(column) {
    const content = prompt('Conteúdo do cartão:');
    if (!content || !this.currentUser) return;

    const newCard = {
      id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      column: column,
      content: content,
      votes: {},
      status: 'active',
      createdBy: this.currentUser.userId,
      createdByName: this.currentUser.name,
      createdAt: new Date().toISOString()
    };

    try {
      this.setStatus('loading', '💾 Salvando cartão...');
      
      const updatedCards = await this.gitHub.saveCard(
        newCard, 
        this.boardData.cards, 
        this.boardData._meta.cardsSha
      );
      
      this.boardData.cards = updatedCards;
      this.renderCards();
      this.setStatus('connected', '✅ Cartão salvo');
      this.showNotification('Cartão adicionado!', 'success');
      
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      this.showNotification('Erro ao salvar cartão: ' + error.message, 'error');
    }
  }

  /**
   * Processar voto
   */
  async handleVote(cardId) {
    if (!this.currentUser) return;

    const card = this.boardData.cards.find(c => c.id === cardId);
    if (!card) return;

    const userVoted = card.votes && card.votes[this.currentUser.userId];
    const action = userVoted ? 'remove' : 'add';

    // Verificar se pode votar
    if (action === 'add' && !this.canUserVote(card)) {
      this.showNotification(`Você já votou no máximo de cartões permitido (${this.boardData.settings.maxVotesPerUser})`, 'error');
      return;
    }

    try {
      this.setStatus('loading', '🗳️ Processando voto...');
      
      const updatedCards = await this.gitHub.updateCard(
        cardId,
        (card) => {
          const newCard = { ...card };
          if (!newCard.votes) newCard.votes = {};
          
          if (action === 'add') {
            newCard.votes[this.currentUser.userId] = 1;
          } else {
            delete newCard.votes[this.currentUser.userId];
          }
          
          return newCard;
        },
        this.boardData.cards,
        this.boardData._meta.cardsSha
      );

      this.boardData.cards = updatedCards;
      this.renderCards();
      this.updateVotesDisplay();
      this.setStatus('connected', '✅ Voto processado');
      this.showNotification(action === 'add' ? 'Voto adicionado!' : 'Voto removido!', 'success');
      
    } catch (error) {
      console.error('Erro ao votar:', error);
      this.showNotification('Erro ao processar voto: ' + error.message, 'error');
    }
  }

  /**
   * Processar exclusão de cartão
   */
  async handleDeleteCard(cardId) {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) return;

    try {
      this.setStatus('loading', '🗑️ Excluindo cartão...');
      
      const updatedCards = await this.gitHub.updateCard(
        cardId,
        (card) => ({ ...card, status: 'inactive' }),
        this.boardData.cards,
        this.boardData._meta.cardsSha
      );

      this.boardData.cards = updatedCards;
      this.renderCards();
      this.setStatus('connected', '✅ Cartão excluído');
      this.showNotification('Cartão excluído!', 'success');
      
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      this.showNotification('Erro ao excluir cartão: ' + error.message, 'error');
    }
  }

  /**
   * Atualizar display de votos
   */
  updateVotesDisplay() {
    const votesLeftElement = document.getElementById('votes-left');
    if (votesLeftElement && this.currentUser) {
      const userVotedCards = this.getUserVotedCards();
      const votesLeft = this.boardData.settings.maxVotesPerUser - userVotedCards.length;
      votesLeftElement.textContent = `Votos restantes: ${votesLeft}/${this.boardData.settings.maxVotesPerUser}`;
    }
  }

  /**
   * Atualizar informações do board
   */
  updateBoardInfo() {
    const boardInfo = document.getElementById('board-info');
    if (boardInfo) {
      const totalCards = this.boardData.cards.filter(c => c.status === 'active').length;
      const totalUsers = Object.keys(this.boardData.users).length;
      boardInfo.textContent = `📊 ${totalCards} cartões • 👥 ${totalUsers} usuários`;
    }
  }

  /**
   * Alterar máximo de votos (admin)
   */
  async changeMaxVotes() {
    if (!this.isAdmin) {
      this.showNotification('Apenas administradores podem alterar configurações', 'error');
      return;
    }

    const newMax = prompt(
      `Digite o número máximo de votos por usuário (atual: ${this.boardData.settings.maxVotesPerUser}):`,
      this.boardData.settings.maxVotesPerUser
    );

    if (!newMax || isNaN(newMax) || parseInt(newMax) < 1) return;

    try {
      this.setStatus('loading', '⚙️ Atualizando configurações...');
      
      const updatedSettings = await this.gitHub.updateSettings(
        { maxVotesPerUser: parseInt(newMax) },
        this.boardData.settings,
        this.boardData._meta.settingsSha
      );

      this.boardData.settings = updatedSettings;
      this.updateVotesDisplay();
      this.setStatus('connected', '✅ Configurações atualizadas');
      this.showNotification('Configurações atualizadas!', 'success');
      
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      this.showNotification('Erro ao atualizar configurações: ' + error.message, 'error');
    }
  }

  /**
   * Exportar dados
   */
  exportData() {
    const dataStr = JSON.stringify(this.boardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `retro-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Dados exportados!', 'success');
  }

  /**
   * Criar backup manual
   */
  async createBackup() {
    if (!this.isAdmin) {
      this.showNotification('Apenas administradores podem criar backups', 'error');
      return;
    }

    try {
      this.setStatus('loading', '💾 Criando backup...');
      await this.gitHub.createBackup(this.boardData);
      this.setStatus('connected', '✅ Backup criado');
      this.showNotification('Backup criado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      this.showNotification('Erro ao criar backup: ' + error.message, 'error');
    }
  }

  /**
   * Iniciar sincronização automática
   */
  startAutoSync() {
    // Sincronização de dados
    this.syncInterval = setInterval(async () => {
      try {
        await this.loadBoardData();
      } catch (error) {
        console.error('Erro na sincronização:', error);
      }
    }, CONFIG.SYNC_INTERVAL);

    // Backup automático
    this.backupInterval = setInterval(async () => {
      if (this.isAdmin) {
        try {
          await this.gitHub.createBackup(this.boardData);
          console.log('Backup automático criado');
        } catch (error) {
          console.error('Erro no backup automático:', error);
        }
      }
    }, CONFIG.BACKUP_INTERVAL);

    console.log('🔄 Auto-sync iniciado');
  }

  /**
   * Parar sincronização automática
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    console.log('⏸️ Auto-sync parado');
  }

  /**
   * Toggle sincronização
   */
  toggleSync() {
    if (this.syncInterval) {
      this.stopAutoSync();
      this.showNotification('Sincronização pausada', 'info');
      document.getElementById('toggle-sync').textContent = '▶️ Retomar Sync';
    } else {
      this.startAutoSync();
      this.showNotification('Sincronização retomada', 'info');
      document.getElementById('toggle-sync').textContent = '⏸️ Pausar Sync';
    }
  }

  /**
   * Definir status da aplicação
   */
  setStatus(type, message) {
    const statusEl = document.getElementById('sync-status');
    if (statusEl) {
      statusEl.className = `status-indicator status-${type}`;
      statusEl.textContent = message;
    }
  }

  /**
   * Mostrar notificação
   */
  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (notification) {
      notification.textContent = message;
      notification.className = `notification notification-${type}`;
      notification.style.display = 'block';
      
      setTimeout(() => {
        notification.style.display = 'none';
      }, CONFIG.NOTIFICATION_DURATION);
    }
  }
}

// Inicializar aplicação quando DOM estiver pronto
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new RetrospectiveApp();
});