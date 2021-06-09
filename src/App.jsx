import { Button, Input, InputNumber, Progress, Row, Col, Space } from "antd";
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
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    setDevelopers(developersInput.split("\n"));
  }, [developersInput]);

  useEffect(() => {
    setTimer(Math.round(time / developers.length));
    setTimerFull(Math.round(time / developers.length));
    setIndex(0);
  }, [developers, setIndex, setTimer, time]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (pause) return;
      setTimer(timer - 1);
    }, interval);
    return () => {
      clearTimeout(t);
    };
  }, [index, timer, setTimer, pause]);
  useEffect(() => {
    if (timer <= 0) {
      setTimer(Math.round(time / developers.length));
      setIndex((i) => i + 1);
    }
  }, [timer, time, developers]);

  useEffect(() => {
    localStorage.setItem("time", JSON.stringify(time));
    localStorage.setItem("developers", developersInput);
  }, [time, developersInput]);

  const randomize = () => {
    setDevelopersInput(shuffle(developers).join("\n"));
  };
  const skip = () => {
    setTimer(0);
  };
  const play = () => {
    setPause((p) => !p);
  };
  return (
    <div className="App">
      <Row gutter={10}>
        <Col span={12}>
          <TextArea
            rows={8}
            value={developersInput}
            onChange={(o) => setDevelopersInput(o.target.value)}
          ></TextArea>
        </Col>
        <Col span={12}>
          <label>
            Time
            <InputNumber
              placeholder="provide daily time"
              value={time / 60}
              onChange={(o) => setTime(o * 60)}
            />
          </label>
          <Button block type="primary" onClick={randomize}>
            Randomize
          </Button>
          <Button block danger onClick={skip}>
            Skip
          </Button>
          <Button block danger type="primary" onClick={play}>
            {pause ? "Play" : "Pause"}
          </Button>
        </Col>
      </Row>
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
        width={300}
        strokeColor={{
          "0%": "#108ee9",
          "100%": "#87d068",
        }}
        percent={Math.round((timer / timerFull) * 100)}
      ></Progress>
    </div>
  );
}

export default App;
