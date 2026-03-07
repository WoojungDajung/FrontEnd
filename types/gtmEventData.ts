type UserRole = "host" | "guest";

export interface EditAppointmentEventData {
  event: "edit_appointment";
  appointment_id: string;
  user_role: UserRole;
  edit_name: boolean; // 이름 수정 여부
  edit_deadline: boolean; // 마감일 수정 여부
  is_after_deadline: boolean; // 마감일 이후 수정 여부
}

export interface EnterAppointmentPageEventData {
  event: "enter_appointment";
  appointment_id: string;
  user_role: UserRole;
  has_schedule_voted: boolean;
  has_place_voted: boolean;
}
