
import Header from '../Components/Header'
import { Table } from 'react-bootstrap'

const ViewPage = () => {
  return (

    <div>
       <Header />
     <div>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Aquí se pueden mapear los datos de la tabla */}
          <tr>
            <td>1</td>
            <td>Juan Perez</td>
            <td>12345678A</td>
       
               </tr>
        </tbody>
      </Table>
     </div>
    </div>
    
  )
}

export default ViewPage