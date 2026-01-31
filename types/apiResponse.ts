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

export type MemberProfile = {
  id: number;
  memberNickName: string | null;
  startingPlace: string | null;
};
