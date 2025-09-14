import { useState } from "react";
import { Landing } from "./Landing";
import { PathSelection } from "./PathSelection";
import { TalentsPath } from "./TalentsPath";
import { ScenariosPath } from "./ScenariosPath";

type Screen = "landing" | "path-selection" | "talents" | "scenarios";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [userName, setUserName] = useState("");

  const handleStart = (name: string) => {
    setUserName(name);
    setCurrentScreen("path-selection");
  };

  const handleSelectPath = (path: "talents" | "scenarios") => {
    setCurrentScreen(path);
  };

  const handleBackToLanding = () => {
    setCurrentScreen("landing");
    setUserName("");
  };

  const handleBackToPathSelection = () => {
    setCurrentScreen("path-selection");
  };

  return (
    <main className="min-h-screen">
      {currentScreen === "landing" && (
        <Landing onStart={handleStart} />
      )}
      
      {currentScreen === "path-selection" && (
        <PathSelection
          userName={userName}
          onSelectPath={handleSelectPath}
          onBack={handleBackToLanding}
        />
      )}
      
      {currentScreen === "talents" && (
        <TalentsPath
          userName={userName}
          onBack={handleBackToPathSelection}
        />
      )}
      
      {currentScreen === "scenarios" && (
        <ScenariosPath
          userName={userName}
          onBack={handleBackToPathSelection}
        />
      )}
    </main>
  );
};

export default Index;
