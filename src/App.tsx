import { AxiosError } from "axios";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/chat/";
const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN || "";
function App() {
  const [data, setData] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [end, setEnd] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  useEffect(() => {
    setData("");
  }, [message]);
  const fetchData = async (url: string, body: object) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer df6bc53c-638c-4a8a-b9bc-1ec0a3981766",
      },

      body: JSON.stringify(body),
    });
    return response.body ? response.body.getReader() : null;
  };
  const preprocessDataStream = (chunk: string): string => {
    if (chunk.includes("END")) {
      setEnd(true);
      return "";
    } else {
      return chunk.replace(/^data: /, "").replace(/\n\n$/, "");
    }
  };
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    console.log("submitted", message);
    setLoading(true);
    const reader = await fetchData(BACKEND_URL, {
      title: "Tiêu đề câu hỏi",
      messages: [
        {
          content: `${message}`,
          role: "user",
        },
      ],
      stream: true,
      temperature: 0,
      chatbotId: "J4qpEMLa0otv2ybSEEb6P",
    });
    setLoading(false);
    if (!reader) return;
    setEnd(false);
    const decoder = new TextDecoder("utf-8");
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.startsWith("ERROR:")) {
          setError("Có lỗi xảy ra, vui lòng thử lại sau.");
          break;
        }
        console.log("chunk:::", chunk);
        setData((prev) => prev + preprocessDataStream(chunk));
      }
    } catch (error) {
      console.error(error);
      setError((error as AxiosError).message);
    }
  };
  console.log("data::", data);
  return (
    <>
      <div
        style={{
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoComplete="on"
            // disabled={end}
          />
          <button type="submit" disabled={!!data}>
            Send
          </button>
        </form>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          marginInline: "20%",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {message && <p>input: {message}</p>}
          {loading && <p>loading...</p>}
          {error && <p>error: {error}</p>}
          {data && !error && (
            <p
              style={{
                wordBreak: "break-all",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              <span>messageId: {messageId}</span>
              <br />
              <span>conversationId: {conversationId}</span>
              <br />
              <span>
                output: {data.replace(/{.*?}/g, "")} {end ? "END" : "..."}
              </span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
