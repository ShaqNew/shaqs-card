import { useEffect, useState } from "react";
type triggerSource = {
  type: "link" | "yes" | "no" | null;
  count: number;
};

export default function DialogueMessages(input: triggerSource) {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    switch (input.type) {
      case "link":
        setLinkMessage(input.count);
        break;
      case "yes":
        setYesMessage(input.count);
        break;
      case "no":
        setNoMessage(input.count);
        break;
      default:
        setMessage("Unknown trigger source");
        break;
    }
  }, [input]);

  const setLinkMessage = (count: number) => {
    switch (count) {
      case 1:
        setMessage(`Document can't be opened, try again`);
        break;
      case 2:
        setMessage(
          `Document can't be opened, but trust me the terms are good :)`
        );
        break;
      case 3:
        setMessage(`Click YES to read the document`);
        break;
      case 4:
        setMessage(`If you click this again, I'll take that as a yes`);
        break;
      case 5:
        setMessage(`Stop it!`);
        break;
      case 6:
        setMessage(`STOP!`);
        break;
      default:
        setMessage(`Stubborness = ${count}/10`);
        break;
    }
  };

  const setYesMessage = (count: number) => {
    setMessage(`Thank you :)`);
  };

  const setNoMessage = (count: number) => {
    switch (count) {
      case 1:
        setMessage(`Incorrect answer, try again`);
        break;
      case 2:
        setMessage(`Try the other button`);
        break;
      case 3:
        setMessage(`Try clicking the YES button`);
        break;
      default:
        setMessage(`No button clicked ${count} times`);
        break;
    }
  };
  return <p key={message}>{message}</p>;
}
