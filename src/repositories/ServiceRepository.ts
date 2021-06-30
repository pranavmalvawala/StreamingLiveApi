import { DB } from "../apiBase/db";
import { Service } from "../models";
import { UniqueIdHelper, DateTimeHelper } from "../helpers";

export class ServiceRepository {

    public save(service: Service) {
        return service.id ? this.update(service) : this.create(service);
    }

    private async create(service: Service) {
        service.id = UniqueIdHelper.shortId();
        const serviceTime = DateTimeHelper.toMysqlDate(service.serviceTime);
        const sql = "INSERT INTO services (id, churchId, serviceTime, earlyStart, duration, chatBefore, chatAfter, provider, providerKey, videoUrl, timezoneOffset, recurring, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        const params = [service.id, service.churchId, serviceTime, service.earlyStart, service.duration, service.chatBefore, service.chatAfter, service.provider, service.providerKey, service.videoUrl, service.timezoneOffset, service.recurring, service.label];
        await DB.query(sql, params);
        return service;
    }

    private async update(service: Service) {
        const serviceTime = DateTimeHelper.toMysqlDate(service.serviceTime);
        const sql = "UPDATE services SET serviceTime=?, earlyStart=?, duration=?, chatBefore=?, chatAfter=?, provider=?, providerKey=?, videoUrl=?, timezoneOffset=?, recurring=?, label=? WHERE id=?;";
        const params = [serviceTime, service.earlyStart, service.duration, service.chatBefore, service.chatAfter, service.provider, service.providerKey, service.videoUrl, service.timezoneOffset, service.recurring, service.label, service.id];
        await DB.query(sql, params);
        return service;
    }

    public delete(id: string, churchId: string) {
        return DB.query("DELETE FROM services WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public loadById(id: string, churchId: string): Promise<Service> {
        return DB.queryOne("SELECT * FROM services WHERE id=? AND churchId=?;", [id]);
    }

    public loadAll(churchId: string): Promise<Service[]> {
        return DB.query("SELECT * FROM services WHERE churchId=? ORDER BY serviceTime;", [churchId]);
    }

}
