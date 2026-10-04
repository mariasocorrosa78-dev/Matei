const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder
} = require("discord.js");

const config = require("./config");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel]
});

const COLORS = {
  primary: 0x5865F2,
  success: 0x57F287,
  danger: 0xED4245,
  warning: 0xFEE75C,
  neutral: 0x2B2D31
};

const ticketTypes = {
  denuncia: {
    label: "📮 Denúncias",
    description: "Abusos, xingamentos, falas inapropriadas",
    title: "Denúncia"
  },
  duvidas: {
    label: "❓ Dúvidas",
    description: "Tire dúvidas sobre o jogo, do servidor etc",
    title: "Dúvida"
  },
  compra: {
    label: "🛒 Compra",
    description: "Compre W ou nicks coloridos; o valor será informado no ticket",
    title: "Compra"
  },
  suporte: {
    label: "🛡️ Suporte",
    description: "Bugs no jogo ou algo do tipo; iremos resolver",
    title: "Suporte"
  }
};

function isStaff(member) {
  return member?.roles?.cache?.has(config.staffRoleId) ||
    member?.permissions?.has(PermissionFlagsBits.Administrator);
}

function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(COLORS.danger)
    .setDescription(`❌ ${description}`);
}

function successEmbed(description) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setDescription(`✅ ${description}`);
}

function ticketPanel() {
  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle("🎫 Central de Atendimento")
    .setDescription(
      "Selecione abaixo o motivo do seu atendimento.\n\n" +
      "📮 **Denúncias**\n" +
      "Abusos xingamentos falas inapropriadas\n\n" +
      "❓ **Dúvidas**\n" +
      "Tire dúvidas Sobre o jogo Do servidor etc\n\n" +
      "🛒 **Compra**\n" +
      "Aqui você poderá comprar W ou até mesmo Nicks coloridos após abrir o ticket a resposta será direta sobre o valor dos produtos\n\n" +
      "🛡️ **Suporte**\n" +
      "Caso tenha bugs no jogo ou Algo do tipo abra q iremos resolver"
    )
    .setFooter({ text: "Escolha uma opção abaixo para abrir seu atendimento." });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket_select")
    .setPlaceholder("Selecione o motivo do atendimento")
    .addOptions(
      Object.entries(ticketTypes).map(([value, data]) => ({
        label: data.label.replace(/^[^ ]+ /, ""),
        emoji: data.label.split(" ")[0],
        value,
        description: data.description
      }))
    );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(menu)]
  };
}

function ticketButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Fechar")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("staff_panel")
        .setLabel("Painel Staff")
        .setEmoji("🛡️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("member_panel")
        .setLabel("Painel Membro")
        .setEmoji("👤")
        .setStyle(ButtonStyle.Primary)
    )
  ];
}

function staffPanelComponents() {
  return [
    new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder()
        .setCustomId("staff_add_member")
        .setPlaceholder("Adicionar membro ao ticket")
        .setMinValues(1)
        .setMaxValues(1)
    ),
    new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder()
        .setCustomId("staff_remove_member")
        .setPlaceholder("Retirar membro do ticket")
        .setMinValues(1)
        .setMaxValues(1)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("staff_notify_member")
        .setLabel("Notificar membro")
        .setEmoji("🔔")
        .setStyle(ButtonStyle.Primary)
    )
  ];
}

function memberPanelComponents() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("member_notify_staff")
        .setLabel("Notificar staff")
        .setEmoji("🔔")
        .setStyle(ButtonStyle.Primary)
    )
  ];
}

function ticketOwnerId(channel) {
  const match = channel.topic?.match(/^ticketOwner:(\d+)/);
  return match?.[1] ?? null;
}

function ticketType(channel) {
  const match = channel.topic?.match(/ticketType:([a-z_]+)/);
  return match?.[1] ?? "suporte";
}

function ticketTopic(ownerId, type) {
  return `ticketOwner:${ownerId};ticketType:${type}`;
}

async function findOpenTicket(guild, userId) {
  return guild.channels.cache.find(
    c => c.type === ChannelType.GuildText && ticketOwnerId(c) === userId
  );
}

