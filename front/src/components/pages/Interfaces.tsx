export interface iInvitation {
    id: number,
    user: iUser,
    chatroom: iChatroom,
}

export interface iChatroom {
    id: number,
    name: string,
    hashed_pwd: string,
    type: string,
    messages:iMessage[],
    userChatroom: iUserChatroom[]
}

export interface iUserChatroom {
    id: number,
    is_owner: boolean,
    is_admin: boolean,
    is_muted: boolean,
    is_banned: boolean,
    muted_timer: Date,
    user: iUser,
    chatroom: iChatroom,
}

export interface iBlockUser {
    id: number,
    blockingUser: iUser,
    blockedUser: iUser
}

export interface iUser {
    id: number,
    login42: string,
    nickname: string,
    avatarURI: string,
    email: string,
    auth2F: boolean,
    blockedUsers: iBlockUser[]
}

export interface iMessage {
    id: number,
    content: string,
    posted_at: Date,
    author: iUser,
}

export interface iLeaderBoard {
    ranking: number,
    totalMatches: number,
    totalVictoris: number,
    user: iUser,
}

export interface iPendingInvitation {
    id: number,
    user: iUser,
    chatroom: iChatroom
}


export function formatDate(date:Date) {
    const gameDate = new Date(date);
  
    const formattedDate = `${gameDate.getFullYear()}-${('0' + (gameDate.getMonth() + 1)).slice(-2)}-${('0' + gameDate.getDate()).slice(-2)}`;
    const formattedTime = `${('0' + gameDate.getHours()).slice(-2)}:${('0' + gameDate.getMinutes()).slice(-2)}`;
  
    return `${formattedDate} ${formattedTime}`;
  }
