import Formulario from './Formulario';
import "../css/login.css";


const Main = () => {
  return (
    <div className='login.page' 
    style={{
      fontFamily: "Arial, sans-serif",
       color: "GrayText",
       } }>
  <h1 style={
    {
      textAlign: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '4.5rem',
      marginBottom: '20px',
      marginTop: '20px'
  }} 
  
  > Gym React</h1>  
      <div className="formulario">
      
      <Formulario />
      </div>
    </div>
  )
}

export default Main
