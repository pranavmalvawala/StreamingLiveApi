import { httpGet, requestParam, controller } from "inversify-express-utils";
import express from "express";
import { SubDomainHelper } from "../helpers"
import { AwsHelper } from "../helpers"
import { PageController as BasePageController } from "../apiBase/controllers";

@controller("/pages")
export class PageControllerExtended extends BasePageController {

    @httpGet("/write/:id")
    public async writeToDisk(@requestParam("id") id: string, req: express.Request, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            if (process.env.STORAGE_LOCATION !== "S3") return this.denyAccess(["This API is not configured to publish to disk"]);
            else {
                const page = await this.baseRepositories.page.loadById(id, au.churchId);
                if (page.content !== undefined) {
                    const subDomain = await SubDomainHelper.get(au.churchId);
                    const wrappedContent = this.wrapContent(subDomain, page.content);
                    const path = "data/" + subDomain + '/page' + page.id + '.html';
                    const buffer = Buffer.from(wrappedContent, 'binary');
                    await AwsHelper.S3Upload(path, "text/html", buffer)
                }
                return page;
            }
        });
    }

    private wrapContent(keyName: string, content: string) {
        const cssLink = "<link href=\"/data/" + keyName + "/data.css\" rel=\"stylesheet\" /><link href=\"/css/page.css\" rel=\"stylesheet\" />";
        return "<html><head>" + cssLink + "</head><body>" + content + "</body></html>";
    }

}


