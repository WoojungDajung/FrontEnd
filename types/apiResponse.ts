type Yn = "Y" | "N";

export type ConfirmedResult = {
  confirmedDate: string; // YYYY-MM-DD
  dateVotedList: string[]; // 참여자 nickName
  confirmedPlaceName: string;
  confirmedPlaceAddress: string;
  placeVotedList: string[];
};

export type Appointment = {
  appointmentId: string;
  appointmentName: string;
  appointmentDueDate: string;
  confirmYn: Yn;
  profileYn: Yn;
  hostYn: Yn;
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
  confirmedResult: ConfirmedResult | null;
};

export type TAppointmentPreviewResponse = {
  appointmentId: string;
  appointmentName: string;
  appointmentDueDate: string;
  dday: string;
};

// 방을 생성한 사용자는 처음엔 id만 부여됨
export type MemberProfile = {
  id: number;
  memberNickName: string;
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

export type TMemberAppointments = {
  appointmentList: {
    appointmentId: string;
    appointmentName: string;
    appointmentDueDate: string; // YYYY-MM-DD 형식의 문자열
    participantCount: string;
    dday: string; // ex: "D+10"
  }[];
  appointmentCount: string;
};
