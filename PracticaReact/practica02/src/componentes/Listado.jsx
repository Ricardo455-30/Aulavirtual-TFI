const Listado = (props) => {
    
  return (
    <div>
      <h2>Listado de personas</h2>
      {props.usuarios.map((usuario, index)=>  <li key={index} >   {index + 1} : {usuario.nombre} {usuario.apellido} {usuario.edad}</li> )}
    </div>
  )
}

export default Listado