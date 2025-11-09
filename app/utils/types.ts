type Team = {
    id: string
    name: string
    description: string
}

type TeamListEntry = {
    userId: string,
    role: "OWNER" | "ADMIN" | "OPERATOR",
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

type Log = {
    id: string,
    dataCenterId: string,
    teamMemberId: string,
    teamMember: TeamMember,
    message: string,
    createdAt: Date
}

type DataCenter = {
    id: string
    name: string
    location: string
    description: string
    team: Team
}
