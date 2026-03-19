export type MemberProfile = {
  id: number;
  memberNickName: string;
  startingPlace: string | null;
};

export type TVoteStatusResponse = {
  votedList: string[]; // 사용자 nickName 배열
  votedListCount: number;
  unVotedList: string[];
  unVotedListCount: number;
};

export type Location = {
  id: number;
  name: string;
  address: string;
  voteCount: string;
  percentage: string;
};
