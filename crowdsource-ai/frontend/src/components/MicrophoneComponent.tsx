// import * as React from "react";
// import { Button } from "@/components/ui/button"; // shadCN UI or your own button
// import { MicIcon, MicOffIcon } from "lucide-react";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

// export const MicrophoneComponent: React.FC = () => {
//   const {
//     transcript,
//     listening,
//     browserSupportsSpeechRecognition,
//     resetTranscript,
//   } = useSpeechRecognition();

//   if (!browserSupportsSpeechRecognition) {
//     return <p>Your browser does not support Speech Recognition.</p>;
//   }

//   const handleRecord = () => {
//     if (!listening) {
//       // Clear old transcript before new recording
//       resetTranscript();
//       SpeechRecognition.startListening({ continuous: true });
//     } else {
//       SpeechRecognition.stopListening();
//     }
//   };

//   return (
//     <>
//       {/*
//         1) Fixed button at the bottom center
//          - background color changes based on "listening"
//          - icon changes based on "listening"
//       */}
//       <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
//         <button
//           onClick={handleRecord}
//           className={`px-4 py-2 text-lg text-white rounded-full transition-colors
//             ${
//               listening
//                 ? "bg-red-600 hover:bg-red-700"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//         >
//           {listening ? (
//             <MicOffIcon className="w-5 h-5" />
//           ) : (
//             <MicIcon className="w-5 h-5" />
//           )}
//         </button>
//       </div>

//       {/*
//         2) Dark overlay with transcript (only appears when listening is true)
//       */}
//       {listening && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center">
//           <div className="">
//             <p className="text-white text-lg whitespace-pre-wrap">
//               {transcript}
//             </p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

import * as React from "react";
import { MicIcon, MicOffIcon } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface MicrophoneComponentProps {
  setTranscript: React.Dispatch<React.SetStateAction<string | null>>;
}

export const MicrophoneComponent: React.FC<MicrophoneComponentProps> = ({setTranscript }) => {
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support Speech Recognition.</p>;
  }

  const handleRecord = () => {
    if (!listening) {
      // 2) If not recording, reset any old transcript and start
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    } else {
      // 3) If already listening, stop recording and create a JSON object
      SpeechRecognition.stopListening();
      setTranscript(transcript)

      // You could also pass this JSON to another function, e.g.:
      // sendTranscriptToAPI(resultJSON);
    }
  };

  return (
    <>
      {/* Button fixed at bottom center; color/icon changes on listening state */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={handleRecord}
          className={`px-4 py-2 text-lg text-white rounded-full transition-colors 
            ${
              listening
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {listening ? (
            <MicOffIcon className="w-5 h-5" />
          ) : (
            <MicIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Dark overlay with live transcript, only appears while listening */}
      {listening && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center">
          <div>
            <p className="text-white text-lg whitespace-pre-wrap">
              {transcript}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
