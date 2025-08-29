import axios from "axios";
import { useEffect, useState } from "react";

import styles from "./Scripted.module.css";
import { AudioRecorder } from "react-audio-voice-recorder";

function Scripted() {
  const [vocabs, setVocabs] = useState([])
  const [selectedVocab, setSelectedVocab] = useState({})
  const [utterance, setUtterance] = useState()
  const [isScoring, setIsScoring] = useState(false)
  const [plan, setPlan] = useState('standard')

  useEffect(() => {
    const getVocabs = async () => {
      const response = await axios.get(
        "https://api-stg.ismart.edu.vn/api/ipro-lms/vocab/get-all-vocab"
      );
      setVocabs(response.data.results);
    };
    getVocabs();
  }, []);

  const handleVocabSelect = (vocab) => {
    setSelectedVocab(vocab)
    setUtterance(null)
  }

  const handleRecordingComplete = async (blob) => {
    setIsScoring(true)
    setUtterance(null)

    const formData = new FormData()
    formData.append('audio_file', blob)
    formData.append('sentence', selectedVocab.word)
    formData.append('return_feedback_hints', true)
    formData.append('api_plan', plan)
    const config = {
      headers: {
        Authorization: `Elsa ${process.env.REACT_APP_ELSA_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    }
    const response = await axios.post('https://api.elsanow.io/api/v3/score_audio', formData, config)

    setIsScoring(false)
    const [utterance] = response?.data?.utterance || {}
    setUtterance(utterance)
  };

  const renderVocabList = vocabs.map((vocab, index) => {
    return <div key={index} className={styles.vocab} onClick={() => handleVocabSelect(vocab)}>{vocab.word}</div>;
  });

  const renderUtteranceWords = utterance?.words?.map((word, index) => {
    const renderPhonemes = word.phonemes.map((phoneme, index) => {
      const renderFeedbacks = phoneme.feedback?.map((fb, index) => {
        return (
          <div key={index}>{fb.text}</div>
        )
      })
      return (
        <td key={index}>
          {phoneme.text}
          <br />
          {phoneme.nativeness_score} - {phoneme.decision}
          {renderFeedbacks}
        </td>
      )
    })
    return <tr key={index}>{renderPhonemes}</tr>
  })

  return (
    <div>
      <div style={{ textAlign: 'center', marginTop: 5 }}>
        <button onClick={() => setPlan('standard')} style={{ backgroundColor: plan === 'standard' ? '#ddd' : 'initial' }}>
          Standard
        </button>
        &nbsp;&nbsp;
        <button onClick={() => setPlan('premium')} style={{ backgroundColor: plan === 'premium' ? '#ddd' : 'initial' }}>
          Premium
        </button>
      </div>
      <table style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td>
              <div className={styles.vocabList}>{renderVocabList}</div>
            </td>
            <td style={{ paddingLeft: 30 }}>
              {
                selectedVocab.id &&
                <>
                  <div className={styles.selectedVocab}>
                    <div>{selectedVocab.word}</div>
                    <div>{selectedVocab.word_phonetic}</div>
                    <div>
                      <audio src={selectedVocab.vocabVoiceUrl} controls={true}></audio>
                    </div>
                    <div>
                      <img src={selectedVocab.illustrationUrl} alt="Illustration" />
                    </div>
                  </div>
                  <div className={styles.recorder}>
                    {
                      isScoring ? 'Scoring...' :
                        <AudioRecorder
                          onRecordingComplete={handleRecordingComplete}
                          audioTrackConstraints={{
                            noiseSuppression: true,
                            echoCancellation: true,
                          }}
                          showVisualizer={true}
                        />
                    }
                  </div>
                  {
                    utterance?.attempt_type !== 'RELEVANT'
                      ?
                      <div>{utterance?.attempt_type && `${utterance?.attempt_type}, please try again.`}</div>
                      :
                      <div className={styles.utterance}>
                        <div>Recording quality: {utterance.recording_quality}</div>
                        <br />
                        <table border={1} cellSpacing={0} cellPadding={10}>
                          <tbody>
                            <tr>
                              <td>Pronunciation</td>
                              <td>{utterance.decision}</td>
                            </tr>
                            <tr>
                              <td>Score</td>
                              <td>{utterance.pronunciation_score}</td>
                            </tr>
                            {renderUtteranceWords}
                          </tbody>
                        </table>
                      </div>
                  }
                </>
              }
            </td>
            <td style={{ paddingLeft: 30, width: '40%' }}>
              <textarea style={{ width: '100%' }} rows={40} value={JSON.stringify(utterance, null, 2)} readOnly={true}></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Scripted;
