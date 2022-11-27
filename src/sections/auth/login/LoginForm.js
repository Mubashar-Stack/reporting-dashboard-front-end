/* eslint-disable */
import * as Yup from 'yup';

import { useNavigate } from 'react-router-dom';
import api from '../../../http-commn';
import React, { useState, useEffect } from 'react';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// form
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from '../../../components/hook-form';

// ----------------------------------------------------------------------

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  // width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function LoginForm() {
  /* eslint-disable */
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [issuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleIsSuccessClose = () => setIsSuccess(false);
  const handleIsSuccessOpen = () => setIsSuccess(true);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
    remember: true,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (values) => {
    const data = JSON.stringify(values);
    const config = {
      method: 'post',
      url: '/auth/login',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    api(config)
      .then(async (response) => {
        const result = JSON.parse(JSON.stringify(response.data));
        console.log(result?.data, result?.type);
        window.localStorage.setItem('token', result?.data);
        window.localStorage.setItem('type', result?.type);
        window.localStorage.setItem('first_name', result?.first_name);
        window.localStorage.setItem('last_name', result?.last_name);
        window.localStorage.setItem('email', result?.email);
        window.localStorage.setItem('photo', result?.photo);
        window.localStorage.setItem('id', result?.id);

        console.log(result?.type == 'admin' ? '/dashboard/app' : '/customerDashboard/app');
        navigate(result?.type == 'admin' ? '/dashboard/app' : '/customerDashboard/app', { replace: true });
      })
      .catch(function (error) {
        console.log(error);
        setMessage('Invalid credentials!');
        handleIsSuccessOpen();
      });
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email address" />

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <RHFCheckbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover"  onClick={handleOpen}>
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        Login
      </LoadingButton>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isOpen}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isOpen}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Contact Support
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              Email:- support@pubxmedia.com
            </Typography>
          </Box>
        </Fade>
      </Modal>
      <Snackbar open={issuccess} autoHideDuration={6000} onClose={handleIsSuccessClose}>
        <Alert onClose={handleIsSuccessClose} severity="error" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
}
