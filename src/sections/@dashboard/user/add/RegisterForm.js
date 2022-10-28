/* eslint-disable */
import * as React from 'react';
import FileUpload from 'react-material-file-upload';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import { Stack, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import axios from 'axios';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Iconify from '../../../../components/Iconify';


export default function HorizontalLabelPositionBelowStepper(props) {
  const { isEdit, isView, data } = props;
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const [showPassword, setShowPassword] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [isFileChange, setIsFileChange] = React.useState(false);
  const [isChangedPassword, setIsChangedPassword] = React.useState(false);

  const [files, setFiles] = React.useState([]);
  const [url, setURL] = React.useState('https://www.w3schools.com/howto/img_avatar.png');
  const [avatar, setAvatar] = React.useState('https://www.w3schools.com/howto/img_avatar.png');

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [bankName, setBankName] = React.useState('');
  const [bankAddress, setBankAddress] = React.useState('');
  const [accountHolderName, setAccountHolderName] = React.useState('');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [IFSCCode, setIFSCCode] = React.useState('');
  const [accountHolderAddress, setAccountHolderAddress] = React.useState('');
  const [SWIFTBICCode, setSWIFTBICCode] = React.useState('');
  const [payPalEmail, setPayPalEmail] = React.useState('');

  React.useEffect(() => {
    if (isEdit || isView) {
      let config = {
        method: 'get',
        url: `http://localhost:5000/users/${data?.id}`,
        headers: {},
      };
      axios(config)
        .then(function (response) {
          const User = JSON.parse(JSON.stringify(response.data.data));
          setURL(`http://localhost:5000/${User?.photo}`);
          setAvatar(User?.photo);
          setFirstName(User?.first_name);
          setLastName(User?.last_name);
          setPassword(User?.password);
          setEmail(User?.email);
          setBankName(User?.banck_name);
          setBankAddress(User?.bank_address);
          setAccountHolderName(User?.bank_ac_holder_name);
          setAccountNumber(User?.account_number);
          setIFSCCode(User?.IFSC_code);
          setAccountHolderAddress(User?.bank_account_holder_address);
          setSWIFTBICCode(User?.swift_bic_code);
          setPayPalEmail(User?.paypal_email_address);
          setDisabled(isEdit ? false : true);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, []);

  const handleNext = () => {
    if (isEdit) {
      var newData = new FormData();
      newData.append('firstName', firstName);
      newData.append('lastName', lastName);
      newData.append('email', email);
      newData.append('password', password);
      newData.append('avatar', isFileChange ? files[0] : avatar);
      newData.append('banck_name', bankName);
      newData.append('bank_address', bankAddress);
      newData.append('bank_ac_holder_name', accountHolderName);
      newData.append('account_number', accountNumber);
      newData.append('IFSC_code', IFSCCode);
      newData.append('bank_account_holder_address', accountHolderAddress);
      newData.append('swift_bic_code', SWIFTBICCode);
      newData.append('paypal_email_address', payPalEmail);
      newData.append('isFileChange', isFileChange);
      newData.append('isChangedPassword', isChangedPassword);

      var config = {
        method: 'put',
        url: `http://localhost:5000/user/update/${data?.id}`,
        headers: {},
        data: newData,
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          alert('User Edit Successfully!');
          window.location.reload();
        })
        .catch(function (error) {
          if (error.response) {
            // Request made and server responded
            alert(error.response?.data?.message);
          } else if (error.request) {
            // The request was made but no response was received
            alert('Something is Wrong!');
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            alert('Something is Wrong!');
            console.log('Error', error.message);
          }
        });
    } else {
      if (files.length > 0) {
        var newData = new FormData();
        newData.append('firstName', firstName);
        newData.append('lastName', lastName);
        newData.append('email', email);
        newData.append('password', password);
        newData.append('avatar', files[0]);
        newData.append('banck_name', bankName);
        newData.append('bank_address', bankAddress);
        newData.append('bank_ac_holder_name', accountHolderName);
        newData.append('account_number', accountNumber);
        newData.append('IFSC_code', IFSCCode);
        newData.append('bank_account_holder_address', accountHolderAddress);
        newData.append('swift_bic_code', SWIFTBICCode);
        newData.append('paypal_email_address', payPalEmail);

        var config = {
          method: 'post',
          url: 'http://localhost:5000/user/add',
          headers: {},
          data: newData,
        };

        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
            alert('User Added Successfully!');
            window.location.reload();
          })
          .catch(function (error) {
            if (error.response) {
              // Request made and server responded
              alert(error.response?.data?.message);
            } else if (error.request) {
              // The request was made but no response was received
              alert('Something is Wrong!');
              console.log(error.request);
            } else {
              // Something happened in setting up the request that triggered an Error
              alert('Something is Wrong!');
              console.log('Error', error.message);
            }
          });
      } else {
        alert('Please select image!');
      }
    }
  };

  const fileToDataUri = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });

  const setUserImage = (e) => {
    fileToDataUri(e.target.files[0]).then((dataUri) => {
      isEdit ? setIsFileChange(true) : null;
      setURL(dataUri);
      setFiles(e.target.files);
    });
  };

  return (
    <Container>
      <React.Fragment>
        <Grid container spacing={0}>
          <Stack spacing={1}>
            <Typography variant="h6" gutterBottom>
              User Detail
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <div>
                <input
                  accept="image/*"
                  style={{
                    display: 'none',
                  }}
                  id="icon-button-file"
                  type="file"
                  disabled={disabled}
                  onChange={(e) => {
                    setUserImage(e);
                  }}
                />
                <label htmlFor="icon-button-file">
                  <IconButton color="primary" aria-label="upload picture" component="span">
                    <Avatar src={url} sx={{ width: 70, height: 70 }} />
                  </IconButton>
                </label>
              </div>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                required
                id="firstName"
                disabled={disabled}
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                required
                id="lastName"
                disabled={disabled}
                value={lastName}
                label="Last Name"
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                required
                id="email"
                label="Email"
                disabled={disabled}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Stack>
            <TextField
              required
              name="password"
              label="Password"
              disabled={disabled}
              value={isEdit ? (isChangedPassword ? password : '') : password}
              onChange={(e) => {
                setPassword(e.target.value);
                isEdit ? setIsChangedPassword(true) : null;
              }}
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: !isView ? (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <Typography variant="h6" gutterBottom>
              Payment method
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                required
                id="Bank Name "
                label="Bank Name "
                value={bankName}
                disabled={disabled}
                fullWidth
                // autoComplete="cc-name"
                onChange={(e) => setBankName(e.target.value)}
              />

              <TextField
                required
                id="bankAddress"
                label="Bank Address"
                value={bankAddress}
                disabled={disabled}
                fullWidth
                // inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}

                onChange={(e) => setBankAddress(e.target.value)}
              />

              <TextField
                required
                id="accountHolderName"
                label="Account Holder Name"
                value={accountHolderName}
                disabled={disabled}
                fullWidth
                onChange={(e) => setAccountHolderName(e.target.value)}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                required
                id="accountNumber"
                label="Account Number"
                value={accountNumber}
                disabled={disabled}
                fullWidth
                onChange={(e) => setAccountNumber(e.target.value)}
              />

              <TextField
                required
                id="accountHolderAddress"
                label="Account Holder Address"
                value={accountHolderAddress}
                disabled={disabled}
                fullWidth
                onChange={(e) => setAccountHolderAddress(e.target.value)}
              />

              <TextField
                required
                id="IFSCCode"
                label="IFSCCode"
                value={IFSCCode}
                disabled={disabled}
                fullWidth
                onChange={(e) => setIFSCCode(e.target.value)}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                id="SWIFTBICCode"
                label="SWIFT/BIC Code"
                value={SWIFTBICCode}
                disabled={disabled}
                fullWidth
                onChange={(e) => setSWIFTBICCode(e.target.value)}
              />

              <TextField
                id="payPalEmail"
                label="PayPal Email"
                value={payPalEmail}
                disabled={disabled}
                fullWidth
                onChange={(e) => setPayPalEmail(e.target.value)}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={handleNext} sx={{ ml: 1 }}>
                Submit
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </React.Fragment>
    </Container>
  );
}
