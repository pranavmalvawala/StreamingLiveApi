import { controller, httpPost, httpGet, httpDelete, requestParam } from "inversify-express-utils";
import express from "express";
import { Service } from "../models";
import { StreamingLiveBaseController } from "./StreamingLiveBaseController";
import { Permissions } from "../helpers/Permissions";
import { DateTimeHelper } from '../helpers'

@controller("/services")
export class ServiceController extends StreamingLiveBaseController {
    @httpGet("/")
    public async loadAll(req: express.Request, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            const services = await this.repositories.service.loadAll(au.churchId);
            const promises: Promise<any>[] = []
            services.forEach((s, index, allServices) => {
                // Update service time
                if (s.serviceTime < DateTimeHelper.subtractHoursFromNow(6)) {
                    if(!s.recurring) {
                        promises.push(this.repositories.service.delete(s.id, s.churchId));
                        allServices.splice(index, 1)
                    } else {
                        s.serviceTime.setDate(s.serviceTime.getDate() + 7);
                        promises.push(this.repositories.service.save(s));
                    }
                }
                s.serviceTime.setMinutes(s.serviceTime.getMinutes() - s.timezoneOffset);
            })
            await Promise.all(promises);

            return services;
        });
    }

    @httpDelete("/:id")
    public async delete(@requestParam("id") id: string, req: express.Request, res: express.Response): Promise<void> {
        return this.actionWrapper(req, res, async (au) => {
            if (!au.checkAccess(Permissions.services.edit)) return this.json({}, 401);
            else {
                await this.repositories.service.delete(id, au.churchId);
                return null;
            }
        });
    }

    @httpPost("/")
    public async save(req: express.Request<{}, {}, Service[]>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            if (!au.checkAccess(Permissions.services.edit)) return this.json({}, 401);
            else {
                let services: Service[] = req.body;
                const promises: Promise<Service>[] = [];
                services.forEach((service) => { if (service.churchId === au.churchId) promises.push(this.repositories.service.save(service)); });
                services = await Promise.all(promises);
                return this.json(services, 200);
            }
        });
    }

}