client.once(Events.ClientReady, c => {
  console.log(`Bot online como ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "embed") {
        const titulo = interaction.options.getString("titulo");
        const mensagem = interaction.options.getString("mensagem");
        const corTexto = interaction.options.getString("cor") || "#5865F2";

        let cor = 0x5865F2;
        if (/^#[0-9A-Fa-f]{6}$/.test(corTexto)) {
          cor = parseInt(corTexto.slice(1), 16);
        }

        const embed = new EmbedBuilder()
          .setColor(cor)
          .setTitle(titulo)
          .setDescription(mensagem)
          .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
        return interaction.reply({
          embeds: [successEmbed("Embed enviado com sucesso.")],
          ephemeral: true
        });
      }

      if (interaction.commandName === "painel-ticket") {
        await interaction.channel.send(ticketPanel());
        return interaction.reply({
          embeds: [successEmbed("Painel de tickets enviado.")],
          ephemeral: true
        });
      }

      if (interaction.commandName === "ban") {
        const user = interaction.options.getUser("membro");
        const motivo = interaction.options.getString("motivo") || "Não informado";
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (member && !member.bannable) {
          return interaction.reply({ embeds: [errorEmbed("Não consigo banir esse membro. Verifique a hierarquia de cargos.")], ephemeral: true });
        }

        await interaction.guild.members.ban(user.id, { reason: `${motivo} | Staff: ${interaction.user.tag}` });
        return interaction.reply({ embeds: [successEmbed(`**${user.tag}** foi banido.\nMotivo: ${motivo}`)] });
      }

      if (interaction.commandName === "expulsar") {
        const user = interaction.options.getUser("membro");
        const motivo = interaction.options.getString("motivo") || "Não informado";
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ embeds: [errorEmbed("Esse membro não está no servidor.")], ephemeral: true });
        if (!member.kickable) return interaction.reply({ embeds: [errorEmbed("Não consigo expulsar esse membro. Verifique a hierarquia de cargos.")], ephemeral: true });

        await member.kick(`${motivo} | Staff: ${interaction.user.tag}`);
        return interaction.reply({ embeds: [successEmbed(`**${user.tag}** foi expulso.\nMotivo: ${motivo}`)] });
      }

      if (interaction.commandName === "mute" || interaction.commandName === "castigo") {
        const user = interaction.options.getUser("membro");
        const minutos = interaction.options.getInteger("minutos");
        const motivo = interaction.options.getString("motivo") || "Não informado";
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ embeds: [errorEmbed("Esse membro não está no servidor.")], ephemeral: true });
        if (!member.moderatable) return interaction.reply({ embeds: [errorEmbed("Não consigo aplicar timeout nesse membro. Verifique a hierarquia.")], ephemeral: true });

        await member.timeout(minutos * 60 * 1000, `${motivo} | Staff: ${interaction.user.tag}`);
        return interaction.reply({
          embeds: [successEmbed(`**${user.tag}** recebeu ${interaction.commandName === "mute" ? "mute" : "castigo"} por **${minutos} minuto(s)**.\nMotivo: ${motivo}`)]
        });
      }

      if (interaction.commandName === "lock" || interaction.commandName === "unlock") {
        const locked = interaction.commandName === "lock";
        await interaction.channel.permissionOverwrites.edit(
          interaction.guild.roles.everyone,
          { SendMessages: !locked }
        );
        return interaction.reply({
          embeds: [successEmbed(`Canal ${locked ? "bloqueado 🔒" : "desbloqueado 🔓"} com sucesso.`)]
        });
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
      const type = interaction.values[0];
      const data = ticketTypes[type];

      const existing = await findOpenTicket(interaction.guild, interaction.user.id);
      if (existing) {
        return interaction.reply({
          embeds: [errorEmbed(`Você já possui um ticket aberto: ${existing}`)],
          ephemeral: true
        });
      }

      const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20) || "membro";

      const channel = await interaction.guild.channels.create({
        name: `ticket-${safeName}`,
        type: ChannelType.GuildText,
        parent: config.ticketCategoryId,
        topic: ticketTopic(interaction.user.id, type),
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles
            ]
          },
          {
            id: config.staffRoleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.AttachFiles
            ]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle(`🎫 Ticket — ${data.title}`)
        .setDescription(
          `Olá, <@${interaction.user.id}>!\n\n` +
          `Seu atendimento foi aberto na categoria **${data.title}**.\n` +
          `A equipe irá atender você em breve.\n\n` +
          `Use os botões abaixo para acessar os painéis disponíveis.`
        )
        .addFields({ name: "Categoria", value: data.label, inline: true })
        .setFooter({ text: "Somente a Staff pode fechar este ticket." });

      await channel.send({
        content: `<@${interaction.user.id}> <@&${config.staffRoleId}>`,
        embeds: [embed],
        components: ticketButtons(),
        allowedMentions: { users: [interaction.user.id], roles: [config.staffRoleId] }
      });

      return interaction.reply({
        embeds: [successEmbed(`Seu ticket foi criado: ${channel}`)],
        ephemeral: true
      });
    }

    if (interaction.isButton()) {
      const channel = interaction.channel;
      if (!channel || !channel.topic?.startsWith("ticketOwner:")) {
        return interaction.reply({ embeds: [errorEmbed("Este botão só pode ser usado dentro de um ticket.")], ephemeral: true });
      }

      if (interaction.customId === "ticket_close") {
        if (!isStaff(interaction.member)) {
          return interaction.reply({
            embeds: [errorEmbed("Apenas staff tem permissão para fechar este ticket.")],
            ephemeral: true
          });
        }

        await interaction.reply({ embeds: [successEmbed("Ticket será fechado em 5 segundos.")] });
        setTimeout(() => channel.delete("Ticket fechado pela Staff").catch(() => {}), 5000);
        return;
      }

      if (interaction.customId === "staff_panel") {
        if (!isStaff(interaction.member)) {
          return interaction.reply({ embeds: [errorEmbed("Apenas staff pode abrir este painel.")], ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setColor(COLORS.neutral)
          .setTitle("🛡️ Painel Staff")
          .setDescription("Use as opções abaixo para gerenciar os membros deste ticket.");

        return interaction.reply({
          embeds: [embed],
          components: staffPanelComponents(),
          ephemeral: true
        });
      }

      if (interaction.customId === "member_panel") {
        const ownerId = ticketOwnerId(channel);
        if (interaction.user.id !== ownerId && !isStaff(interaction.member)) {
          return interaction.reply({ embeds: [errorEmbed("Você não é o membro responsável por este ticket.")], ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setColor(COLORS.primary)
          .setTitle("👤 Painel Membro")
          .setDescription("Precisa de atendimento? Clique para notificar a Staff.");

        return interaction.reply({
          embeds: [embed],
          components: memberPanelComponents(),
          ephemeral: true
        });
      }

      if (interaction.customId === "staff_notify_member") {
        if (!isStaff(interaction.member)) {
          return interaction.reply({ embeds: [errorEmbed("Apenas staff pode usar esta opção.")], ephemeral: true });
        }

        const ownerId = ticketOwnerId(channel);
        const owner = await interaction.guild.members.fetch(ownerId).catch(() => null);

        if (!owner) return interaction.reply({ embeds: [errorEmbed("Não encontrei o membro do ticket.")], ephemeral: true });

        await owner.send(`🔔 A Staff está solicitando sua atenção no ticket **${channel.name}**.`).catch(() => {});
        await channel.send({
          content: `<@${ownerId}>`,
          embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`🔔 **${interaction.user}** notificou o membro para retornar ao ticket.`)],
          allowedMentions: { users: [ownerId] }
        });

        return interaction.reply({ embeds: [successEmbed("Membro notificado.")], ephemeral: true });
      }

      if (interaction.customId === "member_notify_staff") {
        const ownerId = ticketOwnerId(channel);
        if (interaction.user.id !== ownerId && !isStaff(interaction.member)) {
          return interaction.reply({ embeds: [errorEmbed("Somente o membro responsável pode notificar a Staff.")], ephemeral: true });
        }

        await channel.send({
          content: `<@&${config.staffRoleId}>`,
          embeds: [new EmbedBuilder().setColor(COLORS.warning).setTitle("🔔 Atendimento solicitado").setDescription(`${interaction.user} solicitou atendimento da Staff.`)],
          allowedMentions: { roles: [config.staffRoleId] }
        });

        return interaction.reply({ embeds: [successEmbed("A Staff foi notificada.")], ephemeral: true });
      }
    }

    if (interaction.isUserSelectMenu()) {
      const channel = interaction.channel;
      if (!channel?.topic?.startsWith("ticketOwner:")) {
        return interaction.reply({ embeds: [errorEmbed("Este menu só funciona dentro de tickets.")], ephemeral: true });
      }

      if (!isStaff(interaction.member)) {
        return interaction.reply({ embeds: [errorEmbed("Apenas staff pode usar este painel.")], ephemeral: true });
      }

      const userId = interaction.values[0];
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member) return interaction.reply({ embeds: [errorEmbed("Membro não encontrado.")], ephemeral: true });

      if (interaction.customId === "staff_add_member") {
        await channel.permissionOverwrites.edit(member.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
          AttachFiles: true
        });
        await channel.send({ embeds: [successEmbed(`${member} foi adicionado ao ticket por ${interaction.user}.`)] });
        return interaction.reply({ embeds: [successEmbed("Membro adicionado ao ticket.")], ephemeral: true });
      }

      if (interaction.customId === "staff_remove_member") {
        const ownerId = ticketOwnerId(channel);
        if (userId === ownerId) {
          return interaction.reply({ embeds: [errorEmbed("Não é possível retirar o dono do ticket.")], ephemeral: true });
        }

        await channel.permissionOverwrites.delete(member.id).catch(() => {});
        await channel.send({ embeds: [successEmbed(`${member} foi retirado do ticket por ${interaction.user}.`)] });
        return interaction.reply({ embeds: [successEmbed("Membro retirado do ticket.")], ephemeral: true });
      }
    }
  } catch (error) {
    console.error("Erro na interação:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        embeds: [errorEmbed("Ocorreu um erro ao executar esta ação.")],
        ephemeral: true
      }).catch(() => {});
    }
  }
});

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(config.token);
