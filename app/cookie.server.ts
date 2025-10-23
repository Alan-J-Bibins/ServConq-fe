import { createCookie } from "react-router";

export const themeCookie = createCookie("theme", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
})
