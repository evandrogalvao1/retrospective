# Backups Automáticos

Os backups são criados automaticamente pelo sistema a cada hora.

Formato dos arquivos:
- `backup-YYYY-MM-DD-HH.json` - Backup completo do sistema
- Contém cards, settings e users em um único arquivo

Para restaurar um backup:
1. Copie o conteúdo do arquivo de backup
2. Substitua os arquivos individuais em `/data/`
3. Commit as alterações