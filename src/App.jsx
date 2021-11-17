import { Button, Input, InputNumber, Progress, Tooltip } from "antd";
import { add } from "date-fns";
import {
  ReloadOutlined,
  FastForwardOutlined,
  PauseOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import "./App.css";
import React, { useEffect, useState } from "react";

const { TextArea } = Input;
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
const interval = 1000;
function App() {
  // Create the count state.
  const [developersInput, setDevelopersInput] = useState(
    localStorage.getItem("developers")
  );
  const [developers, setDevelopers] = useState([]);
  const [teams, setTeams] = useState({});
  const [time, setTime] = useState(
    JSON.parse(localStorage.getItem("time") ?? "0")
  );
  const [pause, setPause] = useState(false);
  const [index, setIndex] = useState(0);
  const [timerFull, setTimerFull] = useState(0);
  const [globalTimer, setGlobalTimer] = useState(0);
  const [timer, setTimer] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const devCount = developers.length;
  useEffect(() => {
    if (developersInput) {
      const rows = developersInput.split("\n");
      const sets = rows.reduce(
        (acc, row) => {
          const match = row.match(/^---(.*)---$/);
          if (match) {
            acc.current = match[1];
          } else {
            acc.teams[acc.current] = acc.teams[acc.current] || [];
            acc.teams[acc.current].push(row);
          }
          return acc;
        },
        { current: null, teams: {} }
      );
      setTeams(sets.teams);
      setDevelopers(
        developersInput.split("\n").filter((s) => !s.startsWith("-"))
      );
    }
  }, [developersInput]);

  useEffect(() => {
    setTimer(Math.round(time / devCount));
    setTimerFull(Math.round(time / devCount));
    setGlobalTimer(time);
    setIndex(0);
  }, [devCount, developers, setIndex, setTimer, time]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!pause) {
        setTimer((m) => m - 1);
      }
      setGlobalTimer((m) => m - 1);
      setCurrentTime(new Date());
    }, interval);
    return () => {
      clearTimeout(t);
    };
  }, [index, timer, globalTimer, setTimer, pause]);
  useEffect(() => {
    if (timer <= 0) {
      setPause(true);
    }
  }, [timer]);

  useEffect(() => {
    localStorage.setItem("time", JSON.stringify(time));
    localStorage.setItem("developers", developersInput);
  }, [time, developersInput]);

  const randomize = () => {
    const shuffledTeams = Object.entries(teams).map(([team, devs]) => {
      const last = shuffle(devs.filter((s) => s.startsWith("_")));
      const disabled = shuffle(devs.filter((s) => s.startsWith("-")));
      const other = shuffle(
        devs.filter((s) => !s.startsWith("-") && !s.startsWith("_"))
      );
      return [team, [...other, ...last, ...disabled]];
    }).reduce((acc, [team, devs]) => {
      acc[team] = devs;
      return acc;
    }, {});
    setTeams(shuffledTeams);
    
    setDevelopersInput(Object.entries(teams).map(([team, devs]) => `---${team}---\n${devs.join("\n")}`).join("\n"));

  };
  const skip = () => {
    setIndex((i) => i + 1);
    setTimer(Math.round(time / devCount));
    setPause(false);
  };
  const perDevTime = Math.round(time / devCount);
  const devsLeft = devCount - index - 1;

  const timeLeft = perDevTime * devsLeft + timer;
  const estimatedFinish = add(currentTime, { seconds: timeLeft });
  const play = () => {
    setPause((p) => !p);
  };
  return (
    <div className="App">
      <div className="App-timer">
        <label>
          <InputNumber value={time / 60} onChange={(o) => setTime(o * 60)} />
          minutes
        </label>
        <div className="App-developers">
          <TextArea
            rows={8}
            value={developersInput}
            onChange={(o) => setDevelopersInput(o.target.value)}
            disabled={!pause}
          ></TextArea>
          <Tooltip title="Shuffle">
            {pause && (
              <Button
                className="App-shuffleButton"
                type="primary"
                shape="circle"
                icon={<ReloadOutlined />}
                onClick={randomize}
              />
            )}
          </Tooltip>
        </div>
        <div className="App-progress">
          <Progress
            type="dashboard"
            format={() => (
              <Progress
                type="dashboard"
                format={() => (
                  <>
                    {developers[index]?.replace(/^[-_]/, "")}
                    <br />
                    {timer}s
                  </>
                )}
                status={timer / timerFull > 0.15 ? "normal" : "exception"}
                width={275}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                strokeWidth={6}
                percent={Math.round((timer / timerFull) * 100)}
              ></Progress>
            )}
            width={300}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            strokeWidth={1}
            percent={Math.round((globalTimer / time) * 100)}
          ></Progress>
          <div className="App-buttons">
            {timer > 0 &&
              (pause ? (
                <Tooltip title="Play">
                  <Button
                    style={{
                      background: "rgb(82, 196, 26)",
                      borderColor: "rgb(82, 196, 26)",
                    }}
                    type={pause ? "primary" : "dashed"}
                    shape="circle"
                    icon={<CaretRightOutlined />}
                    onClick={play}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Pause">
                  <Button
                    type={pause ? "primary" : "dashed"}
                    shape="circle"
                    icon={<PauseOutlined />}
                    onClick={play}
                  />
                </Tooltip>
              ))}
            {index < developers.length - 1 && (
              <Tooltip title="Next">
                <Button
                  type={pause ? "primary" : "dashed"}
                  shape="circle"
                  icon={<FastForwardOutlined />}
                  onClick={skip}
                />
              </Tooltip>
            )}
          </div>
          <strong>Will finish: {estimatedFinish.toLocaleTimeString()}</strong>
        </div>
      </div>
    </div>
  );
}

export default App;
