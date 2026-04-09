import { Form, Button } from "react-bootstrap";
import "../CSS/Formulario.css";
import  { useState } from "react";
const Formulario = () => {




  const initialState = {
    nombre: "",
    apellido: "",
    edad: "",
  };

  const [data, setData] = useState(initialState);
  const [usuarios, setUsuarios] = useState([]);



  const handleChange = (e) => {
    setData({...data, [e.target.name]: e.target.value });
   
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    setUsuarios([...usuarios, data])
    setData(initialState); 
  };
  console.log(usuarios);

  return (
    <>
      <div className="contenedorGeneral">
        <Form className="contenedorForm" onSubmit={handleSubmit}>
          <Form.Group className=" contenedorLabel1  mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa tunombre" name="nombre"
              onChange={handleChange}
            />
            <Form.Label>Apellido</Form.Label>
            <Form.Control type="text" placeholder="Ingresa tu apellido" name="apellido" onChange={handleChange} />
          </Form.Group>

          <Form.Group className=" contenedorLabel1  mb-3">
            <Form.Label>Ingresa tu edad</Form.Label>
            <Form.Control type="text" placeholder="Ingresa tu edad" name="edad" onChange={handleChange} />
          </Form.Group>
          <div className="contendorBoton">
            <Button className="botonForm" variant="primary" type="submit">
              Guardar
            </Button>
          </div>
        </Form>

      </div>
        <h2>Nombre: {data.nombre} {data.apellido} {data.edad}</h2>
       
    </>
  );
};

export default Formulario;
