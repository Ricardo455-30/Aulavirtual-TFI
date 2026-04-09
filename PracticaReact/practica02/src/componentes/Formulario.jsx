import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Formulario() {
  const navigate = useNavigate();
  const handleRegrist = (event) => {
    event.preventDefault();
    // Aquí puedes agregar la lógica para manejar el registro
    // Por ejemplo, redirigir a una página de registro o mostrar un formulario de registro
    navigate("/registro")
;
  };

  return (
    <div className="login"
    style={{
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      borderRadius: "10px",
      width: "400px",
      margin: "auto",}}>
      <Form 
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: "20px",
        borderRadius: "10px",
        }}>
        <h1
        style={{
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: "2rem",
          marginBottom: "20px",
          marginTop: "20px",
        }}
        > INGRESE USUARIO</h1>
        <input type="text" 
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}/>
        <h2
        style={{
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: "1.8rem",
          marginBottom: "20px",
        }}
        >INGRESE CONTRASEÑA</h2>
        
        <input type="password"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          boxShadow : "0 2px 4px rgba(142, 18, 18, 0.1)",
        }} />

        <Button
          variant="primary"
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "10px",
            marginTop: "10px",
            fontSize: "1.2rem",
            color: "white",
            backgroundColor: "red",
            borderColor: "#007bff",
          }}
          onClick={() => navigate("/home")}
          >INGRESAR</Button>
      </Form>
    </div>
  );
}
export default Formulario;
