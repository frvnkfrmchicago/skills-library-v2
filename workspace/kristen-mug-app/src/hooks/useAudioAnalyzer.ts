import { useRef, useCallback } from 'react';

export interface AudioAnalyzerResult {
  init: (audioElement: HTMLAudioElement) => void;
  getAverageFrequency: () => number;
  getFrequencyData: () => Uint8Array | null;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
}

export function useAudioAnalyzer(): AudioAnalyzerResult {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const init = useCallback((audioElement: HTMLAudioElement) => {
    if (audioContextRef.current) return; // Already initialized

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      // Create analyser node
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // Low fftSize for responsive, high-level features (steam & bass scale)
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Connect source element to analyser and destination
      // Add crossOrigin: 'anonymous' to audio element so CORS doesn't block analysis of remote links
      audioElement.crossOrigin = 'anonymous';
      const source = audioCtx.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      sourceRef.current = source;

      // Resume context if suspended (browser security policy)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      console.log('Audio analyser initialized successfully.');
    } catch (error) {
      console.warn('Web Audio API not fully supported or blocked: ', error);
    }
  }, []);

  const getAverageFrequency = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return 0;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    return sum / dataArrayRef.current.length; // Returns value between 0 and 255
  }, []);

  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return null;
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
    return dataArrayRef.current;
  }, []);

  return {
    init,
    getAverageFrequency,
    getFrequencyData,
    analyserRef
  };
}
