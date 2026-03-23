import {
  startOfMonth,
  endOfMonth,
  addMonths,
  addDays,
  dateToString,
  stringToDate,
  isAfterOrSameMonth,
  isBeforeOrSameMonth,
  isBeforeDay,
} from "./calendar";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("startOfMonth", () => {
  it("해당 월의 1일을 반환한다", () => {
    const result = startOfMonth(new Date("2026-04-15"));

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3); // 0-indexed: 3 = April
    expect(result.getDate()).toBe(1);
  });

  it("이미 1일이면 그대로 반환한다", () => {
    const result = startOfMonth(new Date("2026-01-01"));

    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
  });
});

describe("endOfMonth", () => {
  it("해당 월의 마지막 날을 반환한다 (31일)", () => {
    const result = endOfMonth(new Date("2026-01-10"));

    expect(result.getDate()).toBe(31);
  });

  it("해당 월의 마지막 날을 반환한다 (30일)", () => {
    const result = endOfMonth(new Date("2026-04-01"));

    expect(result.getDate()).toBe(30);
  });

  it("2월 마지막 날을 반환한다 (평년 = 28일)", () => {
    const result = endOfMonth(new Date("2026-02-01"));

    expect(result.getDate()).toBe(28);
  });

  it("2월 마지막 날을 반환한다 (윤년 = 29일)", () => {
    const result = endOfMonth(new Date("2024-02-01"));

    expect(result.getDate()).toBe(29);
  });
});

describe("addMonths", () => {
  it("양수를 전달하면 해당 달 수만큼 이후 날짜를 반환한다", () => {
    const result = addMonths(new Date("2026-04-15"), 2);

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5); // June
    expect(result.getDate()).toBe(15);
  });

  it("음수를 전달하면 해당 달 수만큼 이전 날짜를 반환한다", () => {
    const result = addMonths(new Date("2026-04-15"), -1);

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2); // March
  });

  it("12월에서 1을 더하면 다음 해 1월이 된다", () => {
    const result = addMonths(new Date("2026-12-01"), 1);

    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0); // January
  });

  it("1월에서 1을 빼면 이전 해 12월이 된다", () => {
    const result = addMonths(new Date("2026-01-01"), -1);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11); // December
  });
});

describe("addDays", () => {
  it("양수를 전달하면 해당 일 수만큼 이후 날짜를 반환한다", () => {
    const result = addDays(new Date("2026-04-15"), 5);

    expect(result.getDate()).toBe(20);
    expect(result.getMonth()).toBe(3); // April
  });

  it("음수를 전달하면 해당 일 수만큼 이전 날짜를 반환한다", () => {
    const result = addDays(new Date("2026-04-15"), -5);

    expect(result.getDate()).toBe(10);
  });

  it("월말에서 1을 더하면 다음 달 1일이 된다", () => {
    const result = addDays(new Date("2026-04-30"), 1);

    expect(result.getMonth()).toBe(4); // May
    expect(result.getDate()).toBe(1);
  });
});

describe("dateToString", () => {
  it("YYYY-MM-DD 형식으로 변환된다", () => {
    expect(dateToString(new Date("2026-04-15"))).toBe("2026-04-15");
  });

  it("월과 일이 한 자리수이면 앞에 0이 붙는다", () => {
    expect(dateToString(new Date("2026-01-05"))).toBe("2026-01-05");
  });
});

describe("stringToDate", () => {
  it("YYYY-MM-DD 형식의 문자열을 Date로 변환한다", () => {
    const result = stringToDate("2026-04-15");

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(15);
  });

  it("dateToString과 왕복 변환이 일치한다", () => {
    const original = new Date("2026-07-20");
    const roundTripped = stringToDate(dateToString(original));

    expect(roundTripped.getFullYear()).toBe(original.getFullYear());
    expect(roundTripped.getMonth()).toBe(original.getMonth());
    expect(roundTripped.getDate()).toBe(original.getDate());
  });
});

describe("isAfterOrSameMonth", () => {
  it("같은 달이면 true를 반환한다", () => {
    expect(
      isAfterOrSameMonth(new Date("2026-04-10"), new Date("2026-04-01")),
    ).toBe(true);
  });

  it("이후 달이면 true를 반환한다", () => {
    expect(
      isAfterOrSameMonth(new Date("2026-05-01"), new Date("2026-04-01")),
    ).toBe(true);
  });

  it("이전 달이면 false를 반환한다", () => {
    expect(
      isAfterOrSameMonth(new Date("2026-03-01"), new Date("2026-04-01")),
    ).toBe(false);
  });

  it("연도가 달라도 올바르게 비교한다", () => {
    expect(
      isAfterOrSameMonth(new Date("2027-01-01"), new Date("2026-12-01")),
    ).toBe(true);
  });
});

describe("isBeforeOrSameMonth", () => {
  it("같은 달이면 true를 반환한다", () => {
    expect(
      isBeforeOrSameMonth(new Date("2026-04-10"), new Date("2026-04-30")),
    ).toBe(true);
  });

  it("이전 달이면 true를 반환한다", () => {
    expect(
      isBeforeOrSameMonth(new Date("2026-03-01"), new Date("2026-04-01")),
    ).toBe(true);
  });

  it("이후 달이면 false를 반환한다", () => {
    expect(
      isBeforeOrSameMonth(new Date("2026-05-01"), new Date("2026-04-01")),
    ).toBe(false);
  });

  it("연도가 달라도 올바르게 비교한다", () => {
    expect(
      isBeforeOrSameMonth(new Date("2026-12-01"), new Date("2027-01-01")),
    ).toBe(true);
  });
});

describe("isBeforeDay", () => {
  it("하루 이전이면 true를 반환한다", () => {
    expect(isBeforeDay(new Date("2026-04-14"), new Date("2026-04-15"))).toBe(
      true,
    );
  });

  it("같은 날이면 false를 반환한다", () => {
    expect(isBeforeDay(new Date("2026-04-15"), new Date("2026-04-15"))).toBe(
      false,
    );
  });

  it("하루 이후이면 false를 반환한다", () => {
    expect(isBeforeDay(new Date("2026-04-16"), new Date("2026-04-15"))).toBe(
      false,
    );
  });

  it("시각이 달라도 같은 날이면 false를 반환한다", () => {
    const morning = new Date("2026-04-15T00:00:00");
    const evening = new Date("2026-04-15T23:59:59");

    expect(isBeforeDay(morning, evening)).toBe(false);
  });

  it("월이 바뀌는 경계도 올바르게 비교한다", () => {
    expect(isBeforeDay(new Date("2026-03-31"), new Date("2026-04-01"))).toBe(
      true,
    );
  });
});
