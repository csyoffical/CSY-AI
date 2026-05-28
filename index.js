require('dotenv').config(); // Require kelimesi require olarak düzeltildi
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
        .setDescription('Botun gecikme süresini anlık olarak ölçer!'),
    new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('Botun kullanabileceğiniz tüm komutlarını listeler!'),
    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Seçilen kullanıcının veya kendinizin profil resmini gösterir.')
        .addUserOption(option =>
            option.setName('kullanıcı')
                .setDescription('Profil resmini görmek istediğiniz kullanıcıyı seçin')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen sayıda mesajı kanaldan topluca siler.')
        .addIntegerOption(option =>
            option.setName('sayı')
                .setDescription('Silmek istediğiniz mesaj sayısını girin (1-100)')
                .setRequired(true)) // Sayı girmek zorunlu olsun
].map(command => command.toJSON());

// Komutları bota giriş yaptığında Discord API'sine kaydeden sistem
client.once('ready', async () => {
    console.log(`Botumuz Başarılı bir şekilde giriş yaptı! Aktif İsim: ${client.user.tag}`);
    client.user.setActivity('Alpha - v0.3.2 Sürümü Yayınlandı!', { type: 0 });

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    try {
        console.log('Eski global komutlar siliniyor...');

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

    // Kullanıcı /yardım komutunu kullandığında çalışacak liste kodları
    if (commandName === 'yardım') {
        const yardımEmbed = new EmbedBuilder()
            .setColor('#5865F2') // Kutunun solundaki şerit rengi
            .setTitle('🤖 CSY AI - Güncel Komut Listesi')
            .addFields(
                { 
                    name: '✨ Slash Komutları (/)', 
                    value: '• `/yardım` : Botun tüm komutlarını bu şekilde listeler.\n• `/ping` : Botun anlık gecikme süresini ölçer.\n• `/avatar` : Seçilen kullanıcının veya kendinizin profil resmini gösterir.\n• `/sil` : Belirtilen sayıda mesajı kanaldan topluca siler (1-100).' 
                },
                { 
                    name: '💬 Sohbet Komutları (Oto-Cevap)', 
                    value: '• `sa` : Bot "Aleyküm Selam!" diyerek selamınızı alır.\n• `merhaba` : Bot "Merhaba! Nasılsın?" şeklinde karşılık verir.' 
                }
            )
            .setFooter({ text: `${interaction.user.tag} tarafından listelendi`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [yardımEmbed] });
    }

    // --- AVATAR KOMUTU (Silinen başlangıç satırları geri getirildi) ---
    if (commandName === 'avatar') {
        const user = interaction.options.getUser('kullanıcı') || interaction.user;

        // Şık, renkli kutumuzu (Embed) oluşturuyoruz
        const avatarEmbed = new EmbedBuilder()
            .setColor('#5865F2') // Kutunun solundaki çizgi rengi (Discord'un mavi tonu)
            .setTitle(`${user.username} Adlı Kullanıcısının Avatarı`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 })) // Profil resmini büyük boyutta gösterir
            .setFooter({ text: `${interaction.user.tag} tarafından istendi`, iconURL: interaction.user.displayAvatarURL() });

        // Hazırladığımız kutuyu Discord'a cevap olarak gönderiyoruz
        await interaction.reply({ embeds: [avatarEmbed] });
    }
    
    if (commandName === 'sil') {
        // Kullanıcının girdiği sayı değerini alıyoruz
        const amount = interaction.options.getInteger('sayı');

        // Güvenlik kontrolü: 1 ile 100 arasında bir sayı girildiğinden emin olun
        if (amount < 1 || amount > 100) {
            return await interaction.reply({ content: '❌ Lütfen 1 ile 100 arasında bir sayı girin.', ephemeral: true });
        }
        
        try {
            // Kanaldaki mesajları topluca silme işlemi
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);

            // Başarılı mesajı gönderip 5 saniye sonra bu mesajın kendi kendine silinmesini sağlıyoruz
            await interaction.reply({ content: `✅ Başarıyla ${deletedMessages.size} mesaj silindi!`, ephemeral: true });

            setTimeout(() => interaction.deleteReply().catch(() => null), 5000); // 5 saniye sonra mesajı sil

        } catch (error) {
            console.error('Mesajlar silinirken hata oluştu:', error);
            await interaction.reply({ content: '❌ Mesajlar silinirken bir hata oluştu. Lütfen tekrar deneyin. (Not: 14 günden eski mesajlar Discord politikaları gereği topluca silinemez).', ephemeral: true });
        }
    }
}); // interactionCreate olayının genel kapanışı

client.login(process.env.BOT_TOKEN);
