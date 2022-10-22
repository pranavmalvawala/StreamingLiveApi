import { controller, httpPost, httpGet, httpDelete, requestParam } from "inversify-express-utils";
import express from "express";
import { Playlist } from "../models";
import { StreamingLiveBaseController } from "./StreamingLiveBaseController";
import { Permissions } from "../helpers/Permissions";
import { Environment, FileHelper } from "../helpers";

@controller("/playlists")
export class PlaylistController extends StreamingLiveBaseController {

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.playlist.loadById(id, au.churchId);
    });
  }

  @httpGet("/")
  public async loadAll(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.playlist.loadAll(au.churchId)
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request, res: express.Response): Promise<void> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.services.edit)) return this.json({}, 401);
      else {
        await this.repositories.playlist.delete(id, au.churchId);
        return null;
      }
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Playlist[]>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.services.edit)) return this.json({}, 401);
      else {
        let playlists: Playlist[] = req.body;
        const promises: Promise<Playlist>[] = [];
        // playlist.forEach((s) => { if (s.churchId === au.churchId) promises.push(this.repositories.playlist.save(s)); });

        for (const p of playlists) {
          let base64Photo = "";
          if (p.thumbnail && p.thumbnail.startsWith("data:image/png;base64,")) {
            base64Photo = p.thumbnail;
            p.thumbnail = "";
          }
          if (p.churchId === au.churchId) promises.push(
            this.repositories.playlist.save(p).then(async (playlist: Playlist) => {
              if (base64Photo) {
                playlist.thumbnail = base64Photo;
                await this.savePhoto(au.churchId, playlist);
              }
              return playlist;
            })
          );
        };

        playlists = await Promise.all(promises);
        return this.json(playlists, 200);
      }
    });
  }


  private async savePhoto(churchId: string, playlist: Playlist) {
    const base64 = playlist.thumbnail.split(',')[1];
    const key = "/" + churchId + "/streamingLive/playlists/" + playlist.id + ".png";

    return FileHelper.store(key, "image/png", Buffer.from(base64, "base64")).then(async () => {
      const photoUpdated = new Date();
      playlist.thumbnail = Environment.contentRoot + key + "?dt=" + photoUpdated.getTime().toString();
      await this.repositories.playlist.save(playlist);
    });
  }

}
