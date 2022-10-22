import { ServiceRepository } from ".";
import { PlaylistRepository } from "./PlaylistRepository";
import { SermonRepository } from "./SermonRepository";

export class Repositories {
  public service: ServiceRepository;
  public playlist: PlaylistRepository;
  public sermon: SermonRepository;

  private static _current: Repositories = null;
  public static getCurrent = () => {
    if (Repositories._current === null) Repositories._current = new Repositories();
    return Repositories._current;
  }

  constructor() {
    this.service = new ServiceRepository();
    this.playlist = new PlaylistRepository();
    this.sermon = new SermonRepository();
  }
}
