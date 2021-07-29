import { Button, Input, InputNumber, Progress, Tooltip } from "antd";

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
  }, [devCount, setIndex, setTimer, time]);

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
    setDevelopersInput(shuffle(developersInput.split("\n")).join("\n"));
  };
  const skip = () => {
    setIndex((i) => i + 1);
    setTimer(Math.round(time / devCount));
    setPause(false);
  };
  const play = () => {
    setPause((p) => !p);
  };
  return (
    <div className="App">
      <label>
        <InputNumber value={time / 60} onChange={(o) => setTime(o * 60)} />
        minutes
      </label>
      <div className="App-developers">
        <TextArea
          rows={8}
          value={developersInput}
          onChange={(o) => setDevelopersInput(o.target.value)}
        ></TextArea>
        <Tooltip title="Shuffle">
          <Button
            className="App-shuffleButton"
            type="primary"
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={randomize}
          />
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
                  {developers[index]}
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
                danger
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
        {currentTime.toLocaleTimeString()}
      </div>
    </div>
  );
}

export default App;
