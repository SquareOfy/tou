import React from "react";
import styled from "styled-components";

type BranchLocationComponentProps = {
  location: string;
  date: string;
  branch: string;
};

const BranchLocationComponent: React.FC<BranchLocationComponentProps> = ({
  location,
  date,
  branch,
}) => {
  // 날짜 변환
  const formatDate = (dateString: string) => {
    const dateObject = new Date(dateString);
    return dateObject.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <BranchLocationDiv>
      <StyledDiv>{formatDate(date)}</StyledDiv>
      <StyledDiv>{branch}</StyledDiv>
      <StyledDiv>{location}</StyledDiv>
    </BranchLocationDiv>
  );
};

export default BranchLocationComponent;

const BranchLocationDiv = styled.div`
  /* background-color: yellow; */
  text-align: center;
  font-weight: bold;
`;
const StyledDiv = styled.div`
  margin: 0.5rem 0;
`;
