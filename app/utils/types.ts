type Team = {
    id: string
    name: string
    description: string
}

type TeamListEntry = {
    userId: string,
    role: "OWNER" |  "ADMIN" | "OPERATOR",
    team: Team
    memberCount: number
}

type TeamMember = {
    id: string,
    userId: string,
    teamId: string,
    role: "OWNER" | "ADMIN" | "OPERATOR",
    joinedAt: Date
}
