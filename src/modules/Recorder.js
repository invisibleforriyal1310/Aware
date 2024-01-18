/* const { AkairoMessage } = require('@notenoughupdates/discord-akairo');
const { joinVoiceChannel, EndBehaviorType, getVoiceConnection, VoiceConnection } = require('@discordjs/voice');
const { opus } = require('prism-media');
const { Mixer } = require('audio-mixer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const _ = require('lodash');
const BaseClient = require('../core/BaseClient');

module.exports = class Recorder {

	constructor(client) {
		this.client = client;
		this.users = [];
	}

	join(options) {
		this.options = options;
		return joinVoiceChannel(options);
	}

	async start(connection, message) {
		await this.startTimeoutTimer(message);

		const mixer = new Mixer({
			channels: 2,
			bitDepth: 16,
			sampleRate: 48000,
		});

		const recording = this.write();

		mixer.pipe(recording);

		connection.receiver.speaking.on('start', async (userId) => {
			if (!connection.receiver.subscriptions.get(userId)) {
				this.users.push(userId);
				const stream = connection.receiver.subscribe(userId, {
					end: {
						behavior: EndBehaviorType.Manual,
					},
				});

				const decoder = new opus.Decoder({
					frameSize: 960,
					channels: 2,
					rate: 48000,
				});

				const input = mixer.input({
					channels: 2,
					volume: 100,
					sampleRate: 48000,
					bitDepth: 16,
					clearInterval: 250,
				});

				try {
					stream
						.pipe(decoder, {
							end: false,
						})
						.pipe(input, {
							end: false,
						});
				} catch (err) {
					this.client.logger.error(err);
				}
			}
		});

		return connection;
	}

	async stop() {
		const connection = await getVoiceConnection(this.options.guildId);
		const mostRecentRecording = this.getMostRecentRecording('./recordings/');

		if (connection) {
			try {
				this.writeStream.destroy();
			} catch (err) {
				this.client.logger.error(err);
			}

			this.stopTimeoutTimer();

			connection.destroy();

			this.client.logger.info('Stopped recording');

			await this.sync(mostRecentRecording, mostRecentRecording.replace('.pcm', '.mp3'), (err) => {
				if (err) this.client.logger.error(err);
				fs.unlinkSync(path.join('./recordings') + '/' + mostRecentRecording);
			}).catch((err) => {
				this.client.logger.error(err);
			});

			return `./recordings/${mostRecentRecording.replace('.pcm', '.mp3')}`;
		}

		return null;
	}

	write() {
		if (!fs.existsSync('./recordings')) {
			fs.mkdirSync('./recordings');
		}

		const intialTime = new Date();

		return (this.writeStream = fs.createWriteStream(
			`./recordings/${[
				String(intialTime.getDate()).padStart(2, '0'),
				String(intialTime.getMonth() + 1).padStart(2, '0'),
				intialTime.getFullYear(),
				Date.now(),
			].join('_')}.pcm`
		));
	}

	async sync(input, output, callback) {
		const fileToConvert = path.join('./recordings') + '/' + input;
		const fileToMake = path.join('./recordings') + '/' + output;

		try {
			await ffmpeg(fileToConvert)
				.inputOptions('-f', 's16le', '-ar', '48000', '-ac', '2')
				.output(fileToMake)
				.on('end', function () {
					callback(null);
				})
				.on('error', function (err) {
					callback(err);
				})
				.run();
		} catch (err) {
			this.client.logger.error(err);
		}
	}

	getMostRecentRecording(dir) {
		const files = fs.readdirSync(dir);
		return _.max(files, (f) => {
			const fullpath = path.join(dir, f);
			return fs.statSync(fullpath).ctime;
		});
	}

	async startTimeoutTimer(message) {
		this.timer = await setInterval(this._checkNumberOfVoiceMembers, 3000, message);
	}

	stopTimeoutTimer() {
		clearInterval(this.timer);
	}

	async _checkNumberOfVoiceMembers(message) {
		const voiceChannel = await message.guild.channels.fetch(message.member.voice.channel.id, {
			force: true,
		});

		if (voiceChannel.members?.size === 1) {
			this.client.logger.info('Detected no users in the channel during recording, stopping automatically');
			await this.stop();
			clearInterval(this.timer);
		}
	}
/*};

