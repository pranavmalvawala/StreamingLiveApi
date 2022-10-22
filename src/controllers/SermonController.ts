import { controller, httpPost, httpGet, httpDelete, requestParam } from "inversify-express-utils";
import express from "express";
import { Sermon } from "../models";
import { StreamingLiveBaseController } from "./StreamingLiveBaseController";
import { Permissions } from "../helpers/Permissions";
import { YouTubeHelper, FileHelper, Environment } from "../helpers";

@controller("/sermons")
export class SermonController extends StreamingLiveBaseController {

  @httpGet("/lookup")
  public async lookup(req: express.Request<{}, {}, null>, res: express.Response): Promise<any> {
    return this.actionWrapperAnon(req, res, async () => {
      return await YouTubeHelper.getSermon(req.query.videoData as string);
    });
  }

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.sermon.loadById(id, au.churchId);
    });
  }

  @httpGet("/")
  public async loadAll(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.sermon.loadAll(au.churchId);
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request, res: express.Response): Promise<void> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.services.edit)) return this.json({}, 401);
      else {
        await this.repositories.sermon.delete(id, au.churchId);
        return null;
      }
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Sermon[]>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.services.edit)) return this.json({}, 401);
      else {
        let sermons: Sermon[] = req.body;
        const promises: Promise<Sermon>[] = [];
        for (const s of sermons) {
          let base64Photo = "";
          if (s.thumbnail !== undefined && s.thumbnail.startsWith("data:image/png;base64,")) {
            base64Photo = s.thumbnail;
            s.thumbnail = "";
          }
          if (s.churchId === au.churchId) promises.push(
            this.repositories.sermon.save(s).then(async (sermon) => {
              if (base64Photo) {
                sermon.thumbnail = base64Photo;
                await this.savePhoto(au.churchId, sermon);
              }
              return sermon;
            })
          );
        };
        sermons = await Promise.all(promises);
        return this.json(sermons, 200);
      }
    });
  }

  private async savePhoto(churchId: string, sermon: Sermon) {
    const base64 = sermon.thumbnail.split(',')[1];
    const key = "/" + churchId + "/streamingLive/sermons/" + sermon.id + ".png";

    return FileHelper.store(key, "image/png", Buffer.from(base64, 'base64')).then(async () => {
      const photoUpdated = new Date();
      sermon.thumbnail = Environment.contentRoot + key + "?dt=" + photoUpdated.getTime().toString();
      await this.repositories.sermon.save(sermon);
    });
  }

}
