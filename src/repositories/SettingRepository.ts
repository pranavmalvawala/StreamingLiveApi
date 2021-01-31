import { DB } from "../apiBase/db";
import { Setting } from "../models";

export class SettingRepository {

    public async loadAll(churchId: number) {
        return DB.query("SELECT * FROM settings WHERE churchId=?", [churchId]);
    }

    public async loadByChurchId(churchId: number) {
        return DB.queryOne("SELECT * FROM settings WHERE churchId=? LIMIT 1;", [churchId]);
    }

    public save(setting: Setting) {
        if (setting.id > 0) return this.update(setting); else return this.create(setting);
    }

    public async create(setting: Setting) {
        return DB.query(
            "INSERT INTO settings (churchId, homePageUrl, logoUrl, primaryColor, contrastColor, registrationDate) VALUES (?, ?, ?, ?, ?, NOW());",
            [setting.churchId, setting.homePageUrl, setting.logoUrl, setting.primaryColor, setting.contrastColor]
        ).then((row: any) => { setting.id = row.insertId; return setting; });
    }

    public async update(setting: Setting) {
        return DB.query(
            "UPDATE settings SET homePageUrl=?, logoUrl=?, primaryColor=?, contrastColor=? WHERE id=?;",
            [setting.homePageUrl, setting.logoUrl, setting.primaryColor, setting.contrastColor, setting.id]
        ).then(() => { return setting });
    }


}
