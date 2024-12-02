import axios from "axios"
import React, { useMemo, useState } from "react"
import { AudioRecorder } from "react-audio-voice-recorder"
import getWaveBlob from "wav-blob-util"

function UnScripted() {
    const [file, setFile] = useState()
    const [isScoring, setIsScoring] = useState(false)
    const [progress, setProgress] = useState(null)
    const [data, setData] = useState()
    const [fileUrl, setFileUrl] = useState('')

    const fileSrc = useMemo(() => {
        if (!file && !fileUrl) return;
        return fileUrl || URL.createObjectURL(file)
    }, [file, fileUrl])

    const handleFileInput = async (e) => {
        const file = e.target.files[0]
        if (!file) {
            setFile(null)
            return
        }

        const wavBlob = await getWaveBlob(file)
        setFile(wavBlob)
    }

    const handleFileUrlInput = (e) => {
        setFileUrl(e.target.value)
    }

    const handleRecordingComplete = async (blob) => {
        if (!blob) {
            setFile(null)
            return
        }

        const wavBlob = await getWaveBlob(blob)
        setFile(wavBlob)
    };

    const sendScoring = async () => {
        setIsScoring(true)
        setProgress(0)
        setData(null)

        const formData = new FormData()
        formData.append('audio', fileUrl || file)
        formData.append('return_json', true)
        formData.append('api_plan', 'premium')
        const config = {
            headers: {
                Authorization: `Elsa ${process.env.REACT_APP_ELSA_API_KEY}`,
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.progress === 1) {
                    setProgress(null)
                    return
                }
                setProgress(progressEvent.progress)
            }
        }
        const response = await axios.post('https://api.elsanow.io/api/v1/score_audio_plus', formData, config)

        setIsScoring(false)
        setData(response.data)
        console.log(response.data)
    }

    const renderSpeakers = data?.speakers?.map(speaker => {
        const renderUtterances = speaker.utterances.map(utterance => {
            return (
                <tr key={utterance.utterance_id}>
                    <td>{utterance.text}</td>
                    <td style={{ textAlign: 'center' }}>{utterance.result?.nativeness_score}</td>
                </tr>
            )
        })
        const renderTopErrors = speaker.feedbacks.pronunciation.top_errors.map((topError, index) => {
            const renderError = topError.errors.map((error, index) => {
                return (
                    <tr key={index}>
                        {index === 0 && <td rowSpan={topError.errors.length}>{topError.phoneme}</td>}
                        <td>{error.error_phoneme}</td>
                        <td>{error.type}</td>
                        <td>{error.count}</td>
                        <td>{[...new Set(error.examples.map(example => example.text))].join(', ')}</td>
                    </tr>
                )
            })
            return (
                <React.Fragment key={index}>{renderError}</React.Fragment>
            )
        })
        return (
            <div key={speaker.speaker_id}>
                <strong>Speaker {speaker.speaker_id + 1}</strong>
                <br />
                Scoring:
                <br />
                <table border={1} cellPadding={10} cellSpacing={0}>
                    <thead>
                        <tr>
                            <th>ELSA</th>
                            <th>CEFR</th>
                            <th>Other</th>
                        </tr>
                    </thead>
                    <tbody>
                        <td>
                            <ul>
                                <li>EPS: {speaker.metrics.general_scores.elsa.eps_score}</li>
                                <li>Pronunciation: {speaker.metrics.general_scores.elsa.pronunciation_score}</li>
                                <li>Fluency: {speaker.metrics.general_scores.elsa.fluency_score}</li>
                                <li>Grammar: {speaker.metrics.general_scores.elsa.grammar_score}</li>
                                <li>Intonation: {speaker.metrics.general_scores.elsa.intonation_score}</li>
                                <li>Vocab: {speaker.metrics.general_scores.elsa.vocabulary_score}</li>
                            </ul>
                        </td>
                        <td>
                            <ul>
                                <li>Overall: {speaker.metrics.general_scores.cefr.overall_cefr}</li>
                                <li>Pronunciation: {speaker.metrics.general_scores.cefr.pronunciation_cefr}</li>
                                <li>Fluency: {speaker.metrics.general_scores.cefr.fluency_cefr}</li>
                                <li>Grammar: {speaker.metrics.general_scores.cefr.grammar_cefr}</li>
                                <li>Intonation: {speaker.metrics.general_scores.cefr.intonation_cefr}</li>
                                <li>Vocab: {speaker.metrics.general_scores.cefr.vocabulary_cefr}</li>
                            </ul>
                        </td>
                        <td>
                            <ul>
                                <li>IELTS: {speaker.metrics.general_scores.other_scores.ielts_score}</li>
                                <li>PTE: {speaker.metrics.general_scores.other_scores.pte_score}</li>
                                <li>TOEFL: {speaker.metrics.general_scores.other_scores.toefl_score}</li>
                                <li>TOECI: {speaker.metrics.general_scores.other_scores.toeic_score}</li>
                            </ul>
                        </td>
                    </tbody>
                </table>
                <ul>
                    <li>Pausing: {speaker.metrics.other_metrics.fluency.pausing_score}</li>
                    <li>Fluency: {speaker.metrics.other_metrics.fluency.words_per_minute} words per minute</li>
                    <li>Energy: {speaker.metrics.other_metrics.intonation.energy_variation}</li>
                    <li>Pitch: {speaker.metrics.other_metrics.intonation.pitch_variation}</li>
                    <li>Word Prominence: {speaker.metrics.other_metrics.intonation.word_prominence_score}</li>
                    <li>Word Prominence Cerf: {speaker.metrics.other_metrics.intonation.word_prominence_cefr}</li>
                </ul>
                <br />
                Utterances:
                <br />
                <table border={1} cellPadding={10} cellSpacing={0}>
                    <thead>
                        <tr>
                            <th>Text</th>
                            <th>Nativeness score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderUtterances}
                    </tbody>
                </table>
                <br />
                Pronunciation feedback:
                <br />
                <table border={1} cellPadding={10} cellSpacing={0}>
                    <thead>
                        <tr>
                            <th>Phoneme</th>
                            <th>Error phoneme</th>
                            <th>Error type</th>
                            <th>Count</th>
                            <th>Error example</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTopErrors}
                    </tbody>
                </table>
                {/* {JSON.stringify(speaker.feedbacks.pronunciation)} */}
            </div>
        )
    })

    return (
        <>
            <div>
                <input type="file" onInput={handleFileInput} />
            </div>
            <div>OR</div>
            <div>
                <input type="text" onInput={handleFileUrlInput} placeholder="File URL" />
            </div>
            <br />
            <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true,
                }}
                showVisualizer={true}
            />
            <br />
            {
                fileSrc &&
                <>
                    <audio src={fileSrc} controls={true} />
                    <br />
                    {
                        !isScoring
                            ?
                            <button onClick={sendScoring}>Send scoring</button>
                            :
                            <>
                                {
                                    progress !== null
                                        ?
                                        <div>Uploading: {(progress * 100).toFixed(2)}%</div>
                                        :
                                        <div>Scoring...</div>
                                }
                            </>
                    }
                </>
            }
            <br />
            <br />
            {
                (data?.recording_quality !== 'ok')
                    ?
                    <>
                        {
                            data?.assessment_quality && <div>Assessment quality: {data?.assessment_quality}</div>
                        }
                        {
                            data?.recording_quality && <div>Recording quality: {data?.recording_quality}</div>
                        }
                    </>
                    :
                    <>
                        {/* <div><strong>Transcript:</strong> {data?.transcript}</div>
                        <br /> */}
                        {
                            data?.assessment_quality && <div>Assessment quality: {data?.assessment_quality}</div>
                        }
                        {renderSpeakers}
                    </>
            }
        </>
    )
}

export default UnScripted