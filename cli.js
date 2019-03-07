#!/usr/bin/env node

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const path = require('path');
const os = require('os');
const fs = require('fs');
const player = require('play-sound')((opts = {}));
const readConfig = require('read-config');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const sections = [
  {
    header: 'CLI for Watson TTS.',
    content: 'A command line interface for IBM Watson Text To Speech.'
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'text',
        typeLabel: '{underline text}',
        description: 'The text to speech.'
      },
      {
        name: 'config',
        typeLabel: '{underline path}',
        description: 'The path to config.json.'
      },
      {
        name: 'help',
        description: 'Print this usage guide.'
      }
    ]
  }
];
const usage = commandLineUsage(sections);

const config_file_path = path.join(os.homedir(), '.tts-watson', 'config.json');
const config_directory_path = path.join(os.homedir(), '.tts-watson');
const optionDefinitions = [
  { name: 'text', alias: 't', type: String, multiple: true },
  { name: 'config', alias: 'c', type: String },
  { name: 'help', alias: 'h', type: Boolean }
];
const cli_input = commandLineArgs(optionDefinitions);

if (cli_input.help) {
  console.log(usage);
  process.exit(0);
}

let user_config = {};

if (cli_input.config) {
  try {
    const configPath = require.resolve(cli_input.config);
    user_config = readConfig(configPath);
  } catch (error) {
    console.log('Path to config file was wrong');
    process.exit(1);
  }
} else {
  if (fs.existsSync(config_file_path)) {
    const configPath = require.resolve(config_file_path);
    user_config = readConfig(configPath);
  } else {
    if (!fs.existsSync(config_directory_path)) {
      fs.mkdirSync(config_directory_path);
      const new_file = fs.openSync(config_file_path, 'w');
      fs.writeSync(new_file, '{"apikey":""}');
      fs.closeSync(new_file);
    } else if (!fs.existsSync(config_file_path)) {
      const new_file = fs.openSync(config_file_path, 'w');
      fs.writeSync(new_file, '{"apikey":""}');
      fs.closeSync(new_file);
    }
  }
}

if (!user_config.hasOwnProperty('apikey')) {
  console.log('Not exist apikey in ' + config_file_path);
  process.exit(1);
} else if (user_config.apikey === '') {
  console.log('Not exist apikey value in ' + config_file_path);
  process.exit(1);
}

if (!cli_input.text || cli_input.text === '') {
  console.log('Please send text to speech: tts-watson -t Hola');
  process.exit(1);
} else {
  user_config.text = cli_input.text.join(' ');
}

const default_config = {
  text: 'Saludos!',
  voice: 'es-LA_SofiaVoice',
  accept: 'audio/mp3',
  url: 'https://stream.watsonplatform.net/text-to-speech/api',
  apikey: null
};
const config = {
  ...default_config,
  ...user_config
};

const textToSpeech = new TextToSpeechV1({
  iam_apikey: config.apikey,
  url: config.url,
  headers: {
    'X-Watson-Learning-Opt-Out': 'true' // prevent data collection
  }
});

// TODO: play from buffer
textToSpeech.synthesize(config, (error, buffer) => {
  if (error) throw error;

  const tempFile = fs.createWriteStream('./temp-audio-tts-watson.mp3');
  tempFile.on('open', () => {
    tempFile.write(buffer);
    tempFile.end();
  });

  tempFile.on('finish', () => {
    player.play('./temp-audio-tts-watson.mp3', error => {
      if (error) throw error;
      fs.unlinkSync('./temp-audio-tts-watson.mp3');
    });
  });
});
