import React, { useState } from 'react';
import styles from '../../styles/AddDiseaseForm.module.css';

export default function DiseaseForm() {
  const [diseaseName, setDiseaseName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [symptoms, setSymptoms] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [qaList, setQaList] = useState([]);

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiQaList, setAiQaList] = useState([]);

  const [generalQuestion, setGeneralQuestion] = useState('');
  const [generalAnswer, setGeneralAnswer] = useState('');
  const [generalQaList, setGeneralQaList] = useState([]);

  const [treatment, setTreatment] = useState([]);

  function fetchDiseaseSuggestions(query) {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fakeDiseases = [
      "عين الطاووس",
      "عفن الجذور",
      "عفن الثمار",
      "لفحة الأغصان",
      "ذبول الفيرتيسيليوم",
      "البياض الدقيقي"
    ];

    const filtered = fakeDiseases.filter((name) => name.startsWith(query));
    setSuggestions(filtered);
  }

  function saveDiseaseInfo() {
    if (!diseaseName.trim() || !symptoms.trim()) {
      alert('Please enter both disease name and symptoms description.');
      return;
    }
    alert('✅ Disease info saved (mock).');
  }

  function addQuestionAnswer() {
    if (!currentQuestion.trim() || !currentAnswer.trim()) {
      alert('Please enter both question and answer.');
      return;
    }

    setQaList([...qaList, { question: currentQuestion, answer: currentAnswer }]);
    setCurrentQuestion('');
    setCurrentAnswer('');
  }

  function addGeneralQuestionAnswer() {
    if (!generalQuestion.trim() || !generalAnswer.trim()) {
      alert('Please enter both general question and answer.');
      return;
    }

    setGeneralQaList([...generalQaList, { question: generalQuestion, answer: generalAnswer }]);
    setGeneralQuestion('');
    setGeneralAnswer('');
  }

  function addAiQuestionAnswer() {
    if (!aiQuestion.trim() || !aiAnswer.trim()) {
      alert('Please enter both suggested question and answer.');
      return;
    }

    setAiQaList([...aiQaList, { question: aiQuestion, answer: aiAnswer }]);
    setAiQuestion('');
    setAiAnswer('');
  }

  function addTreatment() {
    if (!treatment.trim()) {
      alert('Please enter the treatment.');
      return;
    }

    alert('✅ Treatment saved (mock).');
  }

  function generateAiSuggestion() {
    const fakeAiSuggestions = [
      {
        suggestedQuestion: "أين تظهر البقع على الأوراق؟",
        suggestedAnswer: "تظهر على السطح العلوي من الأوراق."
      },
      {
        suggestedQuestion: "ما هو لون البقع التي لاحظتها؟",
        suggestedAnswer: "لونها بني ومُحاطة بهالة صفراء باهتة."
      },
      {
        suggestedQuestion: "هل تساقطت الأوراق المصابة؟",
        suggestedAnswer: "نعم، تساقطت الأوراق التي تظهر عليها البقع."
      }
    ];

    const random = Math.floor(Math.random() * fakeAiSuggestions.length);
    const suggestion = fakeAiSuggestions[random];

    setAiQuestion(suggestion.suggestedQuestion);
    setAiAnswer(suggestion.suggestedAnswer);
  }

  const qaOutputText = qaList
    .map((item, i) => `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`)
    .join('\n\n');

  const aiQaOutputText = aiQaList
    .map((item, i) => `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`)
    .join('\n\n');

  const generalQaOutputText = generalQaList
    .map((item, i) => `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`)
    .join('\n\n');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Disease</h1>

      <div className={styles.section} style={{ position: 'relative' }}>
        <label className={styles.label}>Disease Name</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter disease name"
          value={diseaseName}
          onChange={(e) => {
            setDiseaseName(e.target.value);
            fetchDiseaseSuggestions(e.target.value);
          }}
        />
        {suggestions.length > 0 && (
          <ul className={styles.dropdown}>
            {suggestions.map((item, index) => (
              <li
                key={index}
                className={styles.dropdownItem}
                onClick={() => {
                  setDiseaseName(item);
                  setSuggestions([]);
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        <label className={styles.label}>Symptoms Description</label>
        <textarea
          className={styles.textarea}
          placeholder="Describe symptoms here..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <button className={styles.button} onClick={saveDiseaseInfo}>
          Save Disease Info
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>General Diagnostic Questions</h2>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter general question"
            value={generalQuestion}
            onChange={(e) => setGeneralQuestion(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Enter general answer"
            value={generalAnswer}
            onChange={(e) => setGeneralAnswer(e.target.value)}
          />
        </div>
        <button className={styles.button} onClick={addGeneralQuestionAnswer}>
          Add General Question and Answer
        </button>
        <textarea className={styles.textarea} readOnly value={generalQaOutputText} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Disease Questions and Answers</h2>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter question"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Enter answer"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
          />
        </div>
        <button className={styles.button} onClick={addQuestionAnswer}>
          Add New Question and Answer
        </button>
        <textarea className={styles.textarea} readOnly value={qaOutputText} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>AI Suggested Questions and Answers</h2>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder="Suggested question"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Suggested answer"
            value={aiAnswer}
            onChange={(e) => setAiAnswer(e.target.value)}
          />
        </div>
        <div className={styles.row}>
          <button className={styles.button} onClick={addAiQuestionAnswer}>
            Add New Suggested Question and Answer
          </button>
          <button className={`${styles.button} ${styles.secondary}`} onClick={generateAiSuggestion}>
            Generate from AI
          </button>
        </div>
        <textarea className={styles.textarea} readOnly value={aiQaOutputText} />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Treatment</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter suitable treatment"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
        />
        <button className={styles.button} onClick={addTreatment}>
          Add Treatment
        </button>
      </div>
    </div>
  );
}
