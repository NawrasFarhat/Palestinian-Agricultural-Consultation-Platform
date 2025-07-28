// src/pages/engineer/EngineerDashboard.jsx
import React, { useEffect, useState } from "react";
import ApiService from "../../services/ApiService";
import styles from "../../styles/Common/EngineerDashboard.module.css";

const EngineerDashboard = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editDisease, setEditDisease] = useState(null);
  const [form, setForm] = useState({ name: "", symptoms: "", solution: "" });
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionInput, setQuestionInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [questionEditId, setQuestionEditId] = useState(null);
  const [questionEditText, setQuestionEditText] = useState("");
  const [answerEditText, setAnswerEditText] = useState("");
  const [pendingStatus, setPendingStatus] = useState({});

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAllDiseases();
      setDiseases(data);
    } catch (err) {
      setError("Failed to fetch diseases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  // Fetch pending status for all diseases on load
  useEffect(() => {
    const fetchPendingStatuses = async () => {
      try {
        const res = await Promise.all(
          diseases.map(d => ApiService.makeRequest(`/engineer/diseases/${d.id}/questions`)) // dummy call to force await
        );
        // Instead, fetch pending changes for the engineer (if endpoint exists)
        // For now, just set all to false
        setPendingStatus({});
      } catch {
        setPendingStatus({});
      }
    };
    if (diseases.length > 0) fetchPendingStatuses();
  }, [diseases]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setEditDisease(null);
    setForm({ name: "", symptoms: "", solution: "" });
    setShowForm(true);
  };

  const handleEdit = (disease) => {
    setEditDisease(disease);
    setForm({ name: disease.name, symptoms: disease.symptoms, solution: disease.solution });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this disease?")) return;
    try {
      await ApiService.deleteDisease(id);
      fetchDiseases();
    } catch (err) {
      setError("You are not authorized to delete diseases. Only IT admins or managers can perform this action");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDisease) {
        // Engineers should submit for approval, not update directly
        const diseaseData = {
          diseaseId: editDisease.id,
          name: form.name,
          symptoms: form.symptoms,
          solution: form.solution,
          questions: [] // This would need to be populated with existing questions
        };
        await ApiService.submitDiseaseEdit(diseaseData);
        alert("Disease edit submitted for approval. A manager will review your changes.");
      } else {
        await ApiService.addDiseaseWithQuestions(form);
      }
      setShowForm(false);
      fetchDiseases();
    } catch (err) {
      setError("Failed to save disease");
    }
  };

  const fetchQuestions = async (disease) => {
    setSelectedDisease(disease);
    setShowQuestions(true);
    setQuestionInput("");
    setAnswerInput("");
    setQuestionEditId(null);
    setQuestionEditText("");
    setAnswerEditText("");
    try {
      const data = await ApiService.getQuestionsForDisease(disease.id);
      setQuestions(data);
    } catch (err) {
      setError("Failed to fetch questions");
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (questionInput.trim().length < 3) {
      setError("Question must be at least 3 characters.");
      return;
    }
    try {
      await ApiService.addQuestionToDisease(selectedDisease.id, questionInput, answerInput);
      setQuestionInput("");
      setAnswerInput("");
      fetchQuestions(selectedDisease);
    } catch (err) {
      setError("Failed to add question");
    }
  };

  const handleEditQuestion = (q) => {
    setQuestionEditId(q.id);
    setQuestionEditText(q.text);
    setAnswerEditText(q.answer || '');
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    if (questionEditText.trim().length < 3) {
      setError("Question must be at least 3 characters.");
      return;
    }
    try {
      await ApiService.updateQuestion(questionEditId, questionEditText, answerEditText);
      setQuestionEditId(null);
      setQuestionEditText("");
      setAnswerEditText("");
      fetchQuestions(selectedDisease);
    } catch (err) {
      setError("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await ApiService.deleteQuestion(id);
      fetchQuestions(selectedDisease);
    } catch (err) {
      setError("Failed to delete question");
    }
  };

  const handleSubmitForApproval = async (disease) => {
    setError("");
    try {
      await ApiService.submitChange(disease.id);
      alert("Submission sent for approval.");
      // Optionally update UI to reflect pending status
    } catch (err) {
      setError(err.message || "Failed to submit for approval");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Engineer Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table className={styles.dashboardTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Symptoms</th>
              <th>Solution</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.symptoms}</td>
                <td>{d.solution}</td>
                <td>
                  <div className={styles.buttonContainer}>
                    <button className={styles.actionButton} onClick={() => handleEdit(d)}>Edit</button>
                    <button className={styles.actionButton} onClick={() => handleDelete(d.id)}>Delete</button>
                    <button className={styles.actionButton} onClick={() => fetchQuestions(d)}>Manage Questions</button>
                    <button className={styles.actionButton} onClick={() => handleSubmitForApproval(d)}>
                      Submit for Approval
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className={styles.formContainer}>
          <h3>{editDisease ? "Edit Disease" : "Add Disease"}</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label>
              <input name="name" value={form.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label>Symptoms:</label>
              <textarea name="symptoms" value={form.symptoms} onChange={handleInputChange} required />
            </div>
            <div>
              <label>Solution:</label>
              <textarea name="solution" value={form.solution} onChange={handleInputChange} required />
            </div>
            <div className={styles.formButtonContainer}>
              <button className={styles.actionButton} type="submit">Save</button>
              <button className={styles.actionButton} type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showQuestions && selectedDisease && (
        <div className={styles.questionsContainer}>
          <h3>Questions for: {selectedDisease.name}</h3>
          <button className={styles.closeButton} onClick={() => setShowQuestions(false)}>Close</button>
          <ul style={{ marginTop: 30 }}>
            {questions.map(q => (
              <li key={q.id} className={styles.questionItem}>
                {questionEditId === q.id ? (
                  <form onSubmit={handleUpdateQuestion} style={{ display: 'block', marginBottom: 20 }}>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Question:</label>
                      <input
                        value={questionEditText}
                        onChange={e => setQuestionEditText(e.target.value)}
                        required
                        minLength={3}
                        style={{ fontSize: 16, width: '100%', padding: 8 }}
                      />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Answer:</label>
                      <input
                        value={answerEditText}
                        onChange={e => setAnswerEditText(e.target.value)}
                        style={{ fontSize: 16, width: '100%', padding: 8 }}
                        placeholder="Enter expected answer (optional)"
                      />
                    </div>
                    <div>
                      <button className={styles.actionButton} type="submit">Save</button>
                      <button className={styles.actionButton} type="button" onClick={() => setQuestionEditId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <strong>Question:</strong> {q.text}
                    </div>
                    <div style={{ marginBottom: 10, color: '#666' }}>
                      <strong>Answer:</strong> {q.answer || 'No answer set'}
                    </div>
                    <div className={styles.questionButtonContainer}>
                      <button className={styles.actionButton} onClick={() => handleEditQuestion(q)}>Edit</button>
                      <button className={styles.actionButton} onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddQuestion} className={styles.addQuestionForm}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>New Question:</label>
              <input
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                required
                minLength={3}
                placeholder="Add new question..."
                style={{ fontSize: 16, width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Expected Answer:</label>
              <input
                value={answerInput}
                onChange={e => setAnswerInput(e.target.value)}
                placeholder="Enter expected answer (optional)"
                style={{ fontSize: 16, width: '100%', padding: 8 }}
              />
            </div>
            <button className={styles.actionButton} type="submit">Add Question</button>
          </form>
        </div>
      )}
      <div className={styles.welcomeBox}>
        <h3 className={styles.welcomeTitle}>Welcome, Engineer!</h3>
        <p className={styles.welcomeText}>
          You can add new diseases, submit edits for approval, and manage diagnostic questions. Use the dashboard tools to keep disease information up to date.
        </p>
      </div>
    </div>
  );
};

export default EngineerDashboard;
