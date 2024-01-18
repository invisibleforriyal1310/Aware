const { AkairoModule, AkairoModuleOptions, AkairoError } = require('@notenoughupdates/discord-akairo');
const { ButtonInteraction, ModalSubmitInteraction } = require('discord.js');

module.exports = class Component extends AkairoModule {
	/**
	 *
	 * @param {string} id
	 * @param {AkairoModuleOptions} options
	 */
	constructor(
		id,
		options = {
			enabled: true,
			disableAfterUse: false,
		}
	) {
		super(id, {});

		this.enabled = options.enabled;
		this.disableAfterUse = options.disableAfterUse;
	}

	/**
	 * @param {ButtonInteraction | import('discord.js').AnySelectMenuInteraction | ModalSubmitInteraction} interaction
	 */
	async exec(interaction) {
		throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
	}
};
