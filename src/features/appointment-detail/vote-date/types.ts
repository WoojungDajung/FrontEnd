export type VoteDate = {
  ymd: string; // YYYY-MM-DD
  percentage: string; // ex: "50"
};

export type TDateVoteByMonthResponse = {
  dateList: VoteDate[];
  memberVoteRatio: string; // ex: "1/5"
};

export type TDateVoteByUserResponse = {
  possibleList: string[]; // ex: ["2026-02-09", "2026-02-20"];
  ambList: string[];
};

export type TDateVoteByYMDResponse = {
  possibleCount: number;
  possibleUserList: { id: number; nickName: string }[];
  ambCount: number;
  ambUserList: { id: number; nickName: string }[];
};

export type VoteState = "possible" | "uncertain" | "impossible";
