import React, { useState } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import { BiCalendarCheck } from "react-icons/bi";
import moment from "moment";
import { CalendarWrapper, DropdownButton } from "../../../commons/style/calendarStyle/OfficerStockCalendarStyle";

// type ValuePiece = Date | null;
// type Value = ValuePiece | [ValuePiece, ValuePiece];

interface OfficerStockCalendarProps {
  onChange: any;
  value: any;
}

const OfficerStockCalendar: React.FC<OfficerStockCalendarProps> = ({ onChange, value }) => {
  const [nowDate, setNowDate] = useState<string>("일정을 선택하세요");
  const [OpenYN, setOpenYN] = useState<boolean>(false);

  const handleToggleCalendar = () => {
    setOpenYN(!OpenYN);
  };

  const handleDateChange = (selectedDate: any) => {
    onChange(selectedDate);
    setOpenYN(false);
    if (Array.isArray(selectedDate)) {
      setNowDate(moment(selectedDate[0] as Date).format("YYYY년 MM월 DD일"));
    } else {
      setNowDate(moment(selectedDate as Date).format("YYYY년 MM월 DD일"));
    }
  };

  return (
    <CalendarContainer>
      <label>
        <DropdownButton onClick={handleToggleCalendar}>
          {nowDate}
          <BiCalendarCheck size="24" />
        </DropdownButton>
      </label>
      <CalendarWrapper OpenYN={OpenYN}>
        <Calendar
          onChange={handleDateChange}
          value={value}
          formatDay={(locale, date) => moment(date).format("DD")}
        />
      </CalendarWrapper>
    </CalendarContainer>
  );
};

export default OfficerStockCalendar;

const CalendarContainer = styled.div`
  position: relative;
`;

