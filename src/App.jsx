import { Button, Input, InputNumber, Progress } from "antd";
import "antd/dist/antd.css";
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
  const [developersInput, setDevelopersInput] = useState(`Damian D.
Piotr
Damian P.
Niklas
Michał
Victor
Tomek`);
  const [developers, setDevelopers] = useState([]);
  const [time, setTime] = useState(15 * 60);
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
      <header className="App-header">
        <label>
          Developers
          <TextArea
            rows={10}
            cols={15}
            value={developersInput}
            onChange={(o) => setDevelopersInput(o.target.value)}
          ></TextArea>
        </label>
        <label>
          Time
          <InputNumber
            placeholder="provide daily time"
            value={time}
            onChange={(o) => setTime(parseInt(o.target.valueAsNumber))}
          />
        </label>
        <br />
        <Button onClick={randomize}>Randomize</Button>
        <Button onClick={skip}>Skip</Button>
        <Button onClick={play}>{pause ? "Play" : "Pause"}</Button>
        <br />
        <Progress
          type="circle"
          format={() => developers[index]}
          width={400}
          percent={Math.round((timer / timerFull) * 100)}
        ></Progress>
      </header>
    </div>
  );
}

export default App;
