import { DB } from "../apiBase/db";
import { Playlist } from "../models";
import { UniqueIdHelper, DateTimeHelper } from "../helpers";

export class PlaylistRepository {

  public save(playlist: Playlist) {
    return playlist.id ? this.update(playlist) : this.create(playlist);
  }

  private async create(playlist: Playlist) {
    playlist.id = UniqueIdHelper.shortId();
    const sql = "INSERT INTO playlists (id, churchId, title, description, publishDate, thumbnail) VALUES (?, ?, ?, ?, ?, ?);";
    const params = [playlist.id, playlist.churchId, playlist.title, playlist.description, playlist.publishDate, playlist.thumbnail];
    await DB.query(sql, params);
    return playlist;
  }

  private async update(playlist: Playlist) {
    const sql = "UPDATE playlists SET title=?, description=?, publishDate=?, thumbnail=? WHERE id=? and churchId=?;";
    const params = [playlist.title, playlist.description, playlist.publishDate, playlist.thumbnail, playlist.id, playlist.churchId];
    await DB.query(sql, params);
    return playlist;
  }

  public delete(id: string, churchId: string) {
    return DB.query("DELETE FROM playlists WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadById(id: string, churchId: string): Promise<Playlist> {
    return DB.queryOne("SELECT * FROM playlists WHERE id=? AND churchId=?;", [id]);
  }

  public loadAll(churchId: string): Promise<Playlist[]> {
    return DB.query("SELECT * FROM playlists WHERE churchId=? ORDER BY publishDate desc;", [churchId]);
  }

}
