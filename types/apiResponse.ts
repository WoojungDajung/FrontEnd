type Yn = "Y" | "N";

export type Appointment = {
  appointmentId: string;
  appointmentName: string;
  appointmentDueDate: string;
  confirmYn: Yn;
  profileYn: Yn;
  dday: string;
  appointmentUserId: number;
};

export type AppointmentUser = {
  id: number;
  nickName: string;
  editableYn: Yn;
};

export type TAppointmentResponse = {
  appointment: Appointment;
  appointmentUserList: AppointmentUser[];
};

// 방을 생성한 사용자는 처음엔 id만 부여됨
export type MemberProfile = {
  id: number;
  memberNickName: string | null;
  startingPlace: string | null;
};

export type TRegisterMemberProfileResponse = {
  nickName: string;
  address: string;
  startingPlace: string;
  longitude: string;
  latitude: string;
};

export type TDateVoteResponse = {
  votedList: string[]; // 사용자 nickName 배열
  votedListCount: number;
  unVotedList: string[];
  unVotedListCount: number;
};

export type VoteDate = {
  ymd: string; // YYYY-MM-DD
  percentage: string; // ex: "50"
};

export type TDateVoteByMonthResponse = {
  dateList: VoteDate[];
  memberVoteRatio: string; // ex: "1/5"
};

export type TDateVoteByYMDResponse = {
  possibleCount: number;
  possibleUserList: { id: number; nickName: string }[];
  ambCount: number;
  ambUserList: { id: number; nickName: string }[];
};

export type TDateVoteByUserResponse = {
  possibleList: string[]; // ex: ["2026-02-09", "2026-02-20"];
  ambList: string[];
};

export type Location = {
  id: number;
  name: string;
  address: string;
  voteCount: string;
  percentage: string;
};

export type TLocationListResponse = {
  locationList: Location[];
  memberVoteRatio: string; // ex: "1/5"
};

export type TLocationResponse = {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  selectedList: string[];
};

export type TMyVoteLocationResponse = {
  id: number;
  name: string;
};
