export type TLocationResponse = {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  selectedList: string[];
};

export type TLocationListResponse = {
  locationList: Location[];
  memberVoteRatio: string; // ex: "1/5"
};

export type TMyVoteLocationResponse = {
  id: number;
  name: string;
};

export type Location = {
  id: number;
  name: string;
  address: string;
  voteCount: string;
  percentage: string;
};
