import { useEffect, useState } from "react";
type triggerSource = {
  type: "link" | "yes" | "no" | null;
  count: number;
};

export default function DialogueMessages(input: triggerSource) {
  const [message, setMessage] = useState<string>("");
  const [link, setLink] = useState<string>("");

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
        setMessage(`If you click this again, I'll take that as a "yes"`);
        break;
      case 5:
        setMessage(`Terms accepted :)`);
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
      case 4:
        setMessage("Click for further assistance");
        setLink(
          "https://www.specsavers.co.uk/?srsltid=AfmBOook3V9EnXvEUnoBZKb7_yO0Ypufqvo9yN4icupEWjHFJi0YFoHp"
        );
        break;
      case 5:
        setLink("");
        setMessage(`This isn't a negotiation`);
        break;
      case 6:
        setLink(
          "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGVtMml2MHpxZ2YzMWV3d3l4dWhoNWZ2cjM3OTgxejh5dHl0bTY0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2aw9gwZlltbdX92b4w/giphy.gif"
        );
        setMessage(`Negotiation Form attached 🔗`);
        break;
      case 7:
        setLink("");
        setMessage(`Please?`);
        break;
      default:
        setMessage(`Please x ${count}?`);
        break;
    }
  };
  return (
    <p className="text-center text-lg text-slate-900 dark:text-slate-100 mt-4 mb-4">
      {link ? (
        <a
          href={link}
          target="_blank"
          className="text-blue-500 hover:text-blue-700 underline cursor-pointer border border-blue-500 px-2 py-1 rounded-md"
        >
          {message}
        </a>
      ) : (
        <span>{message}</span>
      )}
    </p>
  );
}
