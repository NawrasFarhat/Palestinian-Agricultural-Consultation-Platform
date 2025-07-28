import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import Navbar from '../../components/Navbar';
import styles from '../../styles/EditDisease.module.css';

const EditDisease = ({ onLogout }) => {
  const { diseaseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    symptoms: '',
    solution: ''
  });
  const [questions, setQuestions] = useState(['']);
  const [answers, setAnswers] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (diseaseId) {
      loadDiseaseData();
    } else {
      setInitialLoading(false);
    }
  }, [diseaseId]);

  const loadDiseaseData = async () => {
    try {
      // Load disease data
      const disease = await ApiService.getDiseaseById(diseaseId);
      setFormData({
        name: disease.name || '',
        symptoms: disease.symptoms || '',
        solution: disease.solution || ''
      });

      // Load questions for this disease based on user role
      const currentUser = AuthService.getCurrentUser();
      let diseaseQuestions;
      
      if (currentUser?.role === 'manager') {
        // Managers use their own endpoint
        diseaseQuestions = await ApiService.getQuestionsForDiseaseAsManager(diseaseId);
      } else {
        // Engineers use their endpoint
        diseaseQuestions = await ApiService.getQuestionsForDisease(diseaseId);
      }

      if (diseaseQuestions.length > 0) {
        setQuestions(diseaseQuestions.map(q => q.text));
        setAnswers(diseaseQuestions.map(q => q.answer || ''));
      } else {
        setQuestions(['']);
        setAnswers(['']);
      }
    } catch (err) {
      setError('Failed to load disease data. Please check if the disease exists.');
    } finally {
      setInitialLoading(false);
    }
  };

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
    // Questions are optional for editing - if none provided, existing questions will be preserved
    if (validQuestions.length === 0) {
      // Don't show error for empty questions - they will be preserved from existing disease
      console.log('No questions provided - existing questions will be preserved');
    }

    try {
      const diseaseData = {
        diseaseId: parseInt(diseaseId),
        name: formData.name.trim(),
        symptoms: formData.symptoms.trim(),
        solution: formData.solution.trim(),
        questions: validQuestions, // Send empty array if no questions provided
        answers: answers.filter((_, i) => validQuestions[i] && validQuestions[i].trim().length > 0) // Filter answers to match valid questions
      };

      // Check if user is manager or engineer
      const currentUser = AuthService.getCurrentUser();
      if (currentUser?.role === 'manager') {
        // Managers can update directly
        await ApiService.updateDiseaseDirectly(diseaseData);
        setSuccess('Disease updated successfully!');
      } else {
        // Engineers need approval
        await ApiService.submitDiseaseEdit(diseaseData);
        setSuccess('Disease edit submitted for approval. A manager will review your changes.');
      }
      
      // Redirect back to appropriate page after a short delay
      setTimeout(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser?.role === 'manager') {
          navigate('/manager/diseases');
        } else {
          navigate('/engineer/dashboard');
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update disease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate based on user role
    const currentUser = AuthService.getCurrentUser();
    if (currentUser?.role === 'manager') {
      navigate('/manager/diseases');
    } else {
      navigate('/engineer/dashboard');
    }
  };

  // Allow both managers and engineers to access this page
  if (!AuthService.isLoggedIn() || !['manager', 'engineer'].includes(AuthService.getCurrentUser()?.role)) {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for managers and engineers only.</div>;
  }

  if (initialLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading disease data...</div>;
  }

  const currentUser = AuthService.getCurrentUser();
  const userRole = currentUser?.role;

  return (
    <div className={styles.container}>
      {/* Only show Navbar if not manager */}
      {userRole !== 'manager' && <Navbar role={userRole} onLogout={onLogout} />}
      <h2 className={styles.title}>Edit Disease</h2>
      <div style={{ width: '85vw', maxWidth: 'none', margin: '0 auto' }}>
        {error && (
          <div className={`${styles.section} ${styles.error}`}>
            {error}
          </div>
        )}
        {success && (
          <div className={`${styles.section} ${styles.success}`}>
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Disease Information</div>
            <label className={styles.label} htmlFor="name">Disease Name *</label>
            <input
              className={styles.input}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter disease name"
              required
            />
            <label className={styles.label} htmlFor="symptoms">Symptoms *</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              placeholder="Enter symptoms"
              required
              rows={3}
            />
            <label className={styles.label} htmlFor="solution">Solution/Treatment *</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              id="solution"
              name="solution"
              value={formData.solution}
              onChange={handleInputChange}
              placeholder="Enter solution or treatment"
              required
              rows={3}
            />
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Diagnostic Questions (Optional)</div>
            <div className={styles.qaScrollBox}>
              {questions.map((q, idx) => (
                <div key={idx} className={styles.qaItem}> 
                  <input
                    className={styles.input}
                    type="text"
                    value={q}
                    onChange={e => handleQuestionChange(idx, e.target.value)}
                    placeholder={`Question ${idx + 1}`}
                  />
                  <input
                    className={styles.input}
                    type="text"
                    value={answers[idx] || ''}
                    onChange={e => handleAnswerChange(idx, e.target.value)}
                    placeholder={`Answer for question ${idx + 1}`}
                    style={{ marginTop: 10 }}
                  />
                  {questions.length > 1 && (
                    <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => removeQuestion(idx)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className={styles.button} onClick={addQuestion}>
              + Add Question
            </button>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDisease;
