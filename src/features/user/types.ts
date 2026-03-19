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

export type TMemberIdResponse = {
  memberId: string;
};
