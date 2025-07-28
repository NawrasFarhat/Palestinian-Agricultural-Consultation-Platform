import React, { useState } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from '../../styles/AddDiseaseForm.module.css';

const AddDiseaseForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    symptoms: '',
    solution: ''
  });
  const [questions, setQuestions] = useState(['']);
  const [answers, setAnswers] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'engineer') {
    return <div className={styles.container}>Access denied. This page is for engineers only.</div>;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
    setAnswers([...answers, '']);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      const newAnswers = answers.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      setAnswers(newAnswers);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name.trim() || !formData.symptoms.trim() || !formData.solution.trim()) {
      setError('Please fill in all disease information fields.');
      setLoading(false);
      return;
    }

    const validQuestions = questions.filter(q => q.trim().length > 0);
    if (validQuestions.length === 0) {
      setError('Please add at least one diagnostic question.');
      setLoading(false);
      return;
    }

    try {
      const diseaseData = {
        name: formData.name.trim(),
        symptoms: formData.symptoms.trim(),
        solution: formData.solution.trim(),
        questions: validQuestions
      };

      await ApiService.addDiseaseWithQuestions(diseaseData);
      setSuccess('Disease and questions added successfully!');
      
      // Reset form
      setFormData({ name: '', symptoms: '', solution: '' });
      setQuestions(['']);
      setAnswers(['']);
    } catch (err) {
      setError(err.message || 'Failed to add disease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add New Disease with Diagnostic Questions</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Disease Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Disease Information</h3>
          
          <div>
            <label className={styles.label}>
              Disease Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter disease name..."
              className={styles.input}
              required
            />
          </div>

          <div>
            <label className={styles.label}>
              Symptoms *
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              placeholder="Describe the symptoms of this disease..."
              rows={4}
              className={styles.textarea}
              required
            />
          </div>

          <div>
            <label className={styles.label}>
              Solution/Treatment *
            </label>
            <textarea
              name="solution"
              value={formData.solution}
              onChange={handleInputChange}
              placeholder="Describe the treatment or solution for this disease..."
              rows={4}
              className={styles.textarea}
              required
            />
          </div>
        </div>

        {/* Diagnostic Questions */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Diagnostic Questions</h3>
          
          {questions.map((question, index) => (
            <div key={index} className={styles.questionRow}>
              <input
                type="text"
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder={`Question ${index + 1}...`}
                className={styles.input}
              />
              <input
                type="text"
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={styles.input}
                placeholder={`Answer for question ${index + 1}`}
                style={{ marginTop: 10 }}
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className={`${styles.button} ${styles.removeButton}`}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addQuestion}
            className={`${styles.button} ${styles.addButton}`}
          >
            + Add Question
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${styles.submitButton}`}
        >
          {loading ? 'Adding Disease...' : 'Add Disease with Questions'}
        </button>
      </form>

      {/* Messages */}
      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AddDiseaseForm; 