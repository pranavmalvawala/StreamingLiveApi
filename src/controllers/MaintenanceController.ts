import { controller, httpGet } from "inversify-express-utils";
import express from "express";
import { StreamingLiveBaseController } from "./StreamingLiveBaseController";

@controller("/maintenance")
export class MaintenanceController extends StreamingLiveBaseController {
    @httpGet("/run")
    public async run(req: express.Request, res: express.Response): Promise<any> {
        try {
            const services = await this.repositories.service.loadExpired();
            const promises: Promise<any>[] = []
            services.forEach(s => {
                if (!s.recurring) promises.push(this.repositories.service.delete(s.id, s.churchId));
                else {
                    s.serviceTime.setDate(s.serviceTime.getDate() + 7);
                    promises.push(this.repositories.service.save(s));
                }
            });
            await Promise.all(promises);

            return this.json([], 200);
        } catch (e) {
            return this.json(e, 500);
        }

    }


}
