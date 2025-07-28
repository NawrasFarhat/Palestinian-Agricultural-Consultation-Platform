import React, { useState } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const AutoDiagnosis = () => {
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagnosisType, setDiagnosisType] = useState('auto'); // 'auto' or 'ai'

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'farmer') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for farmers only.</div>;
  }

  const handleAutoDiagnosis = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe the symptoms');
      return;
    }

    setLoading(true);
    setError('');
    setDiagnosis(null);

    try {
      const result = await ApiService.autoDiagnose(symptoms);
      setDiagnosis({
        type: 'auto',
        result: result.diagnosis || result.message,
        recommendations: result.recommendations || []
      });
      setDiagnosisType('auto');
    } catch (err) {
      setError('Auto diagnosis failed. Please try again or use AI diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIDiagnosis = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe the symptoms');
      return;
    }

    setLoading(true);
    setError('');
    setDiagnosis(null);

    try {
      const result = await ApiService.getAiDiagnosis(symptoms);
      setDiagnosis({
        type: 'ai',
        result: result.diagnosis?.disease || 'Unknown condition',
        confidence: result.diagnosis?.confidence || 0,
        recommendations: result.diagnosis?.recommendations || []
      });
      setDiagnosisType('ai');
    } catch (err) {
      setError('AI diagnosis failed. Please try again or use auto diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseSuggestions = async () => {
    if (!symptoms.trim()) {
      setError('Please enter symptoms to get suggestions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ApiService.getDiseaseSuggestions(symptoms);
      if (result.suggestions && result.suggestions.length > 0) {
        setDiagnosis({
          type: 'suggestions',
          result: 'Disease Suggestions',
          suggestions: result.suggestions
        });
      } else {
        setError('No disease suggestions found for these symptoms');
      }
    } catch (err) {
      setError('Failed to get disease suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <h2>Automatic Disease Diagnosis</h2>
      <p style={{ marginBottom: 20, color: '#666' }}>
        Describe the symptoms you're observing and get an automatic diagnosis.
      </p>

      {/* Symptoms Input */}
      <div style={{ marginBottom: 30 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>
          Describe the Symptoms *
        </label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe the symptoms you're seeing on your plants... (e.g., yellow leaves, brown spots, wilting)"
          rows={5}
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid #ccc',
            borderRadius: 4,
            fontSize: 16,
            resize: 'vertical'
          }}
          required
        />
      </div>

      {/* Diagnosis Options */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 15, color: '#2c5aa0' }}>Choose Diagnosis Method:</h3>
        
        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
          <button
            onClick={handleAutoDiagnosis}
            disabled={loading || !symptoms.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: loading || !symptoms.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: loading || !symptoms.trim() ? 'not-allowed' : 'pointer',
              flex: 1,
              minWidth: 200
            }}
          >
            🔍 Auto Diagnosis
          </button>

          <button
            onClick={handleAIDiagnosis}
            disabled={loading || !symptoms.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: loading || !symptoms.trim() ? '#ccc' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: loading || !symptoms.trim() ? 'not-allowed' : 'pointer',
              flex: 1,
              minWidth: 200
            }}
          >
            🤖 AI Diagnosis
          </button>

          <button
            onClick={getDiseaseSuggestions}
            disabled={loading || !symptoms.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: loading || !symptoms.trim() ? '#ccc' : '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: loading || !symptoms.trim() ? 'not-allowed' : 'pointer',
              flex: 1,
              minWidth: 200
            }}
          >
            💡 Get Suggestions
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: 20, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          marginBottom: 20
        }}>
          <div style={{ fontSize: '2em', marginBottom: 10 }}>🔍</div>
          <p>Analyzing symptoms and generating diagnosis...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ 
          marginBottom: 20, 
          padding: 15, 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: 4,
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Diagnosis Results */}
      {diagnosis && !loading && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: 20, 
          borderRadius: 8,
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ 
            marginBottom: 15, 
            color: '#2c5aa0',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            {diagnosis.type === 'auto' && '🔍'}
            {diagnosis.type === 'ai' && '🤖'}
            {diagnosis.type === 'suggestions' && '💡'}
            Diagnosis Results
            {diagnosis.type === 'ai' && diagnosis.confidence && (
              <span style={{ 
                fontSize: '0.8em', 
                backgroundColor: '#28a745', 
                color: 'white',
                padding: '4px 8px',
                borderRadius: 4
              }}>
                {Math.round(diagnosis.confidence * 100)}% Confidence
              </span>
            )}
          </h3>

          {diagnosis.type === 'suggestions' ? (
            <div>
              <p style={{ marginBottom: 15, fontWeight: 'bold' }}>Possible Diseases:</p>
              <div style={{ display: 'grid', gap: 10 }}>
                {diagnosis.suggestions.map((suggestion, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    padding: 15,
                    borderRadius: 4,
                    border: '1px solid #dee2e6'
                  }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#2c5aa0' }}>
                      {suggestion.name}
                    </h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>
                      {suggestion.symptoms}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ 
                backgroundColor: 'white', 
                padding: 15, 
                borderRadius: 4,
                marginBottom: 15,
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2c5aa0' }}>Diagnosis:</h4>
                <p style={{ margin: 0, fontSize: '1.1em' }}>{diagnosis.result}</p>
              </div>

              {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 10, color: '#2c5aa0' }}>Recommendations:</h4>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {diagnosis.recommendations.map((rec, index) => (
                      <li key={index} style={{ marginBottom: 5 }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div style={{ 
            marginTop: 20, 
            padding: 15, 
            backgroundColor: '#e8f4fd', 
            borderRadius: 4,
            border: '1px solid #bee5eb'
          }}>
            <p style={{ margin: 0, color: '#0c5460', fontSize: '0.9em' }}>
              <strong>Note:</strong> This is an automated diagnosis based on the symptoms provided. 
              For critical issues or if symptoms persist, please consult with an agricultural expert.
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: 30, 
        padding: 20, 
        backgroundColor: '#fff3cd', 
        borderRadius: 8,
        border: '1px solid #ffeaa7'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>How to get the best diagnosis:</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#856404' }}>
          <li>Describe symptoms in detail (color, location, pattern)</li>
          <li>Mention when symptoms first appeared</li>
          <li>Include environmental conditions (weather, soil type)</li>
          <li>Try both Auto and AI diagnosis for comparison</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoDiagnosis; 