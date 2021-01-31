import { Permissions as BasePermissions } from "../apiBase/helpers";

export class Permissions extends BasePermissions {
    static chat = {
        host: { contentType: "Chat", action: "Host" },
    };
    static services = {
        edit: { contentType: "Services", action: "Edit" }
    };
}
