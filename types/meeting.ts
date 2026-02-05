export type Place = {
  id: string;
  name: string;
  address: string;
  count: number;
};

export type Participant = {
  id: string;
  nickName: string;
  editableYn: string;
};

export type Profile = {
  id: number;
  memberNickName: string;
  startingPlace?: string;
};
