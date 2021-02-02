import { controller, httpPost, httpGet, requestParam } from "inversify-express-utils";
import express from "express";
import { SettingsHelper, SubDomainHelper, AwsHelper } from "../helpers";
import { Setting, } from "../models";
import { StreamingLiveBaseController } from "./StreamingLiveBaseController";
import { Permissions } from "../helpers/Permissions";


@controller("/settings")
export class CustomSettingController extends StreamingLiveBaseController {
    @httpGet("/")
    public async loadAll(req: express.Request, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            return await this.repositories.setting.loadAll(au.churchId);
        });
    }

    @httpPost("/")
    public async save(req: express.Request<{}, {}, Setting[]>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            if (!au.checkAccess(Permissions.settings.edit)) return this.json({}, 401);
            else {
                const subDomain = await SubDomainHelper.get(au.churchId);
                let settings: Setting[] = req.body;
                const promises: Promise<Setting>[] = [];
                settings.forEach((setting) => {
                    if (setting.churchId === au.churchId) {
                        const promise = new Promise<Setting>(async (resolve, reject) => {
                            try {
                                if (setting.logoUrl.indexOf(',') > -1) {
                                    await this.saveLogo(subDomain, setting);
                                    setting.logoUrl = "/data/" + subDomain + "/logo.png";
                                }
                                const s = await this.repositories.setting.save(setting);
                                resolve(s);
                            } catch (e) {
                                reject(e);
                            }
                        });
                        promises.push(promise);
                    }
                });
                settings = await Promise.all(promises);
                return this.json(settings, 200);
            }
        });
    }

    private async saveLogo(subDomain: string, setting: Setting) {
        const base64 = setting.logoUrl.split(',')[1];
        const key = "data/" + subDomain + "/logo.png";
        await AwsHelper.S3Upload(key, "image/png", Buffer.from(base64, 'base64'))
    }

    @httpPost("/publish")
    public async publish(req: express.Request<{}, {}, []>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            await SettingsHelper.publish(au.churchId, this.repositories, this.baseRepositories);
            return this.json([], 200);
        });
    }

}
