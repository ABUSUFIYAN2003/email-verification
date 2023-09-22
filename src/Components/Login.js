import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../FirebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';

export const Login = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;

  const [email, setEmail] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [infoMsg, setInfoMsg] = useState('');

  const [initialLoading, setInitialLoading] = useState(false);
  const [initialError, setInitialError] = useState('');

  useEffect(() => {
    if (user) {
      // user is already signed in
      navigate('/');
    } else {
      // user is not signed in but the link is valid
      if (isSignInWithEmailLink(auth, window.location.href)) {
        // now in case user clicks the email link on a different device, we will ask for email confirmation
        let email = localStorage.getItem('email');
        if (!email) {
          email = window.prompt('Please provide your email');
        }
        // after that, we will complete the login process
        setInitialLoading(true);
        signInWithEmailLink(auth, localStorage.getItem('email'), window.location.href)
          .then((result) => {
            // we can get the user from result.user but no need in this case
            console.log(result.user);
            localStorage.removeItem('email');
            setInitialLoading(false);
            setInitialError('');
            navigate('/');
          })
          .catch((err) => {
            setInitialLoading(false);
            setInitialError(err.message);
            navigate('/login');
          });
      } else {
        console.log('Enter email and sign in');
      }
    }
  }, [user, search, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginLoading(true);
    sendSignInLinkToEmail(auth, email, {
      // this is the URL that we will redirect back to after clicking on the link in mailbox
      url: 'http://localhost:3000/login',
      handleCodeInApp: true,
    })
      .then(() => {
        localStorage.setItem('email', email);
        setLoginLoading(false);
        setLoginError('');
        setInfoMsg('We have sent you an email with a link to sign in');
      })
      .catch((err) => {
        setLoginLoading(false);
        setLoginError(err.message);
      });
  };

  return (
    <div
      style={{
        backgroundColor: '#eeaeca', // Background color for the entire page
        minHeight: '100vh',
        minWidth:'1400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width:'400px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
          border: '3px solid #000000', // Add border
         
        }}
      >
        {initialLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {initialError !== '' ? (
              <div style={{ color: 'red' }}>{initialError}</div>
            ) : (
              <>
                {/* We are checking user because for a split second, we will not have user */}
                {user ? (
                  // so instead of seeing the form, I am using this please wait message
                  <div>Please wait...</div>
                ) : (
                  // for a split second, we will see this form
                  <form
                    className='form-group custom-form'
                    onSubmit={handleLogin}
                    style={{ margin: '20px 0' }} // Add margin
                  >
                    <label>Email</label>
                    <input
                      type={'email'}
                      required
                      placeholder='Enter Email'
                      className='form-control'
                      value={email || ''}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        borderBlockColor:'blue',
                      }}
                    />
                    <button
                      type='submit'
                      className='btn btn-success btn-md'
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                      disabled={loginLoading}
                    >
                      {loginLoading ? <span>Logging you in</span> : <span>Login</span>}
                    </button>
                    {/* show login error msg */}
                    {loginError !== '' && (
                      <div style={{ color: 'red', marginTop: '10px' }}>{loginError}</div>
                    )}

                    {/* show info msg */}
                    {infoMsg !== '' && (
                      <div style={{ color: 'green', marginTop: '10px' }}>{infoMsg}</div>
                    )}
                  </form>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
