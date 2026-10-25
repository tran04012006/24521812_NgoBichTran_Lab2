import type { AudioTrack } from "../types";

/**
 * Real audio tracks for FIFO integration.
 *
 * Three track records temporarily reference
 * the same MP3 file.
 *
 * Replace the URLs when separate MP3 files
 * become available.
 */
export const mockTracks: AudioTrack[] = [
  {
    id: "track-1",
    title: "Song A",
    url: "/audio/song-a.mp3",
  },
  {
    id: "track-2",
    title: "Song B",
    url: "/audio/song-b.mp3",
  },
  {
    id: "track-3",
    title: "Song C",
    url: "/audio/song-c.mp3",
  },
];