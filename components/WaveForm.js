import { h, Component } from 'preact';
import volumemeter from 'volume-meter';
import SiriWave from 'siriwavejs';

export default class WaveForm extends Component {
  state = {
    active: this.props.active
  };

  componentDidMount() {
    if (!('AudioContext' in window)) return;
    this.siriWave = new SiriWave({
      container: this.base,
      width: 375,
      height: 100,
      style: 'ios9',
      amplitude: 0
    });
    this.siriWave.start();

    this.ctx = new AudioContext();
    this.meter = volumemeter(this.ctx, { tweenIn: 4, tweenOut: 8 }, volume => {
      if (this.state.active) this.siriWave.setAmplitude(volume / 40);
      else this.siriWave.setAmplitude(0.00001);
    });

    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
      const src = this.ctx.createMediaStreamSource(stream);
      src.connect(this.meter);
      stream.onended = this.meter.stop.bind(this.meter);
    });
  }

  componentWillReceiveProps({ active }) {
    if (active !== this.props.active) {
      this.setState({ active });

      if (!this.siriWave) return;
      if (active) this.siriWave.start();
      else
        setTimeout(() => {
          this.siriWave.stop();
        }, 300);
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div />;
  }
}
