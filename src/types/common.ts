export type PlayerItem = {
  type: "dc" | "nicovideo" | "piapro",
  provider: "youtube" | "nicovideo" | "piapro",
  title: string,
  user?: string,
  id: string,
}

export type PlayerLatest = {
  nicovideoUpdatedAt: number,
  nicovideoSize: number,
  piaproUpdatedAt: number,
  piaproSize: number,
  dcUpdatedAt: number,
  dcSize: number,
  totalUpdatedAt: number,
  totalSize: number,
}