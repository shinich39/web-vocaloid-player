import React, { useEffect, useRef, useState } from "react";
// import pako from "pako";

const latestTemplate = {
  "nicovideo": {
      "size": 315025,
      "updatedAt": "2025-12-16T07:42:42.942Z"
  },
  "piapro": {
      "size": 230567,
      "updatedAt": "2025-12-16T07:45:19.841Z"
  },
  "dc": {
      "size": 46184,
      "updatedAt": "2025-12-16T07:44:43.468Z"
  },
  "size": 566467,
  "updatedAt": "2025-12-16T07:45:19.841Z"
} as const;

type Latest = typeof latestTemplate;
type Data = {
  type: "youtube" | "nicovideo" | "piapro",
  title: string,
  user?: string,
  id: string,
  originalUrl: string,
  // embedUrl: string,
}

export default function Container() {
  const [latest, setLatest] = useState<Latest>();
  const [data, setData] = useState<Data[]>([]);
  const [playing, setPlaying] = useState<Data | null>(null);
  const [filteredPlaylist, setFilteredPlaylist] = useState<Data[]>([]);
  const [displayedPlaylist, setDisplayedPlaylist] = useState<Data[]>([]);
  const [playlistOffset, setPlaylistOffset] = useState(0);
  const [playlistLimit, setPlaylistLimit] = useState(10);

  const [searchTypes, setSearchTypes] = useState<string[]>(["nicovideo", "piapro", "youtube"]);
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

  const playHandler = (d: Data) => {
    setPlaying(d);
  }

  useEffect(() => {
    ;(async () => {
      const response = await fetch("https://shinich39.github.io/web-vocaloid-player/datasets/latest.json", { method: "GET" });
      const json = await response.json() as Latest;
      setLatest(json);
    })();

    ;(async () => {
      const response = await fetch("https://shinich39.github.io/web-vocaloid-player/datasets/data.json.gz", { method: "GET" });
      if (response.headers.get("content-encoding") === "gzip") {
        const json = await response.json() as Data[];
        setData(json);
      } else {
        // const arrayBuffer = await response.arrayBuffer();
        // const buffer = new Uint8Array(arrayBuffer);
        // const str = pako.ungzip(buffer, { to: "string" });
        // const json = JSON.parse(str) as Data[];
        // setData(json);
      }
    })();
  }, []);

  useEffect(() => {
    if (!latest || !data) {
      return;
    }

    console.log(latest, data);
  }, [latest, data]);

  useEffect(() => {
    if (!latest || !data) {
      return;
    }

    const arr: Data[] = [];

    for (const d of data) {

      if (!searchTypes.includes(d.type)) {
        continue;
      }

      if (searchText && !d.title.includes(searchText)) {
        continue;
      }

      arr.push(d);
    }

    shuffle(arr);

    setFilteredPlaylist(arr);
  }, [latest, data, searchText, searchTypes]);

  useEffect(() => {
    const arr = filteredPlaylist.slice(playlistOffset, playlistOffset + playlistLimit);
    setDisplayedPlaylist(arr);
  }, [filteredPlaylist, playlistLimit, playlistOffset]);

  return (
    <>
      <section>
        <h2>Datasets</h2>
        <ul>
          {
            !latest || !data
              ? <li>Loading...</li>
              : <>
                  <li>Nicovideo: {latest.nicovideo.size}, {latest.nicovideo.updatedAt}</li>
                  <li>Piapro: {latest.piapro.size}, {latest.piapro.updatedAt}</li>
                  <li>DC (Mixed types): {latest.dc.size}, {latest.dc.updatedAt}</li>
                </>
          }
        </ul>
      </section>

      <section>
        <h2>Search</h2>

        <div>
          {
            ["nicovideo", "piapro", "youtube"].map((type, i) => {
              const isChecked = searchTypes.includes(type);
              return (
                <label key={`type-checkbox-${i}`}>
                  <input
                    type="checkbox"
                    value={type}
                    onClick={() => {
                      !isChecked
                        ? setSearchTypes([...new Set(searchTypes), type])
                        : setSearchTypes(searchTypes.filter((t) => t !== type));
                    }}
                    defaultChecked={isChecked} />
                  {type}
                </label>
              )
            })
          }
        </div>

        <div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value) }
            placeholder="Type text to search"/>
        </div>

      </section>

      <section>
        <h2>Playlist ({filteredPlaylist.length})</h2>

        <div>
          <button onClick={prevHandler}>Prev</button>
          {" "}
          <button onClick={nextHandler}>Next</button>
        </div>

        <ol>
          {
            displayedPlaylist.map((item, i) => {
              return (
                <li key={`playlist-${i}`}>
                  [{item.type}]
                  {" "}
                  {item.title}
                  {" "}
                  <button onClick={() => playHandler(item)}>Play</button>
                  {" "}
                  <a href={item.originalUrl}>Link</a>
                </li>
              )
            })
          }
        </ol>
        
      </section>

      <section>
        {
          playing &&
            <>
              <h3>
                <a href={playing.originalUrl}>
                  {playing.title}
                </a>
              </h3>

              {
                playing.type === "youtube"
                  ? <>
                      <iframe width="560" height="315"
                        src={"https://www.youtube.com/embed/" + playing.id}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                      </iframe>
                    </>
                  : playing.type === "nicovideo"
                  ? <>
                      <iframe
                        width="640"
                        height="360"
                        src={"https://embed.nicovideo.jp/watch/" + playing.id}
                        allowFullScreen
                      ></iframe>
                    </>
                  : playing.type === "piapro"
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