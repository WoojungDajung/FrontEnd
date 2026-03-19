type UserRole = "host" | "guest";
export type ShareMethod = "kakao" | "system_share" | "link_copy";

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

export interface ShareLinkEventData {
  event: "share_link";
  appointment_id: string;
  user_role: UserRole;
  share_context: "invitation" | "result";
  share_method: ShareMethod;
}

export interface SubmitVoteEventData {
  event: "submit_vote";
  appointment_id: string;
  user_role: UserRole;
  vote_type: "schedule" | "place";
}

export interface SubmitDateEventData {
  event: "save_date";
  appointment_id: string;
  user_role: UserRole;
  possible_count: number; // '가능' 선택 개수
  maybe_count: number; // '애매' 선택 개수
}

export interface ViewResultEventData {
  event: "view_result";
  appointment_id: string;
  user_role: UserRole;
  voter_count: number; // 일정이나 장소 중 하나라도 투표한 총 인원 수
  user_count: number; // 이 약속방에 참여한 총 인원 수
  is_schedule_voted: boolean;
  is_place_voted: boolean;
}

export interface LoginCompleteEventData {
  event: "user_login_complete";
  member_id: string;
}
