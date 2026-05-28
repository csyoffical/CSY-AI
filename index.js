require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Discord sunucularına kaydedilecek Slash komutlarının listesi
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun gecikme süresini gösterir.'),
    new SlashCommandBuilder()
        .setName('yardim')
        .setDescription('Botun komutlarını gösterir.'),
].map(command => command.toJSON());

// Komutları bota giriş yaptığında Discord API'sine kaydeden sistem
client.once('ready', async () => {
    console.log(`Botumuz Başarılı bir şekilde giriş yaptı! Aktif İsim: ${client.user.tag}`);
    client.user.setActivity('v0.2.1 Aktif!', { type: 0 });

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    try {
        console.log('Slash komutları sunucuya özel olarak gönderiliyor...');

        // "1509306451737313280"
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, "1509306451737313280"),
            { body: commands },
        );

        console.log('Slash komutları başarıyla sunucuya kaydedildi!');
    } catch (error) {
        console.error('Slash komutları sunucuya kaydedilirken hata oluştu:', error);
    }
});
client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Botların mesajlarını görmezden gel
    // Mesaj içeriğini küçük harfe çevirerek kontrol ediyoruz
    const msgcontent = message.content.toLowerCase();

    // 1. Komut: sa
    if (msgcontent === 'sa') {
        message.reply('Aleyküm Selam!');
    }
    // 2. Komut: merhaba
    else if (msgcontent === 'merhaba') {
        message.reply('Merhaba! Nasılsın?');
    }
});
// Kullanıcı bir slash komutu kullandığında çalışacak olay dinleyicisi
client.on('interactionCreate', async (interaction) => {
    // Eğer gelen etkileşim bir slash komutu değilse, işlemi durdur
    if (!interaction.isChatInputCommand()) return;
    
    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong! Botun gecikme süresi: ' + client.ws.ping + 'ms');
    }

    // Kullanıcı /yardim komutunu kullandığında çalışacak kod
    if (commandName === 'yardim') {
        await interaction.reply('**CSY AI Gelişmiş Komut Menüsü**\n\n `/ping` : Botun gecikme süresini gösterir.\n `sa` : Bot selamınızı alır.\n `merhaba` : Bot sizinle selamlaşır.');
    }
});
client.login(process.env.BOT_TOKEN);
