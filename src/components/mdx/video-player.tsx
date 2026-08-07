"use client";

// 54 KB of CSS and a media-engine's worth of JS. This module is only ever
// reached through the dynamic import in video-mount.tsx, which is what keeps
// both out of the bundle for the posts that have no video in them.
import "@videojs/react/video/skin.css";

import { createPlayer } from "@videojs/react";
import { Video, VideoSkin, videoFeatures } from "@videojs/react/video";

// Created once at module scope, not per render — createPlayer builds the
// state store and feature graph, and doing that inside a component would
// rebuild the player on every re-render.
const Player = createPlayer({ features: videoFeatures });

/**
 * The stock Video.js v10 default skin.
 *
 * Video.js ships this exact UI as `<VideoSkin>` — controls, settings menu,
 * hotkeys, gestures, AirPlay/Cast, the lot. The "eject the skin" recipe in
 * their docs reproduces it as ~700 lines of local TSX plus ~1500 lines of CSS,
 * which is worth doing only to change the design or the control set. Neither
 * applies here, so we take the shipped one and stay on their upgrade path.
 */
export function VideoPlayer({
  src,
  poster,
  placeholder,
}: {
  src: string;
  poster?: string;
  placeholder?: string;
}) {
  return (
    <Player.Provider>
      <VideoSkin
        poster={poster}
        placeholder={placeholder}
        // The frame around it owns the corner radius and clips to it, so the
        // player's own 1.75rem default would round a second time inside an
        // already-rounded box.
        className="[--media-border-radius:0px]"
      >
        <Video src={src} playsInline />
      </VideoSkin>
    </Player.Provider>
  );
}
