import { Button } from "@chakra-ui/button";
import { Select } from '@chakra-ui/react'
import { Input } from "@chakra-ui/input";
import Nav from "./components/Nav/nav";
import './App.css'
import { Text } from "@chakra-ui/layout";
import { Textarea } from "@chakra-ui/textarea";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [intervalID, setIntervalID] = useState(0);
  const [error, setError] = useState('');
  var issuerAccount = '';
  var token = '';

  useEffect(() => {
    fetch('http://localhost:3001/data', { mode: 'cors' })
      .then(response => response.json())
      .then(data => setSavedAccounts(data))
      .catch(error => console.log(error))
  }, [savedAccounts]);

  function autoFunding() {
    console.log('entre a autofunding')

    try {
      axios({
        method: 'post',
        url: 'http://localhost:3001/fund',
        data: {
          issuerAccount: issuerAccount,
          token: token
        }
      })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });

    } catch (error) {
      console.log(error.response)
    }
  }

  function startFundingBot() {
    issuerAccount = document.getElementById("issuerAccount").value;;
    token = document.getElementById("token").value;

    if (!issuerAccount || !token) {
      setError('No se pudo iniciar. Por favor agregue la cuenta emisora y el nombre del token a crear')
      console.log('Error. Faltan datos')
      return;
    };

    // console.log('Entre en la funcion startFundingBot');
    setIntervalID(setInterval(autoFunding, 60000))
    console.log('intervalID en la funcion startFundingBot', intervalID)
    setError('');
    console.log('intervalID: ', intervalID);
  }

  function stopFundingBot(intervalID) {
    console.log('Se va a detener el intervalId: ', intervalID);
    clearInterval(intervalID);
    setIntervalID(0);
    //console.log('cleared! intervalID: ', intervalID)
  }

  return (
    <div className="App">
      <Nav />
      <div className="container">
        <div className="left">
          <Text fontSize='3xl'>Creacion de cuentas</Text>
          <Text fontSize='lg'>Cuenta emisora</Text>
          <Input id="issuerAccount" placeholder="G3F03DDJJ..." />
          <Text fontSize='lg'>Token</Text>
          <Input id="token" placeholder="Nombre del Token" />
          {error ? <Text fontSize='sm'>{error}</Text> : null}
          <Button colorScheme='teal'
            onClick={() => startFundingBot()}>Iniciar</Button>
          <Button colorScheme='teal'
            onClick={() => console.log(intervalID)}>Mostrar valor del intervalID</Button>
          <Button colorScheme='red'
            onClick={() => stopFundingBot(intervalID)}>Detener</Button>
          <Textarea placeholder='Log del bot...' />
          <Text fontSize='lg'>Cuentas creadas:</Text>
          <Select placeholder={
            savedAccounts.length > 0 ? 'Se crearon: ' + savedAccounts.length + ' cuentas' : 'No hay cuentas creadas'
          }>
            {savedAccounts
              ? savedAccounts.map(account =>
                <option value='account'>{account}</option>
              )
              : null
            }
          </Select>
          {/* <Textarea placeholder='Cuentas creadas...' defaultValue={savedAccounts} readOnly /> */}
        </div>
        <div className="right">
          <Text fontSize='3xl'>Pagos automaticos</Text>
          <Text fontSize='lg'>Ingrese el rango de minutos:</Text>
          <Input placeholder="Tiempo minimo. Por ej: 60" />
          <Input placeholder="Tiempo maximo. Por ej: 120" />
          <Button colorScheme='teal'>Iniciar</Button>
          <Button colorScheme='red'>Detener</Button>
          <Button onClick={() =>
            setSavedAccounts([...savedAccounts, 'SDUTP62NAIZRZKU6KSG4NNTGYJZVZDZ5IUBXAUZN2SRQI4ISSZDT7XAX'])
          }></Button>
          <Textarea placeholder='Log del bot...' />
        </div>
      </div>
    </div>
  );
}

export default App;



