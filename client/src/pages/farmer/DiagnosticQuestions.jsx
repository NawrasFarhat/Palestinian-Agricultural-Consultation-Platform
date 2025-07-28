import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const DiagnosticQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Get all diseases first to get their questions
      const diseases = await ApiService.getAllDiseases();
      const allQuestions = [];
      
      // Fetch questions for each disease
      for (const disease of diseases) {
        try {
          const diseaseQuestions = await ApiService.getQuestionsForDisease(disease.id);
          allQuestions.push(...diseaseQuestions.map(q => ({
            ...q,
            diseaseName: disease.name
          })));
        } catch (err) {
          console.log(`No questions for disease ${disease.name}`);
        }
      }
      
      setQuestions(allQuestions);
    } catch (err) {
      setError('Failed to fetch diagnostic questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer: answer
      }));

      if (answersArray.length === 0) {
        setError('Please answer at least one question');
        setSubmitting(false);
        return;
      }

      await ApiService.submitAnswers(answersArray);
      setSuccess('Your answers have been submitted successfully!');
      setAnswers({});
    } catch (err) {
      setError('Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'farmer') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for farmers only.</div>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <h2>Diagnostic Questions</h2>
      <p style={{ marginBottom: 20, color: '#666' }}>
        Please answer the following questions to help with disease diagnosis:
      </p>

      {loading ? (
        <p>Loading questions...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : questions.length === 0 ? (
        <p>No diagnostic questions available at the moment.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.map((question) => (
            <div key={question.id} style={{ 
              marginBottom: 20, 
              padding: 15, 
              border: '1px solid #ddd', 
              borderRadius: 8,
              backgroundColor: '#f9f9f9'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: 10 }}>
                <span style={{ color: '#2c5aa0' }}>Disease:</span> {question.diseaseName}
              </p>
              <p style={{ marginBottom: 10 }}>
                <strong>Question:</strong> {question.text}
              </p>
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Enter your answer..."
                rows={3}
                style={{
                  width: '100%',
                  padding: 8,
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  fontSize: 14
                }}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting || Object.keys(answers).length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: submitting ? '#ccc' : '#2c5aa0',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </form>
      )}

      {success && (
        <p style={{ color: 'green', marginTop: 20, padding: 10, backgroundColor: '#e8f5e8', borderRadius: 4 }}>
          {success}
        </p>
      )}
    </div>
  );
};

export default DiagnosticQuestions; 