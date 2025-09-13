import React from "react";

export default function Myquiz() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📝 Attempt the Quiz</h1>

        <div style={styles.questionBox}>
          <p style={styles.question}>Q1: What is the capital of France?</p>
          <div style={styles.options}>
            <label style={styles.option}>
              <input type="radio" name="q1" /> Paris
            </label>
            <label style={styles.option}>
              <input type="radio" name="q1" /> London
            </label>
            <label style={styles.option}>
              <input type="radio" name="q1" /> Rome
            </label>
            <label style={styles.option}>
              <input type="radio" name="q1" /> Berlin
            </label>
          </div>
        </div>

        <button style={styles.button}>Submit</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    textAlign: "center" as const,
  },
  title: {
    marginBottom: "20px",
    fontSize: "28px",
    color: "#333",
  },
  questionBox: {
    marginBottom: "20px",
    textAlign: "left" as const,
  },
  question: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  options: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  option: {
    fontSize: "16px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  button: {
    padding: "12px 24px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
  },
};
