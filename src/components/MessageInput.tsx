import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  Square,
  FileText,
  Image as ImageIcon,
  User as ContactIcon,
  MapPin,
} from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Message } from "../types";

// --- Start: Type definitions for Web Speech API ---
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
// --- End: Type definitions for Web Speech API ---

interface MessageInputProps {
  onSendMessage: (message: string | Partial<Message>) => void;
  isDarkMode?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isDarkMode,
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<number | null>(null);
  const intentionalStopRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>("");

  const formatRecordingTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let currentFinalTranscript = finalTranscriptRef.current;
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current = currentFinalTranscript;
      setMessage(currentFinalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      if (intentionalStopRef.current) {
        // Manually stopped, do nothing.
      } else if (recognitionRef.current) {
        // Stopped on its own, restart it to continue recording.
        recognitionRef.current.start();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        intentionalStopRef.current = true;
      }
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleAttachmentOptionClick = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
    setShowAttachmentMenu(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileUrl = e.target?.result as string;
        const messageType = file.type.startsWith("image/")
          ? "image"
          : "document";

        onSendMessage({
          type: messageType,
          text: file.name,
          fileUrl: fileUrl,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      // Stop recording
      intentionalStopRef.current = true;
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    } else {
      // Start recording
      finalTranscriptRef.current = "";
      setMessage("");
      setRecordingTime(0);
      setIsRecording(true);
      intentionalStopRef.current = false;
      recognitionRef.current?.start();
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target as Node) &&
        attachmentButtonRef.current &&
        !attachmentButtonRef.current.contains(event.target as Node)
      ) {
        setShowAttachmentMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const attachmentOptions = [
    {
      icon: FileText,
      label: "Document",
      color: "bg-purple-500",
      onClick: () => handleAttachmentOptionClick("*/*"),
    },
    {
      icon: ImageIcon,
      label: "Photos & videos",
      color: "bg-pink-500",
      onClick: () => handleAttachmentOptionClick("image/*,video/*"),
    },
    {
      icon: ContactIcon,
      label: "Contact",
      color: "bg-blue-500",
      onClick: () => alert("Contact feature not implemented."),
    },
    {
      icon: MapPin,
      label: "Location",
      color: "bg-green-500",
      onClick: () => alert("Location feature not implemented."),
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-wa-panel-bg-dark border-t border-gray-200 dark:border-wa-border-dark px-4 md:px-6 py-3 relative">
      {showAttachmentMenu && (
        <div
          ref={attachmentMenuRef}
          className="absolute bottom-20 left-4 bg-white dark:bg-wa-panel-bg-dark rounded-lg shadow-lg py-2 w-64 z-20 origin-bottom-left transition-transform transform scale-100"
        >
          <ul>
            {attachmentOptions.map((option, index) => (
              <li key={index}>
                <button
                  onClick={option.onClick}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-wa-hover-dark"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${option.color}`}
                  >
                    <option.icon size={20} className="text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-wa-text-dark">
                    {option.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showEmojiPicker && !isRecording && (
        <div ref={emojiPickerRef} className="absolute bottom-20 z-10">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
            lazyLoadEmojis={true}
            height={400}
            width={350}
          />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <div className="flex items-center text-gray-600 dark:text-wa-panel-header-icon-dark relative">
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachmentMenu(false);
            }}
            className="p-2 hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors"
            disabled={isRecording}
          >
            <Smile size={24} />
          </button>
          <button
            ref={attachmentButtonRef}
            type="button"
            onClick={() => {
              setShowAttachmentMenu(!showAttachmentMenu);
              setShowEmojiPicker(false);
            }}
            className="p-2 hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors ml-1"
            disabled={isRecording}
          >
            <Paperclip size={24} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 relative flex items-center bg-white dark:bg-wa-hover-dark rounded-lg">
          {isRecording && (
            <div className="flex items-center pl-4 pr-2 text-red-500 flex-shrink-0">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-mono ml-2 text-sm text-gray-900 dark:text-wa-text-dark">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Recording..." : "Type a message"}
            className="w-full px-4 py-2.5 bg-transparent border-transparent rounded-lg focus:outline-none text-gray-900 dark:text-wa-text-dark resize-none max-h-32 min-h-[44px] leading-relaxed"
            rows={1}
            readOnly={isRecording}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
        </div>

        <div className="flex-shrink-0">
          {isRecording ? (
            <button
              type="button"
              onClick={handleMicClick}
              className="p-2.5 text-gray-600 dark:text-wa-panel-header-icon-dark hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors"
            >
              <Square size={24} className="text-red-500" />
            </button>
          ) : message.trim() ? (
            <button
              type="submit"
              className="p-2.5 bg-green-500 dark:bg-wa-green text-white rounded-full hover:bg-green-600 dark:hover:bg-wa-green-dark transition-colors"
            >
              <Send size={24} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMicClick}
              className="p-2.5 text-gray-600 dark:text-wa-panel-header-icon-dark hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors"
            >
              <Mic size={24} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
