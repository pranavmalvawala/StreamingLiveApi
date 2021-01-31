import { controller, httpGet, requestParam, HttpResponseMessage, StringContent } from "inversify-express-utils";
import express from "express";
import { Setting, Service } from "../models";
import { ConfigHelper, SubDomainHelper } from "../helpers";
import { StreamingLiveBaseController } from "./StreamingLiveBaseController";
import { Link } from "../apiBase/models"

@controller("/preview")
export class PreviewController extends StreamingLiveBaseController {
    @httpGet("/data/:key")
    public async loadData(@requestParam("key") key: string, req: express.Request, res: express.Response): Promise<any> {
        try {
            const churchId = await SubDomainHelper.getId(key);
            const settings: Setting = await this.repositories.setting.loadByChurchId(churchId);
            let tabs: Link[] = null;
            let links: Link[] = null;
            let services: Service[] = null;

            const promises: Promise<any>[] = [];
            promises.push(this.baseRepositories.link.loadByCategory(settings.churchId, 'tab').then(d => tabs = d));
            promises.push(this.baseRepositories.link.loadByCategory(settings.churchId, 'link').then(d => links = d));
            promises.push(this.repositories.service.loadAll(settings.churchId).then(d => services = d));
            await Promise.all(promises);

            const result = ConfigHelper.generateJson(settings, tabs, links, services);
            return this.json(result, 200);
        } catch (e) {
            this.logger.error(e);
            return this.internalServerError(e);
        }
    }

    @httpGet("/css/:key")
    public async loadCss(@requestParam("key") key: string, req: express.Request, res: express.Response): Promise<any> {
        try {
            const churchId = await SubDomainHelper.getId(key);
            const settings: Setting = await this.repositories.setting.loadByChurchId(churchId);
            const result = ConfigHelper.generateCss(settings);
            const resp = new HttpResponseMessage(200);
            resp.content = new StringContent(result, "text/css");
            return resp;
        } catch (e) {
            this.logger.error(e);
            return this.internalServerError(e);
        }
    }


}
