'use client';
import { Toaster, toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  societies,
  ieeeSocieties,
  ieeeSocietiesShort,
  clubs,
  clubsShort,
} from '../../public/data/data';
import { ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  UserPlus,
  UserEdit,
  Search,
  Save,
  Delete,
  Key,
  Refresh,
  CheckCircle,
  Error,
} from '@phosphor-icons/react';
import theme from '../../lib/mui-theme';

export default function Manage() {
  const { data: session, status } = useSession();

  // Form state
  const [name, setName] = useState('');
  const [fetchEMail, setFetchEmail] = useState('');
  const [currSoc, setCurrSoc] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [dept, setDept] = useState('');
  const [mail, setMail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [id, setId] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userFetched, setUserFetched] = useState(false);
  const [errors, setErrors] = useState({});

  const clearForm = () => {
    setId('');
    setName('');
    setCollegeName('');
    setDept('');
    setMail('');
    setPassword('');
    setUserType('');
    setIsSuperAdmin(false);
    setIdNumber('');
    setRole('');
    setPhone('');
    setCurrSoc('');
    setFetchEmail('');
    setUserFetched(false);
    setErrors({});
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    clearForm();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!mail.trim()) newErrors.mail = 'Email is required';
    if (!userType) newErrors.userType = 'User type is required';
    if (activeTab === 0 && !password.trim())
      newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleFetch = async () => {
    if (!fetchEMail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/fetchUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fetchUser',
          mail: fetchEMail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'User not found') {
          toast.error('User not found');
          setUserFetched(false);
          return;
        }

        const user = data.message[0];
        setId(user._id);
        setDept(user.dept);
        setName(user.name);
        setMail(user.email);
        setUserType(user.userType);
        setIsSuperAdmin(user.isSuperAdmin);
        setIdNumber(user.id);
        setCollegeName(user.college);
        setRole(user.role);
        setPhone(user.phone);

        const receivedDept = user.dept;
        let college = user.college;

        if (ieeeSocietiesShort.includes(receivedDept)) {
          college = 'common';
          setUserType('professionalsocieties');
          setDept('IEEE');
          setCurrSoc(receivedDept);
        } else if (clubsShort.includes(receivedDept)) {
          college = 'common';
          setUserType('clubincharge');
          setDept(receivedDept);
        } else if (societies.includes(receivedDept)) {
          college = 'common';
          setUserType('professionalsocieties');
        } else {
          setDept(receivedDept);
          setUserType(user.userType);
        }

        setCollegeName(college);
        setUserFetched(true);
        toast.success('User fetched successfully');
      } else {
        toast.error('Failed to fetch user');
        setUserFetched(false);
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
      toast.error('Failed to fetch user');
      setUserFetched(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/changePwd', {
        method: 'POST',
        body: JSON.stringify({ action: 'admin', _id: id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
      } else {
        toast.error('Error changing password');
      }
    } catch (error) {
      console.error('Error changing password', error);
      toast.error('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/editUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: id,
          name,
          college: collegeName,
          dept: dept === 'IEEE' ? currSoc : userType === 'admin' ? '-' : dept,
          mail,
          userType:
            userType === 'professionalsocieties' || userType === 'clubincharge'
              ? 'HOD'
              : userType,
          isSuperAdmin,
          phone,
          role,
          id: idNumber,
        }),
      });
      if (response.ok) {
        toast.success('User updated successfully');
        clearForm();
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/fetchUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteUser',
          mail: fetchEMail,
        }),
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        setFetchEmail('');
        clearForm();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          college:
            collegeName !== 'SIT' && collegeName !== 'SEC'
              ? 'common'
              : collegeName,
          dept: dept === 'IEEE' ? currSoc : userType === 'admin' ? '-' : dept,
          mail,
          password,
          userType:
            userType === 'professionalsocieties' || userType === 'clubincharge'
              ? 'HOD'
              : userType,
          isSuperAdmin,
        }),
      });

      if (response.ok) {
        toast.success('User added successfully!');
        clearForm();
      } else {
        toast.error('Failed to add user');
      }
    } catch (error) {
      console.error('Failed to add user', error);
      toast.error('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <ThemeProvider theme={theme}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='100vh'
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  const currUser = session?.user?.isSuperAdmin;
  if (currUser === 0) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='100vh'
        >
          <Alert severity='error' sx={{ fontSize: '2rem', p: 4 }}>
            Not Authorized !!
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  const renderConditionalFields = () => {
    const fields = [];

    // College Name field
    if (['staff', 'HOD', 'student', 'admin'].includes(userType)) {
      fields.push(
        <Grid item xs={12} md={6} key='college'>
          <FormControl fullWidth error={!!errors.collegeName}>
            <InputLabel>College Name</InputLabel>
            <Select
              value={collegeName}
              onChange={e => setCollegeName(e.target.value)}
              label='College Name'
            >
              <MenuItem value='SIT'>SIT</MenuItem>
              <MenuItem value='SEC'>SEC</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      );
    }

    // Professional Societies field
    if (userType === 'professionalsocieties') {
      fields.push(
        <Grid item xs={12} md={6} key='societies'>
          <FormControl fullWidth error={!!errors.dept}>
            <InputLabel>Professional Societies</InputLabel>
            <Select
              value={dept}
              onChange={e => setDept(e.target.value)}
              label='Professional Societies'
            >
              {societies.map((society, index) => (
                <MenuItem key={index} value={society}>
                  {society}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      );
    }

    // IEEE Society Name field
    if (
      userType === 'professionalsocieties' &&
      (dept === 'IEEE' || ieeeSocieties.includes(dept))
    ) {
      fields.push(
        <Grid item xs={12} md={6} key='ieee'>
          <FormControl fullWidth error={!!errors.currSoc}>
            <InputLabel>IEEE Society Name</InputLabel>
            <Select
              value={currSoc}
              onChange={e => setCurrSoc(e.target.value)}
              label='IEEE Society Name'
            >
              {ieeeSocieties.map((option, index) => (
                <MenuItem key={index} value={ieeeSocietiesShort[index]}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      );
    }

    // Department fields for SIT
    if (
      ['HOD', 'staff', 'student'].includes(userType) &&
      collegeName === 'SIT'
    ) {
      fields.push(
        <Grid item xs={12} md={6} key='sit-dept'>
          <FormControl fullWidth error={!!errors.dept}>
            <InputLabel>Department</InputLabel>
            <Select
              value={dept}
              onChange={e => setDept(e.target.value)}
              label='Department'
            >
              <MenuItem value='CS'>CSE</MenuItem>
              <MenuItem value='IT'>IT</MenuItem>
              <MenuItem value='EE'>EEE</MenuItem>
              <MenuItem value='EC'>ECE</MenuItem>
              <MenuItem value='ME'>MECH</MenuItem>
              <MenuItem value='SC'>Cyber Security</MenuItem>
              <MenuItem value='CO'>CCE</MenuItem>
              <MenuItem value='AI'>AI-DS</MenuItem>
              <MenuItem value='MB'>MBA</MenuItem>
              <MenuItem value='PH'>Physics</MenuItem>
              <MenuItem value='EN'>English</MenuItem>
              <MenuItem value='MA'>Maths</MenuItem>
              <MenuItem value='CH'>Chemistry</MenuItem>
              <MenuItem value='PD'>Physical Education</MenuItem>
              <MenuItem value='TA'>Tamil</MenuItem>
              <MenuItem value='SBIT'>IEEE Student Branch</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      );
    }

    // Department fields for SEC
    if (
      ['HOD', 'staff', 'student'].includes(userType) &&
      collegeName === 'SEC'
    ) {
      fields.push(
        <Grid item xs={12} md={6} key='sec-dept'>
          <FormControl fullWidth error={!!errors.dept}>
            <InputLabel>Department</InputLabel>
            <Select
              value={dept}
              onChange={e => setDept(e.target.value)}
              label='Department'
            >
              <MenuItem value='AI'>AI-DS</MenuItem>
              <MenuItem value='AM'>AI-ML</MenuItem>
              <MenuItem value='CB'>CSBS</MenuItem>
              <MenuItem value='CS'>CSE</MenuItem>
              <MenuItem value='EE'>EEE</MenuItem>
              <MenuItem value='EC'>ECE</MenuItem>
              <MenuItem value='EI'>E&I</MenuItem>
              <MenuItem value='ME'>MECH</MenuItem>
              <MenuItem value='CE'>CIVIL</MenuItem>
              <MenuItem value='IT'>IT</MenuItem>
              <MenuItem value='IC'>ICE</MenuItem>
              <MenuItem value='CI'>IOT</MenuItem>
              <MenuItem value='MB'>MBA</MenuItem>
              <MenuItem value='CJ'>M.Tech CSE</MenuItem>
              <MenuItem value='MU'>Mech & Auto</MenuItem>
              <MenuItem value='PH'>Physics</MenuItem>
              <MenuItem value='EN'>English</MenuItem>
              <MenuItem value='MA'>Maths</MenuItem>
              <MenuItem value='CH'>Chemistry</MenuItem>
              <MenuItem value='PD'>Physical Education</MenuItem>
              <MenuItem value='TA'>Tamil</MenuItem>
              <MenuItem value='SBEC'>IEEE Student Branch</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      );
    }

    // Clubs field
    if (userType === 'clubincharge') {
      fields.push(
        <Grid item xs={12} md={6} key='clubs'>
          <FormControl fullWidth error={!!errors.dept}>
            <InputLabel>Clubs</InputLabel>
            <Select
              value={dept}
              onChange={e => setDept(e.target.value)}
              label='Clubs'
            >
              {clubs.map((club, index) => (
                <MenuItem key={index} value={clubsShort[index]}>
                  {club}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      );
    }

    return fields;
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Toaster />

        <Typography variant='h4' component='h1' gutterBottom sx={{ mb: 4 }}>
          User Management
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant='fullWidth'
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<UserPlus size={20} />}
              label='Add User'
              iconPosition='start'
            />
            <Tab
              icon={<UserEdit size={20} />}
              label='Edit User'
              iconPosition='start'
            />
          </Tabs>
        </Paper>

        {/* Add User Tab Content */}
        {activeTab === 0 && (
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant='h5'
                component='h2'
                gutterBottom
                sx={{ mb: 3 }}
              >
                Add New User
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.userType} required>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      value={userType}
                      onChange={e => setUserType(e.target.value)}
                      label='User Type'
                    >
                      <MenuItem value='admin'>Admin</MenuItem>
                      <MenuItem value='HOD'>HOD</MenuItem>
                      <MenuItem value='professionalsocieties'>
                        Professional Society Head
                      </MenuItem>
                      <MenuItem value='clubincharge'>Club Incharge</MenuItem>
                      <MenuItem value='staff'>Staff</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {renderConditionalFields()}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Email'
                    type='email'
                    value={mail}
                    onChange={e => setMail(e.target.value)}
                    error={!!errors.mail}
                    helperText={errors.mail}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Password'
                    type='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSuperAdmin}
                        onChange={e => setIsSuperAdmin(e.target.checked)}
                      />
                    }
                    label='Super Admin'
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction='row' spacing={2}>
                    <Button
                      variant='contained'
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Save size={20} />
                        )
                      }
                    >
                      {loading ? 'Adding...' : 'Add User'}
                    </Button>
                    <Button
                      variant='outlined'
                      onClick={clearForm}
                      startIcon={<Refresh size={20} />}
                    >
                      Clear Form
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Edit User Tab Content */}
        {activeTab === 1 && (
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant='h5'
                component='h2'
                gutterBottom
                sx={{ mb: 3 }}
              >
                Edit Existing User
              </Typography>

              {/* Fetch User Section */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant='h6' gutterBottom>
                  Find User
                </Typography>
                <Grid container spacing={2} alignItems='center'>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label='Email Address'
                      type='email'
                      value={fetchEMail}
                      onChange={e => setFetchEmail(e.target.value)}
                      placeholder="Enter user's email address"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant='contained'
                      onClick={handleFetch}
                      disabled={loading || !fetchEMail.trim()}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Search size={20} />
                        )
                      }
                      fullWidth
                    >
                      {loading ? 'Searching...' : 'Fetch User'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* User Details Form */}
              {userFetched && (
                <Box>
                  <Alert severity='success' sx={{ mb: 3 }}>
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <CheckCircle size={20} />
                      <Typography>
                        User found! You can now edit their details below.
                      </Typography>
                    </Stack>
                  </Alert>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label='User Name'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label='Email Address'
                        type='email'
                        value={mail}
                        disabled
                        helperText='Email cannot be changed'
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.userType} required>
                        <InputLabel>User Type</InputLabel>
                        <Select
                          value={userType}
                          onChange={e => setUserType(e.target.value)}
                          label='User Type'
                        >
                          <MenuItem value='admin'>Admin</MenuItem>
                          <MenuItem value='HOD'>HOD</MenuItem>
                          <MenuItem value='professionalsocieties'>
                            Professional Society Head
                          </MenuItem>
                          <MenuItem value='clubincharge'>
                            Club Incharge
                          </MenuItem>
                          <MenuItem value='staff'>Staff</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {renderConditionalFields()}

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label='ID Number'
                        value={idNumber}
                        onChange={e => setIdNumber(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label='Role'
                        value={role}
                        onChange={e => setRole(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label='Phone Number'
                        type='tel'
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isSuperAdmin}
                            onChange={e => setIsSuperAdmin(e.target.checked)}
                          />
                        }
                        label='Is Super Admin?'
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction='row' spacing={2} flexWrap='wrap'>
                        <Button
                          variant='contained'
                          onClick={handleUpdate}
                          disabled={loading}
                          startIcon={
                            loading ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Save size={20} />
                            )
                          }
                        >
                          {loading ? 'Updating...' : 'Update User'}
                        </Button>
                        <Button
                          variant='outlined'
                          color='error'
                          onClick={handleDelete}
                          disabled={loading}
                          startIcon={<Delete size={20} />}
                        >
                          Delete User
                        </Button>
                        <Button
                          variant='outlined'
                          color='warning'
                          onClick={handleChangePassword}
                          disabled={loading}
                          startIcon={<Key size={20} />}
                        >
                          Reset Password
                        </Button>
                        <Button
                          variant='outlined'
                          onClick={clearForm}
                          startIcon={<Refresh size={20} />}
                        >
                          Clear Form
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Container>
    </ThemeProvider>
  );
}
