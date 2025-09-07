import { createCookieSessionStorage } from "react-router";

const sessionSecret = process.env.SESSION_SECRET || 'some-secret';

export const serverSessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        maxAge: 60 * 60 * 24 * 3, // We are setting it to 3 days coz thats the same expiration time as the jwt we get from the gofiber backend
    }
})
