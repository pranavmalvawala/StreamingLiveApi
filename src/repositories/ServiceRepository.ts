import { DB } from "../apiBase/db";
import { Service } from "../models";

export class ServiceRepository {

    public save(service: Service) {
        if (service.id > 0) return this.update(service); else return this.create(service);
    }

    public async create(service: Service) {
        return DB.query(
            "INSERT INTO services (churchId, serviceTime, earlyStart, duration, chatBefore, chatAfter, provider, providerKey, videoUrl, timezoneOffset, recurring, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            [service.churchId, service.serviceTime, service.earlyStart, service.duration, service.chatBefore, service.chatAfter, service.provider, service.providerKey, service.videoUrl, service.timezoneOffset, service.recurring, service.label]
        ).then((row: any) => { service.id = row.insertId; return service; });
    }

    public async update(service: Service) {
        return DB.query(
            "UPDATE services SET serviceTime=?, earlyStart=?, duration=?, chatBefore=?, chatAfter=?, provider=?, providerKey=?, videoUrl=?, timezoneOffset=?, recurring=?, label=? WHERE id=?;",
            [service.serviceTime, service.earlyStart, service.duration, service.chatBefore, service.chatAfter, service.provider, service.providerKey, service.videoUrl, service.timezoneOffset, service.recurring, service.label, service.id]
        ).then(() => { return service });
    }

    public async delete(id: number, churchId: number) {
        DB.query("DELETE FROM services WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async loadById(id: number, churchId: number): Promise<Service> {
        return DB.queryOne("SELECT * FROM services WHERE id=? AND churchId=?;", [id]);
    }

    public async loadAll(churchId: number): Promise<Service[]> {
        return DB.query("SELECT * FROM services WHERE churchId=? ORDER BY serviceTime;", [churchId]);
    }

    public async loadExpired(): Promise<Service[]> {
        return DB.query("SELECT * FROM services WHERE serviceTime<DATE_ADD(NOW(), INTERVAL -6 HOUR)", []);

    }

}
