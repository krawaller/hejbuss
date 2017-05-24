let voices;
if (typeof speechSynthesis !== 'undefined') {
  voices = speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => {
    voices = speechSynthesis.getVoices();
  };
}

export default function say(message) {
  return new Promise((resolve, reject) => {
    if (typeof SpeechSynthesisUtterance === 'undefined') return resolve(false);
    const utterance = new SpeechSynthesisUtterance(
      message.replace(/<[^>]*>/g, '')
    );
    let voice = voices.find(({ lang }) => /^sv/.test(lang));
    utterance.voice = voice;
    utterance.onend = resolve;
    utterance.onerror = reject;
    setTimeout(resolve, 10000);
    speechSynthesis.speak(utterance);
  });
}
