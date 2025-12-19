import React, { useEffect, useRef, useState } from "react";
import pako from "pako";
import type { PlayerItem, PlayerLatest } from "../types/common";

export default function Container() {
  const [latest, setLatest] = useState<PlayerLatest>();
  const [data, setData] = useState<PlayerItem[]>([]);
  const [playing, setPlaying] = useState<PlayerItem | null>(null);
  const [filteredPlaylist, setFilteredPlaylist] = useState<PlayerItem[]>([]);
  const [displayedPlaylist, setDisplayedPlaylist] = useState<PlayerItem[]>([]);
  const [playlistOffset, setPlaylistOffset] = useState(0);
  const [playlistLimit, setPlaylistLimit] = useState(10);

  const [searchProviders, setSearchProviders] = useState<string[]>(["nicovideo", "piapro", "youtube"]);
  const [searchText, setSearchText] = useState("");

  function shuffle<T>(array: T[]) {
    array.sort(() => Math.random() - 0.5);
  }

  const nextHandler = () => {
    const v = Math.min(filteredPlaylist.length - playlistLimit, playlistOffset + playlistLimit);
    setPlaylistOffset(v);
  }

  const prevHandler = () => {
    const v = Math.max(0, playlistOffset - playlistLimit);
    setPlaylistOffset(v);
  }

  const playHandler = (d: PlayerItem) => {
    setPlaying(d);
  }

  function createUrl(provider: string, id: string) {
    switch(provider) {
      case "youtube": return createYoutubeUrl(id);
      case "nicovideo": return createNicoUrl(id);
      case "piapro": return createPiaproUrl(id);
    }
    return "";
  }

  function createYoutubeUrl(id: string) {
    return `https://www.youtube.com/watch?v=${id}`;
  }

  function createYoutubeEmbedUrl(id: string) {
    return `https://www.youtube.com/embed/${id}`;
  }

  function createNicoUrl(id: string) {
    return `https://www.nicovideo.jp/watch/${id}`;
  }

  function createNicoEmbedUrl(id: string) {
    return `https://embed.nicovideo.jp/watch/${id}`;
  }

  function createPiaproUrl(id: string) {
    return `https://piapro.jp/t/${id}`;
  }

  function createPiaproEmbedUrl(id: string) {
    return `https://piapro.jp/widget/${id}`;
  }


  useEffect(() => {
    // https://raw.githubusercontent.com/shinich39/web-vocaloid-player/main/datasets/latest.json
    const base = `https://raw.githubusercontent.com/shinich39/web-vocaloid-player/main`;

    ;(async () => {
      // const response = await fetch("/web-vocaloid-player/datasets/latest.json", { method: "GET" });
      const response = await fetch(base + "/datasets/latest.json", { method: "GET" });
      const json = await response.json() as PlayerLatest;
      setLatest(json);
    })();

    ;(async () => {
      const response = await fetch(base + "/datasets/data.json.gz", { method: "GET" });
      if (response.headers.get("content-encoding") === "gzip") {
        const json = await response.json() as PlayerItem[];
        setData(json);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const str = pako.ungzip(buffer, { to: "string" });
        const json = JSON.parse(str) as PlayerItem[];
        setData(json);
      }
    })();
  }, []);

  useEffect(() => {
    if (!latest || data.length < 1) {
      return;
    }

    console.log(latest, data);
  }, [latest, data]);

  useEffect(() => {
    if (!latest || !data) {
      return;
    }

    const arr: PlayerItem[] = [];

    for (const d of data) {

      if (!searchProviders.includes(d.provider)) {
        continue;
      }

      if (searchText && !d.title.includes(searchText)) {
        continue;
      }

      arr.push(d);
    }

    shuffle(arr);

    setFilteredPlaylist(arr);
  }, [latest, data, searchText, searchProviders]);

  useEffect(() => {
    const arr = filteredPlaylist.slice(playlistOffset, playlistOffset + playlistLimit);
    setDisplayedPlaylist(arr);
  }, [filteredPlaylist, playlistLimit, playlistOffset]);

  return (
    <>
      <section>
        <h2>Datasets</h2>

        
        {
          !latest || !data
            ? <div>Loading...</div>
            : <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nicovideo</td>
                    <td>{latest.nicovideoSize}</td>
                    <td>{new Date(latest.nicovideoUpdatedAt).toISOString()}</td>
                  </tr>
                  <tr>
                    <td>Piapro</td>
                    <td>{latest.piaproSize}</td>
                    <td>{new Date(latest.piaproUpdatedAt).toISOString()}</td>
                  </tr>
                  <tr>
                    <td>DC (Mixed type)</td>
                    <td>{latest.dcSize}</td>
                    <td>{new Date(latest.dcUpdatedAt).toISOString()}</td>
                  </tr>
                </tbody>
              </table>
        }
      </section>

      <section>
        <h2>Filter</h2>

        <div>
          {
            ["nicovideo", "piapro", "youtube"].map((provider, i) => {
              const isChecked = searchProviders.includes(provider);
              return (
                <label key={`provider-checkbox-${i}`}>
                  <input
                    type="checkbox"
                    value={provider}
                    onClick={() => {
                      !isChecked
                        ? setSearchProviders([...new Set(searchProviders), provider])
                        : setSearchProviders(searchProviders.filter((t) => t !== provider));
                    }}
                    defaultChecked={isChecked} />
                  {provider}
                </label>
              )
            })
          }
        </div>

        {/* <div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value) }
            placeholder="Type text to search"/>
        </div> */}

      </section>

      <section>
        <h2>Playlist ({filteredPlaylist.length})</h2>

        <div>
          <button onClick={prevHandler}>Prev</button>
          {" "}
          <button onClick={nextHandler}>Next</button>
        </div>

        <br />

        <div>
          {
            displayedPlaylist.map((item, i) => {
              return (
                <div key={`playlist-${i}`}>
                  {playlistOffset + i}.
                  {" "}
                  [{item.type}]
                  {" "}
                  <a href={createUrl(item.provider, item.id)} target="_blank">{item.title}</a>
                  {" "}
                  <button onClick={() => playHandler(item)} disabled={item.type === "piapro"}>Play</button>
                  {" "}
                </div>
              )
            })
          }
        </div>
        
      </section>

      <section>
        {
          playing &&
            <>
              <h3>
                <a href={createUrl(playing.provider, playing.id)} target="_blank">
                  {playing.title}
                </a>
              </h3>

              {
                playing.provider === "youtube"
                  ? <>
                      <iframe width="560" height="315"
                        src={"https://www.youtube.com/embed/" + playing.id}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                      </iframe>
                    </>
                  : playing.provider === "nicovideo"
                  ? <>
                      <iframe
                        width="640"
                        height="360"
                        src={"https://embed.nicovideo.jp/watch/" + playing.id}
                        allowFullScreen
                      ></iframe>
                    </>
                  : playing.provider === "piapro"
                  ? <>
                      <iframe
                        src={"https://piapro.jp/widget/" + playing.id}
                        width="512"
                        height="360"
                        allow="autoplay"
                      ></iframe>
                    </>
                  : null
              }
            </>
        }

      </section>
    </>
  )
}