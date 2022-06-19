import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {useState} from "react";
import pbkdf2 from "pbkdf2";
import QRCode from "react-qr-code";


export default function Home() {

    const [qrCodeText, setQrCodeText] = useState(null);
    const [loginSuccess, setLoginSuccess] = useState(false);

    const [credentialsCadastro, setCredentialsCadastro] = useState({
        userName: "",
        password: ""
    });

    const [credentialsLogin, setCredentialsLogin] = useState({
        userName: "",
        password: ""
    });

    const [codeAuthentication, setCodeAuthentication] = useState("");

    const sendCadastroRequest = () => {
        const { password } = credentialsCadastro;

        const key = pbkdf2.pbkdf2Sync(password, '6e7320def3d5acc4b16f07d63cfe3dc8', 1, 16, 'sha512');

        const derivatedPass = key.toString('hex');

        fetch('http://localhost:8080/create-user', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userName: credentialsCadastro.userName,
                authToken: derivatedPass

            })
        })
            .then(function(response) {
                return response.json();
            })
            .then(function(obj) {
                setQrCodeText(obj.barCodeUrl);
            });
    }


    const sendLoginRequest = () => {
        const {userName, password } = credentialsLogin;

        const key = pbkdf2.pbkdf2Sync( password, '6e7320def3d5acc4b16f07d63cfe3dc8', 1, 16, 'sha512');

        const derivatedPass = key.toString('hex');

        fetch('http://localhost:8080/auth', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userName,
                authToken: derivatedPass

            })
        })
            .then(function(response) {
                return response.json();
            })
            .then(function(myBlob) {
                setLoginSuccess(true);
                console.log(myBlob)
            });
    }


    const sendTwoFactorRequest = () => {
        fetch('http://localhost:8080/two-factor-auth', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                userName: credentialsLogin.userName,
                OTPCode: codeAuthentication
            }
        })
            .then(function(response) {
                return response.json();
            })
            .then(function(myBlob) {
                console.log(myBlob)
            });
    }


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

          CADASTRO
          <br/>
          Nome:
          <input type="text" value={credentialsCadastro.userName} onChange={(event) => setCredentialsCadastro({...credentialsCadastro, userName: event.target.value})}/>
          Senha:
          <input type="text" value={credentialsCadastro.password} onChange={(event) => setCredentialsCadastro({...credentialsCadastro, password: event.target.value})}/>

          <button onClick={() => sendCadastroRequest()}>
              Cadastrar
          </button>
          <br/>
          <br/>
          {qrCodeText && <QRCode value={qrCodeText} />}
          <br/>
          <br/>
          <br/>
          <br/>

          LOGIN
          <br/>
        Nome:
        <input type="text" value={credentialsLogin.userName} onChange={(event) => setCredentialsLogin({...credentialsLogin, userName: event.target.value})}/>
        Senha:
        <input type="text" value={credentialsLogin.password} onChange={(event) => setCredentialsLogin({...credentialsLogin, password: event.target.value})}/>

        <button onClick={() => sendLoginRequest()}>
          Login
        </button>

          <br/>
          <br/>
          {loginSuccess && <div>Digite o código que aparece no seu aplicativo autenticador</div>}
          <br/>
          <br/>
          <br/>
          <br/>
          <input type="text" value={codeAuthentication} onChange={(event) => setCodeAuthentication(event.target.value)}/>
          <button onClick={() => sendTwoFactorRequest()}>
              Autenticate
          </button>

      </main>
    </div>
  )
}
