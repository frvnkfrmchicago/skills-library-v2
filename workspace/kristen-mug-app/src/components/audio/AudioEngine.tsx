import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Link as LinkIcon, Video, HelpCircle } from 'lucide-react';

interface AudioEngineProps {
  analyserInit: (audioElement: HTMLAudioElement) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

interface Track {
  title: string;
  artist: string;
  url: string;
  duration: string;
}

const DEFAULT_PLAYLIST: Track[] = [
  {
    title: "Morning Espresso Lofi",
    artist: "Barbie Dream Lounge",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12"
  },
  {
    title: "Barbie Pink Sunset",
    artist: "Cozy Café Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "7:05"
  },
  {
    title: "Late Night Mug Brew",
    artist: "Sip & Chill",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "5:44"
  },
  {
    title: "Kristen's Lofi Waltz",
    artist: "Chopin Lofi Project",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "5:02"
  }
];

export default function AudioEngine({ analyserInit, isPlaying, setIsPlaying }: AudioEngineProps) {
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = playlist[currentTrackIndex];

  // Sync state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // Initialize analyser on user interaction
        analyserInit(audioRef.current);
        audioRef.current.play().catch(e => {
          console.warn("Autoplay blocked or play failed: ", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, analyserInit, setIsPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnded = () => {
    handleNextTrack();
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Convert seconds to MM:SS format
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Paste Link Handler (Supports Youtube, Spotify, MP3 links)
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setEmbedUrl(null);
    
    if (!customUrl) return;

    // Check if Spotify track URL
    if (customUrl.includes("spotify.com")) {
      let embedLink = customUrl;
      if (customUrl.includes("/track/")) {
        embedLink = customUrl.replace("open.spotify.com", "open.spotify.com/embed");
      }
      setEmbedUrl(embedLink);
      setIsPlaying(false); // Stop local HTML5 player
      setCustomUrl("");
      return;
    }

    // Check if YouTube URL
    if (customUrl.includes("youtube.com") || customUrl.includes("youtu.be")) {
      let videoId = "";
      if (customUrl.includes("v=")) {
        videoId = customUrl.split("v=")[1].split("&")[0];
      } else if (customUrl.includes("youtu.be/")) {
        videoId = customUrl.split("youtu.be/")[1].split("?")[0];
      }
      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
        setIsPlaying(false); // Stop local HTML5 player
        setCustomUrl("");
      } else {
        setErrorMessage("Could not extract YouTube video ID.");
      }
      return;
    }

    // Assume it's a direct audio link (.mp3, .ogg, .wav, etc.)
    if (customUrl.startsWith("http://") || customUrl.startsWith("https://")) {
      const newTrack: Track = {
        title: "Pasted Custom Track",
        artist: "Web Audio Stream",
        url: customUrl,
        duration: "--:--"
      };

      setPlaylist([...playlist, newTrack]);
      setCurrentTrackIndex(playlist.length); // Play the new track
      setIsPlaying(true);
      setCustomUrl("");
    } else {
      setErrorMessage("Please enter a valid HTTP/HTTPS URL.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
      />

      {/* Track Details & Visualizer Bars */}
      <div className="player-track-info">
        <div className="track-details">
          <h3 className="truncate max-w-200">
            {currentTrack.title}
          </h3>
          <p className="truncate max-w-200">
            {currentTrack.artist}
          </p>
        </div>
        {/* Cute dancing sound wave */}
        <div className="flex items-end h-7 pr-2" style={{ gap: '3px' }}>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="steam-particle"
              style={{ 
                width: '3px',
                backgroundColor: '#ff69b4',
                borderTopLeftRadius: '2px',
                borderTopRightRadius: '2px',
                transition: 'all 0.3s ease',
                height: isPlaying ? `${12 + Math.sin(i * 1.5) * 14}px` : '4px',
                animation: isPlaying ? 'steam-drift 1.5s infinite ease-in-out' : 'none',
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrub bar */}
      <div className="scrub-container">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleScrub}
          className="range-input"
        />
        <div className="time-row">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Action Buttons */}
      <div className="controls-row">
        <button onClick={handlePrevTrack} className="action-icon-btn">
          <SkipBack size={20} />
        </button>

        <button onClick={togglePlay} className="play-pause-btn">
          {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" style={{ marginLeft: '2px' }} />}
        </button>

        <button onClick={handleNextTrack} className="action-icon-btn">
          <SkipForward size={20} />
        </button>
      </div>

      {/* Volume slider */}
      <div className="volume-row">
        <div className="volume-icon">
          <Volume2 size={16} />
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="range-input"
        />
      </div>

      {/* Custom URL Input Form */}
      <form onSubmit={handleAddLink} className="flex flex-col gap-2">
        <label className="input-label flex items-center" style={{ gap: '6px' }}>
          <LinkIcon size={12} />
          Paste Kristen's Favorite Song Link
        </label>
        <div className="url-input-container">
          <input
            type="text"
            placeholder="YouTube, Spotify, or direct MP3 link..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="input-text"
          />
          <button type="submit" className="url-input-btn">
            Add
          </button>
        </div>
        
        {errorMessage && (
          <p className="url-input-error">{errorMessage}</p>
        )}
        
        <p className="url-input-tip">
          <HelpCircle size={10} />
          MP3 URLs drive the 3D visualizer; Spotify/YT load a widget!
        </p>
      </form>

      {/* External Widget Embed Section */}
      {embedUrl && (
        <div className="embed-container animate-float">
          <div className="embed-header">
            <span className="embed-header-left">
              <Video size={14} style={{ color: '#ef4444' }} />
              Embedded Player
            </span>
            <button onClick={() => setEmbedUrl(null)} className="embed-close-btn">
              Close
            </button>
          </div>
          <iframe
            src={embedUrl}
            width="100%"
            height={embedUrl.includes("spotify") ? "80" : "160"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="embed-frame"
          />
        </div>
      )}

      {/* Quick Playlists Selectors */}
      <div className="flex flex-col gap-2">
        <h4 className="playlist-title">
          Tracks Cozy Coffee Shop
        </h4>
        <div className="playlist-scroller">
          {playlist.map((track, idx) => (
            <button
              key={idx}
              onClick={() => {
                setEmbedUrl(null);
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
              className={`playlist-btn ${idx === currentTrackIndex && !embedUrl ? 'active' : ''}`}
            >
              <span className="truncate max-w-170">{track.title}</span>
              <span className="playlist-duration">{track.duration}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
