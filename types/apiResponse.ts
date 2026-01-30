type Yn = "Y" | "N";

export type Appointment = {
  appointmentId: string;
  appointmentName: string;
  appointmentDueDate: string;
  confirmYn: Yn;
  profileYn: Yn;
  dday: string;
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
