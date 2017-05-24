import { h, Component } from 'preact';
import WaveForm from './WaveForm';

import fetchWitResult from '../lib/fetch-wit-result';
import say from '../lib/say';
import VtApi from '../lib/VtApi';

const api = new VtApi();

export default class Home extends Component {
  state = {
    isQuerying: false,
    transcript: '',
    query: ''
  };

  componentDidMount() {
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    if (!('speechRecognition' in window || 'webkitSpeechRecognition' in window))
      return;
    this.recognition = new (window.speechRecognition ||
      window.webkitSpeechRecognition)();
    this.recognition.interimResults = true;
    this.recognition.lang = 'sv';
    this.recognition.onresult = event => {
      const results = Array.from(event.results);
      const transcript = results.reduce(
        (result, alternative) =>
          result +
          Array.from(alternative).map(({ transcript }) => transcript).join(''),
        ''
      );
      const isFinal = results.every(({ isFinal }) => isFinal);
      this.setState({ transcript });

      const done = () => {
        this.query(transcript);
      };

      clearTimeout(this.timeout);
      if (isFinal) done();
      else {
        this.timeout = setTimeout(done, 2000);
      }
    };
    this.recognition.onstart = () => {
      this.isRecognising = true;
    };
    this.recognition.onend = () => {
      if (!this.state.isQuerying) this.recognition.start();
      this.isRecognising = false;
    };
    this.recognition.start();
  }

  query = async transcript => {
    if (!transcript || this.state.isQuerying) return;
    this.setState({
      isQuerying: true,
      transcript: '',
      query: transcript.trim(),
      answer: ''
    });
    if (this.isRecognising) this.recognition.stop();
    if (this.inputElement) this.inputElement.blur();

    try {
      const { query, from, to } = await fetchWitResult(transcript);
      let answer;

      if (!(from || to) || (query  && query !== 'next'))
        answer = 'Ledsen, men jag förstod inte vad du sade.';
      else {
        const trip = await api.getTrip(from, to);
        if (trip.success) {
          const {
            fromBy,
            from: fromName,
            fromAt,
            to: toName,
            toAt,
            changes
          } = trip;
          answer = `Klockan <b>${fromAt}</b> avgår <b>${fromBy}</b> från <b>${fromName}</b> och ankommer ${changes ? `efter ${changes} ${changes === 1 ? 'byte' : 'byten'}` : ''} <b>${toName}</b> klockan <b>${toAt}</b>`;
        } else {
          const { from: fromName, to: toName, error } = trip;
          answer = `Ledsen, jag kunde hitta några anslutningar mellan ${fromName} och ${toName}`;
          if (error) console.error(error);
        }
      }
      this.setState({ answer });
      await say(answer);
    } catch (error) {
      console.error(error);
    } finally {
      if (this.recognition) this.recognition.start();
      this.setState({ isQuerying: false });
    }
  };

  render(_, { transcript, query, isQuerying, answer }) {
    return (
      <div
        class={`app ${isQuerying ? 'querying' : ''} ${answer ? 'answered' : ''}`}
      >
        <h1>Hej Buss! 🗣️ 🚌</h1>
        <form
          name="query"
          action="."
          onSubmit={event => {
            this.query(document.forms.query.input.value);
            event.preventDefault();
          }}
        >
          <input
            autofocus
            ref={inputElement => (this.inputElement = inputElement)}
            type="search"
            name="input"
            class="query-input"
            placeholder="Fråga hur åka från A till B 🗣️ ✏️"
            value={transcript}
            onInput={({ target: { value: transcript } }) =>
              this.setState({
                transcript: transcript.replace(/^\w/, letter =>
                  letter.toUpperCase()
                )
              })}
          />
          <div class="query">{query}</div>
        </form>
        <div class="answer">
          {!answer && isQuerying
            ? <span class="preloader" />
            : <div dangerouslySetInnerHTML={{ __html: answer }} />}
        </div>
        <WaveForm active={!isQuerying} />
      </div>
    );
  }
}
