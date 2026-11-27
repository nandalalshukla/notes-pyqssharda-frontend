"use client";

import { useEffect, useRef, useState } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";

const AUDIO_PARTS = [
  "/audio/study-music/part-00.mp3",
  "/audio/study-music/part-01.mp3",
  "/audio/study-music/part-02.mp3",
  "/audio/study-music/part-03.mp3",
];
const DEFAULT_VOLUME = 0.35;

export default function LibraryMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [currentPart, setCurrentPart] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = DEFAULT_VOLUME;
    audio.muted = false;
    // Playback starts only after a student requests it. Downloading the MP3
    // during navigation competes with the page's LCP on mobile connections.
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
    audio.muted = isMuted;
    if (currentPart > 0) {
      audio.play().catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "NotAllowedError")) {
          console.error("Study music could not continue.", error);
        }
      });
    }
  }, [currentPart, isMuted, volume]);

  const playNextPart = () => {
    setCurrentPart((part) => (part + 1) % AUDIO_PARTS.length);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      audio.muted = false;
      setIsMuted(false);
      audio.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          return;
        }

        console.error("Study music could not be played.", error);
      });
    } else {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    const audio = audioRef.current;
    setVolume(nextVolume);

    if (audio) {
      audio.volume = nextVolume;
      if (nextVolume > 0 && audio.muted) {
        audio.muted = false;
        setIsMuted(false);
      }
      if (audio.paused && nextVolume > 0) {
        audio.play().catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === "NotAllowedError")) {
            console.error("Study music could not be played.", error);
          }
        });
      }
    }
  };

  return (
    <div className="group fixed top-20 right-4 z-50">
      <audio
        ref={audioRef}
        src={AUDIO_PARTS[currentPart]}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={playNextPart}
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
      />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={!isPlaying ? "Play study music" : isMuted ? "Unmute study music" : "Mute study music"}
        title={!isPlaying ? "Play study music" : isMuted ? "Unmute study music" : "Mute study music"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-soft-md backdrop-blur transition hover:scale-105 hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {!isPlaying || isMuted || volume === 0 ? (
          <VolumeX className="h-5 w-5" aria-hidden="true" />
        ) : volume < 0.5 ? (
          <Volume1 className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
      <label
        className="pointer-events-none absolute top-1/2 right-full z-10 flex -translate-y-1/2 items-center rounded-full border border-border bg-card/95 px-3 py-2 opacity-0 shadow-soft-md transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
        title="Study music volume"
      >
        <span className="sr-only">Study music volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Study music volume"
          className="h-1 w-24 cursor-pointer accent-primary"
        />
      </label>
    </div>
  );
}
