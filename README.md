A command line interface for IBM Watson Text To Speech.

# Instalation
```console
npm install tts-watson
```

# Usage
Watson say hello in spanish!
```console
tts-watson -t Hola
```

# Configuration
On first time you need to execute tts-watson to create config file.
```console
tts-watson
```
The `config.json` is locate on:
* **Unix-like**: /home/user/.tts-watson/config.json
* **Windows**: C:\Users\user\\.tts-watson\config.json

```json
{
    "text": "Saludos!",
    "voice": "es-LA_SofiaVoice",
    "accept": "audio/mp3",
    "url": "https://stream.watsonplatform.net/text-to-speech/api",
    "apikey": "sadasdasdsadjsakjdksajdlasl"
}
```
## Notes
* apikey is **obligatory**.
* spanish text to speech is for default.

You can use a config file locate in any location using a parameter `-c`
```console
tts-watson -t follow me on github. -c path_to_config_file
```

# License
Luis Reinoso [MIT LICENCE](LICENCE)