type Yn = "Y" | "N";

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

export type ConfirmedResult = {
  confirmedDate: string; // YYYY-MM-DD
  dateVotedList: string[]; // 참여자 nickName
  dateSelectedReasonList: string[];
  confirmedPlaceName: string;
  confirmedPlaceAddress: string;
  placeVotedList: string[];
  placeSelectedReasonList: string[];
};

export type TAppointmentResponse = {
  appointment: Appointment;
  appointmentUserList: AppointmentUser[];
  confirmedResult: ConfirmedResult | null;
};
