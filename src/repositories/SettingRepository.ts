import { DB } from "../apiBase/db";
import { Setting } from "../models";
import { UniqueIdHelper } from "../helpers";

export class SettingRepository {

    public async loadAll(churchId: string) {
        return DB.query("SELECT * FROM settings WHERE churchId=?", [churchId]);
    }

    public async loadByChurchId(churchId: string) {
        return DB.queryOne("SELECT * FROM settings WHERE churchId=? LIMIT 1;", [churchId]);
    }

    public save(setting: Setting) {
        if (UniqueIdHelper.isMissing(setting.id)) return this.create(setting); else return this.update(setting);
    }

    public async create(setting: Setting) {
        setting.id = UniqueIdHelper.shortId();
        return DB.query(
            "INSERT INTO settings (id, churchId, homePageUrl, logoUrl, primaryColor, contrastColor, registrationDate) VALUES (?, ?, ?, ?, ?, ?, NOW());",
            [setting.id, setting.churchId, setting.homePageUrl, setting.logoUrl, setting.primaryColor, setting.contrastColor]
        ).then(() => { return setting; });
    }

    public async update(setting: Setting) {
        return DB.query(
            "UPDATE settings SET homePageUrl=?, logoUrl=?, primaryColor=?, contrastColor=? WHERE id=?;",
            [setting.homePageUrl, setting.logoUrl, setting.primaryColor, setting.contrastColor, setting.id]
        ).then(() => { return setting });
    }


}
