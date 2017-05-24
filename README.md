# Hej Buss!

[Hej Buss](https://hejbuss.now.sh)! is a small and stupid hack using [wit.ai](https://wit.ai/):s trainable natural language understanding to answer freeform Västtrafik speech/text queries with next matching departure.

<a href="https://hejbuss.now.sh" align="right"><img src="readme-img/demo.gif" align="right" height="665" width="375"></a>

It can currently only answer questions like: 
`Nästa tur från Nordstan till Ullevi Norra`
or `Nästa tur till Ullevi Norra` in which case it will find the next departure from your nearest stop.

Since this is was just a quick hack, it has basically no error handling. But as long as you stick to the happy path, it might just as well work... if you're using a very modern browser that is – I've only tested it in Chrome 58 😬

## Built using:
* [Västtrafik:s API](https://developer.vasttrafik.se)
* [Preact](https://preactjs.com) through [preact-cli](https://github.com/developit/preact-cli)
* [wit.ai](https://wit.ai/)
* [siriwavejs](https://github.com/caffeinalab/siriwavejs)
* [SpeechRecognition Browser API](https://developer.mozilla.org/sv-SE/docs/Web/API/SpeechRecognition)
* [SpeechSynthesis Browser API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
* [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
* [volume-meter](https://github.com/common-tater/volume-meter)

## License
MIT