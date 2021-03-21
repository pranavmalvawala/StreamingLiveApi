import { controller, httpPost } from "inversify-express-utils";
import express from "express";
import { SubDomainHelper, FileHelper } from "../helpers"
import { Page, File } from "../apiBase/models";
import { PageController as BasePageController } from "../apiBase/controllers";

@controller("/pages")
export class PageControllerExtended extends BasePageController {

    @httpPost("/write")
    public async writeToDisk(req: express.Request<{}, {}, Page>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            const page: Page = req.body;
            if (page.content !== undefined) {
                const subDomain = await SubDomainHelper.get(au.churchId);
                const wrappedContent = this.wrapContent(subDomain, page.content);

                const buffer = Buffer.from(wrappedContent, "binary");
                const path = au.churchId + "/streamingLive/pages/" + page.id + ".html";
                await FileHelper.store(path, "text/html", buffer);
            }
            return page;

        });
    }

    private wrapContent(keyName: string, content: string) {
        const cssLink = "<link href=\"/data/" + keyName + "/data.css\" rel=\"stylesheet\" /><link href=\"/css/page.css\" rel=\"stylesheet\" />";
        return "<html><head>" + cssLink + "</head><body>" + content + "</body></html>";
    }

}


