type Team = {
    id: string
    name: string
    description: string
}

type TeamListEntry = {
    userId: string,
    role: "OWNER" | "VIEWER" | "ADMIN" | "OPERATOR",
    team: Team
    memberCount: number
}
