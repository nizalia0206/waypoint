import { useRef, useState } from 'react';
import { useSite } from '../context/SiteContext';

const STEP_DURATION_MS = 4200;

export default function RecordDemo() {
  const { t, startTour, setTourStep, endTour } = useSite();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const stepTimerRef = useRef(null);
  const streamRef = useRef(null);

  const totalSteps = t.tour.steps.length;
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getDisplayMedia && typeof MediaRecorder !== 'undefined';

  const cleanup = () => {
    clearInterval(stepTimerRef.current);
    stepTimerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!supported || recording) return;
    setError(null);

    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
        preferCurrentTab: true,
      });
    } catch (err) {
      setError(t.record.permissionDenied);
      return;
    }
    streamRef.current = stream;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'waypoint-demo.webm';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setRecording(false);
    };

    // If the person stops sharing via the browser's own UI, wrap up gracefully
    // instead of leaving the recorder hanging.
    const [track] = stream.getVideoTracks();
    if (track) {
      track.addEventListener('ended', () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        cleanup();
      });
    }

    recorder.start();
    setRecording(true);

    startTour();
    let step = 0;
    stepTimerRef.current = setInterval(() => {
      step += 1;
      if (step >= totalSteps) {
        clearInterval(stepTimerRef.current);
        setTimeout(() => {
          endTour();
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
          cleanup();
        }, STEP_DURATION_MS);
        return;
      }
      setTourStep(step);
    }, STEP_DURATION_MS);
  };

  if (!supported) {
    return <p className="record-demo-error">{t.record.unsupported}</p>;
  }

  return (
    <div className="record-demo">
      <button className="record-demo-btn" onClick={startRecording} disabled={recording}>
        {recording ? t.record.recording : t.record.button}
      </button>
      <p className="record-demo-help">{t.record.helpText}</p>
      {error && <p className="record-demo-error">{error}</p>}
    </div>
  );
}
