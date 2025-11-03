import { serverSessionStorage } from "~/session.server";

export async function getUserToken(request: Request) {
    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    return token;
}

