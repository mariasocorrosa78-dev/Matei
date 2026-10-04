# 🤖 Bot de Moderação + Tickets

Bot Discord feito com **discord.js v14**, preparado para **GitHub + Railway**.

## 📁 Estrutura

```text
moderation-bot/
├── index.js
├── deploy-commands.js
├── config.js
├── package.json
├── railway.json
├── .gitignore
├── .env.example
└── README.md
```

## ⚙️ Comandos

### Moderação
- `/ban`
- `/mute`
- `/expulsar`
- `/castigo`
- `/lock`
- `/unlock`

### Embed
- `/embed`
  - `titulo`
  - `mensagem`
  - `cor` opcional, exemplo `#5865F2`

### Tickets
- `/painel-ticket`

O painel possui:
- 📮 Denúncias
- ❓ Dúvidas
- 🛒 Compra
- 🛡️ Suporte

Quando o ticket é criado:
- 🔒 Fechar
- 🛡️ Painel Staff
- 👤 Painel Membro

### Painel Staff
- Adicionar membro
- Retirar membro
- Notificar membro

### Painel Membro
- Notificar staff

Somente Staff pode fechar tickets.

## 🔐 Variables do Railway

No Railway, abra **Variables** e adicione:

```text
DISCORD_TOKEN
CLIENT_ID
GUILD_ID
STAFF_ROLE_ID
TICKET_CATEGORY_ID
```

### O que significa cada uma

- `DISCORD_TOKEN` = token do bot
- `CLIENT_ID` = Application ID do bot
- `GUILD_ID` = ID do seu servidor
- `STAFF_ROLE_ID` = ID do cargo Staff
- `TICKET_CATEGORY_ID` = ID da categoria onde os tickets serão criados

⚠️ Nunca coloque o token no GitHub.

## 🚀 GitHub

1. Crie um repositório no GitHub.
2. Envie todos os arquivos deste projeto.
3. Não envie o arquivo `.env`.

## 🚂 Railway

1. Crie um projeto no Railway.
2. Escolha **Deploy from GitHub Repo**.
3. Selecione este repositório.
4. Adicione as 5 Variables.
5. O Railway usará `npm start`.

## 📝 Registrar os comandos

Depois de configurar as Variables, execute uma vez:

```bash
npm install
npm run deploy
```

Depois:

```bash
npm start
```

No Railway, o comando de inicialização é:

```bash
npm start
```

## 🤖 Permissões do bot

Recomenda-se dar ao bot:

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Channels
- Manage Roles
- Kick Members
- Ban Members
- Moderate Members

O cargo do bot precisa estar acima dos cargos que ele irá moderar.

## 🔒 Segurança

Não compartilhe:
- `DISCORD_TOKEN`
- arquivos `.env`
- credenciais do Railway

Se o token vazar, gere outro no Discord Developer Portal.
