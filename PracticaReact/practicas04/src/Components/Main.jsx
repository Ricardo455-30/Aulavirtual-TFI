import {Table, Button} from 'react-bootstrap';
import '../CSS/Main.css';
import {useState, useEffect} from 'react';
import axios from 'axios';
import { URL_CLIENTES } from '../Constants/endpoints';
import { Link } from 'react-router-dom';


const Main = () => {
  
const [datos, setDatos] = useState([]);

const getClientes = async () => {
    try {
      const response = await axios.get(URL_CLIENTES);
      setDatos(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };

  useEffect(() => {
    getClientes();
  }, []);


  return (
    <>
    <h1>Bienvenidos al MAIN</h1>
{/* <Link to='/view' className="btn btn-primary">Ver Clientes</Link> */}


    <div className='containerMain'>
       

       <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>DNI</th>
          <th>Email</th>
        </tr>
      </thead>

{datos.map((cliente) => (<tbody key={cliente.id}>
        <tr>
          <td>{cliente.id}</td>
          <td>{cliente.nombre}</td>
          <td>{cliente.dni}</td>
          <td>{cliente.email}</td>
        
        <td>
          <button className='btn btn-primary'>Editar</button>
          <button className='btn btn-danger'>Ver</button>
          <button className='btn btn-success'>Eliminar</button>
        </td>
</tr>
      </tbody>
      ))}   



    </Table>


     
    </div>
    </>
  );
};

export default Main;
