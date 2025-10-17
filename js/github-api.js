/**
 * GitHub API Client para persistência de dados
 */
class GitHubAPI {
  constructor() {
    this.baseUrl = CONFIG.GITHUB_API_BASE;
    this.owner = CONFIG.REPO_OWNER;
    this.repo = CONFIG.REPO_NAME;
    this.branch = CONFIG.BRANCH;
    this.requestCount = 0;
    this.requestTimes = [];
  }

  /**
   * Verificar rate limiting
   */
  checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remover requests antigos
    this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);
    
    if (this.requestTimes.length >= CONFIG.MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Rate limit exceeded. Tente novamente em alguns segundos.');
    }
    
    this.requestTimes.push(now);
  }

  /**
   * Fazer requisição para GitHub API
   */
  async request(endpoint, options = {}) {
    this.checkRateLimit();
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `token ${window.REPO_SECRET_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (CONFIG.DEBUG_MODE) {
      console.log('GitHub API Request:', url, options);
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API Error (${response.status}): ${error}`);
    }

    return await response.json();
  }

  /**
   * Obter conteúdo de arquivo
   */
  async getFile(path) {
    try {
      const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;
      const response = await this.request(endpoint);
      
      // Decodificar base64
      const content = atob(response.content.replace(/\s/g, ''));
      return {
        content: JSON.parse(content),
        sha: response.sha
      };
    } catch (error) {
      if (error.message.includes('404')) {
        // Arquivo não existe, retornar estrutura padrão
        return this.getDefaultContent(path);
      }
      throw error;
    }
  }

  /**
   * Obter conteúdo padrão para arquivos inexistentes
   */
  getDefaultContent(path) {
    const defaults = {
      'data/cards.json': { content: [], sha: null },
      'data/settings.json': { 
        content: {
          maxVotesPerUser: 3,
          boardTitle: 'Scrum Retrospective Board',
          adminPassword: 'admin123',
          lastUpdated: new Date().toISOString()
        }, 
        sha: null 
      },
      'data/users.json': { content: {}, sha: null }
    };
    
    return defaults[path] || { content: null, sha: null };
  }

  /**
   * Salvar arquivo
   */
  async saveFile(path, content, sha = null) {
    const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`;
    
    const payload = {
      message: `Update ${path} - ${new Date().toISOString()}`,
      content: btoa(JSON.stringify(content, null, 2)),
      branch: this.branch
    };

    if (sha) {
      payload.sha = sha;
    }

    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Carregar todos os dados
   */
  async loadAllData() {
    try {
      const [cards, settings, users] = await Promise.all([
        this.getFile(CONFIG.DATA_FILES.CARDS),
        this.getFile(CONFIG.DATA_FILES.SETTINGS),
        this.getFile(CONFIG.DATA_FILES.USERS)
      ]);

      return {
        cards: cards.content || [],
        settings: settings.content || {},
        users: users.content || {},
        _meta: {
          cardsSha: cards.sha,
          settingsSha: settings.sha,
          usersSha: users.sha
        }
      };
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      throw error;
    }
  }

  /**
   * Salvar cartão
   */
  async saveCard(cardData, existingCards, cardsSha) {
    const updatedCards = [...existingCards, cardData];
    await this.saveFile(CONFIG.DATA_FILES.CARDS, updatedCards, cardsSha);
    return updatedCards;
  }

  /**
   * Atualizar cartão (votos, exclusão, etc)
   */
  async updateCard(cardId, updateFn, existingCards, cardsSha) {
    const updatedCards = existingCards.map(card => 
      card.id === cardId ? updateFn(card) : card
    );
    await this.saveFile(CONFIG.DATA_FILES.CARDS, updatedCards, cardsSha);
    return updatedCards;
  }

  /**
   * Salvar usuário
   */
  async saveUser(userData, existingUsers, usersSha) {
    const updatedUsers = {
      ...existingUsers,
      [userData.userId]: userData
    };
    await this.saveFile(CONFIG.DATA_FILES.USERS, updatedUsers, usersSha);
    return updatedUsers;
  }

  /**
   * Atualizar configurações
   */
  async updateSettings(newSettings, existingSettings, settingsSha) {
    const updatedSettings = {
      ...existingSettings,
      ...newSettings,
      lastUpdated: new Date().toISOString()
    };
    await this.saveFile(CONFIG.DATA_FILES.SETTINGS, updatedSettings, settingsSha);
    return updatedSettings;
  }

  /**
   * Criar backup
   */
  async createBackup(allData) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupPath = `data/backups/backup-${timestamp}.json`;
    
    const backupData = {
      timestamp: new Date().toISOString(),
      cards: allData.cards,
      settings: allData.settings,
      users: allData.users
    };

    try {
      await this.saveFile(backupPath, backupData);
      console.log('Backup criado:', backupPath);
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    }
  }

  /**
   * Verificar se repositório está configurado corretamente
   */
  async testConnection() {
    try {
      const endpoint = `/repos/${this.owner}/${this.repo}`;
      const repo = await this.request(endpoint);
      return {
        success: true,
        repo: repo.name,
        owner: repo.owner.login,
        private: repo.private
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}