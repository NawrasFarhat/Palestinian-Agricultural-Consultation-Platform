import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from '../../styles/AddDisease.module.css';

const AddDisease = ({ onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    symptoms: '',
    solution: '',
    questions: [''], // Start with one empty question
    answers: [''],   // Start with one empty answer
    baseQuestion: '', // Frontend-only field
    expectedAnswer: '', // Frontend-only field
    skipQuestion: '' // Frontend-only field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is logged in and is a manager
  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for managers only.</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ''],
      answers: [...prev.answers, '']
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      const newAnswers = formData.answers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        questions: newQuestions,
        answers: newAnswers
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Disease name is required');
      return false;
    }
    if (!formData.symptoms.trim()) {
      setError('Symptoms are required');
      return false;
    }
    if (!formData.solution.trim()) {
      setError('Solution is required');
      return false;
    }
    if (formData.questions.length === 0 || formData.questions.some(q => !q.trim())) {
      setError('At least one diagnostic question is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await ApiService.addDiseaseAsManager(formData);
      setSuccess('Disease added successfully!');
      setTimeout(() => {
        navigate('/manager/diseases');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add disease');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Disease</h1>
        <button
          onClick={() => navigate('/manager/diseases')}
          className={styles.backButton}
        >
          ← Back to Diseases
        </button>
      </div>

      <div className={styles.formBox}>
        {error && (
          <div className={`${styles.message} ${styles.error}`}>{error}</div>
        )}
        {success && (
          <div className={`${styles.message} ${styles.success}`}>{success}</div>
        )}
        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Disease Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter disease name"
          />

          <label className={styles.label}>Symptoms *</label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Describe the symptoms of this disease"
          />

          <label className={styles.label}>Solution/Treatment *</label>
          <textarea
            name="solution"
            value={formData.solution}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Describe the treatment or solution for this disease"
          />

          <label className={styles.label}>Diagnostic Questions *</label>
          {formData.questions.map((question, index) => (
            <div key={index} className={styles.questionRow}>
              <input
                type="text"
                value={question}
                onChange={e => handleQuestionChange(index, e.target.value)}
                className={styles.input}
                placeholder={`Question ${index + 1}`}
              />
              <input
                type="text"
                value={formData.answers[index] || ''}
                onChange={e => handleAnswerChange(index, e.target.value)}
                className={styles.input}
                placeholder={`Answer for question ${index + 1}`}
                style={{ marginTop: 10 }}
              />
              {formData.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className={styles.removeQuestionBtn}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className={styles.addQuestionBtn}
          >
            + Add Question
          </button>

          <label className={styles.label}>Base Question</label>
          <select
            name="baseQuestion"
            value={formData.baseQuestion}
            onChange={handleInputChange}
            className={styles.input}
          >
            <option value="">Select a base question</option>
            <option value="What is the soil type?">What is the soil type?</option>
            <option value="When was the last irrigation?">When was the last irrigation?</option>
            <option value="What is the current weather condition?">What is the current weather condition?</option>
            <option value="How old are the plants?">How old are the plants?</option>
            <option value="What fertilizers have been used?">What fertilizers have been used?</option>
          </select>

          <label className={styles.label}>Expected Answer</label>
          <input
            type="text"
            name="expectedAnswer"
            value={formData.expectedAnswer}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter the expected answer"
          />

          <label className={styles.label}>The question to be skipped</label>
          <select
            name="skipQuestion"
            value={formData.skipQuestion}
            onChange={handleInputChange}
            className={styles.input}
          >
            <option value="">Select a question to skip</option>
            <option value="Skip soil analysis">Skip soil analysis</option>
            <option value="Skip weather check">Skip weather check</option>
            <option value="Skip plant age verification">Skip plant age verification</option>
            <option value="Skip fertilizer history">Skip fertilizer history</option>
            <option value="Skip irrigation schedule">Skip irrigation schedule</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Adding...' : 'Add Disease'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDisease; 