import { useEffect, useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import styled from "styled-components";
import { BiDoughnutChart } from "react-icons/bi";
import { customAxios } from "../../api/customAxios";

// 차트 데이터의 타입을 정의 (TypeScript를 사용하는 경우)
interface ChartData {
  id: string;
  label: string;
  value: number;
  color?: string;
}

const OfficerChart = () => {
  const [branchSeq, setBranchSeq] = useState(0);
  // 차트 데이터 상태를 useState로 선언합니다.

  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    // 토큰 들어오는거 기다리기
    const awaitToken = async () => {
      return new Promise((resolve) => {
        const checkToken = () => {
          const storedValue = localStorage.getItem("recoil-persist");
          const accessToken = storedValue && JSON.parse(storedValue)?.UserInfoState?.accessToken;
          setBranchSeq(storedValue && JSON.parse(storedValue)?.UserInfoState?.branchSeq);
          
          if (accessToken) {
            resolve(accessToken);
          } else {
            setTimeout(checkToken, 1000); // 1초마다 토큰 체크
          }
        };
        checkToken();
      });
    };

    const awaitChart = async () => {
      try {
        const accessToken = await awaitToken();
        if (!accessToken) {
          return;
        }

        const res = await customAxios.get(`statement/worker/${branchSeq}/trade/count`);
        const newChartData = Array.isArray(res.data.data)
        ? res.data.data.map((dataItem: any) => ({
          id: dataItem.branchName,
          label: dataItem.branchName,
          value: dataItem.branchTradeCount,
          // 색상은 선택적으로 지정할 수 있습니다. 지정하지 않으면 자동으로 할당됩니다.
        }))
          : [];
        // 변환된 데이터를 차트 데이터 상태에 저장합니다.
        setChartData(newChartData);

      } catch (error) {
        console.log(error);
      }
    };

    awaitChart();
  }, [chartData]);
  
  return (
    <StyledContainer>
      <StyledTitle>
        <BiDoughnutChart
          color="#545A96"
          size={"30px"}
          style={{ marginRight: "10px" }}
        />
        업체별 거래 횟수
      </StyledTitle>

      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 40, bottom: 100, left: 40 }}
        sortByValue={true}
        innerRadius={0.5}
        padAngle={1}
        cornerRadius={4}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ theme: "background" }}
        enableArcLinkLabels={false}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        fill={[
          {
            match: {
              id: "ruby",
            },
            id: "dots",
          },
          {
            match: {
              id: "c",
            },
            id: "dots",
          },
          {
            match: {
              id: "go",
            },
            id: "dots",
          },
          {
            match: {
              id: "python",
            },
            id: "dots",
          },
          {
            match: {
              id: "scala",
            },
            id: "lines",
          },
          {
            match: {
              id: "lisp",
            },
            id: "lines",
          },
          {
            match: {
              id: "elixir",
            },
            id: "lines",
          },
          {
            match: {
              id: "javascript",
            },
            id: "lines",
          },
        ]}
        legends={[
          {
            anchor: "bottom",
            direction: "column",
            justify: false,
            translateX: 140,
            translateY: 80,
            itemsSpacing: 0,
            itemWidth: 70,
            itemHeight: 18,
            itemTextColor: "#999",
            itemDirection: "right-to-left",
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
                },
              },
            ],
          },
        ]}
      />
    </StyledContainer>
  );
};

export default OfficerChart;

const StyledContainer = styled.div`
  width: 100%;
  /* border: 1px solid black; */
  border-radius: 10px;
  margin: 20px 0 20px 20px;
  padding: 20px;
  box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.25);
  background-color: white;
`;

const StyledTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #545a96;
`;
