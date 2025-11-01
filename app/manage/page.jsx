'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  societies,
  ieeeSocieties,
  ieeeSocietiesShort,
  clubs,
  clubsShort,
} from '../../public/data/data';
import {
  Box,
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
  Stack,
} from '@mui/material';
import {
  Users,
  Pencil,
  MagnifyingGlass,
  FloppyDisk,
  Trash,
  Key,
  ArrowClockwise,
  CheckCircle,
} from '@phosphor-icons/react';
import { colors } from '@/lib/colors.config.js';

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress size={40} />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  const currUser = session?.user?.isSuperAdmin;
  if (currUser === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <Alert severity='error' sx={{ fontSize: '1.5rem', p: 4 }}>
          Not Authorized !!
        </Alert>
      </Box>
    );
  }

  const renderConditionalFields = () => {
    const fields = [];

    // College Name field
    if (['staff', 'HOD', 'student', 'admin'].includes(userType)) {
      fields.push(
        <FormControl fullWidth error={!!errors.collegeName} key='college'>
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
      );
    }

    // Professional Societies field
    if (userType === 'professionalsocieties') {
      fields.push(
        <FormControl fullWidth error={!!errors.dept} key='societies'>
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
      );
    }

    // IEEE Society Name field
    if (
      userType === 'professionalsocieties' &&
      (dept === 'IEEE' || ieeeSocieties.includes(dept))
    ) {
      fields.push(
        <FormControl fullWidth error={!!errors.currSoc} key='ieee'>
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
      );
    }

    // Department fields for SIT
    if (
      ['HOD', 'staff', 'student'].includes(userType) &&
      collegeName === 'SIT'
    ) {
      fields.push(
        <FormControl fullWidth error={!!errors.dept} key='sit-dept'>
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
      );
    }

    // Department fields for SEC
    if (
      ['HOD', 'staff', 'student'].includes(userType) &&
      collegeName === 'SEC'
    ) {
      fields.push(
        <FormControl fullWidth error={!!errors.dept} key='sec-dept'>
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
      );
    }

    // Clubs field
    if (userType === 'clubincharge') {
      fields.push(
        <FormControl fullWidth error={!!errors.dept} key='clubs'>
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
      );
    }

    return fields;
  };

  return (
    <Box
      sx={{
        bgcolor: colors.light.secondaryHex,
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          sx={{
            fontWeight: 'bold',
            color: colors.light.primaryHex,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          User Management
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mt: 1, fontSize: '1.1rem' }}
        >
          Add new users or manage existing user accounts
        </Typography>
      </Box>

      <Paper
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant='fullWidth'
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
          }}
        >
          <Tab
            icon={<Users size={20} />}
            label='Add User'
            iconPosition='start'
          />
          <Tab
            icon={<Pencil size={20} />}
            label='Edit User'
            iconPosition='start'
          />
        </Tabs>
      </Paper>

      {/* Add User Tab Content */}
      {activeTab === 0 && (
        <Card
          sx={{
            bgcolor: colors.light.cardHex,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              variant='h5'
              component='h2'
              gutterBottom
              sx={{
                mb: 3,
                fontWeight: 'bold',
                color: colors.light.primaryHex,
              }}
            >
              Add New User
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label='Name'
                value={name}
                onChange={e => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

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

              {renderConditionalFields()}

              <TextField
                fullWidth
                label='Email'
                type='email'
                value={mail}
                onChange={e => setMail(e.target.value)}
                error={!!errors.mail}
                helperText={errors.mail}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label='Password'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSuperAdmin}
                    onChange={e => setIsSuperAdmin(e.target.checked)}
                    sx={{
                      color: colors.light.primaryHex,
                      '&.Mui-checked': {
                        color: colors.light.primaryHex,
                      },
                    }}
                  />
                }
                label='Super Admin'
              />

              <Box>
                <Stack direction='row' spacing={2} flexWrap='wrap'>
                  <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <FloppyDisk size={20} />
                      )
                    }
                    sx={{
                      bgcolor: colors.light.primaryHex,
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: colors.light.primaryHex,
                        opacity: 0.9,
                      },
                      '&:disabled': {
                        bgcolor: colors.light.mutedHex,
                        color: colors.light.mutedForegroundHex,
                      },
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {loading ? 'Adding...' : 'Add User'}
                  </Button>
                  <Button
                    variant='outlined'
                    onClick={clearForm}
                    startIcon={<ArrowClockwise size={20} />}
                    sx={{
                      borderColor: colors.light.borderHex,
                      color: colors.light.primaryHex,
                      '&:hover': {
                        borderColor: colors.light.primaryHex,
                        bgcolor: colors.light.mutedHex,
                      },
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Clear Form
                  </Button>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Edit User Tab Content */}
      {activeTab === 1 && (
        <Card
          sx={{
            bgcolor: colors.light.cardHex,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              variant='h5'
              component='h2'
              gutterBottom
              sx={{
                mb: 3,
                fontWeight: 'bold',
                color: colors.light.primaryHex,
              }}
            >
              Edit Existing User
            </Typography>

            {/* Fetch User Section */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                bgcolor: colors.light.mutedHex,
                borderRadius: 2,
              }}
            >
              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Find User
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label='Email Address'
                  type='email'
                  value={fetchEMail}
                  onChange={e => setFetchEmail(e.target.value)}
                  placeholder="Enter user's email address"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant='contained'
                  onClick={handleFetch}
                  disabled={loading || !fetchEMail.trim()}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <MagnifyingGlass size={20} />
                    )
                  }
                  fullWidth
                  sx={{
                    bgcolor: colors.light.primaryHex,
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: colors.light.primaryHex,
                      opacity: 0.9,
                    },
                    '&:disabled': {
                      bgcolor: colors.light.mutedHex,
                      color: colors.light.mutedForegroundHex,
                    },
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Searching...' : 'Fetch User'}
                </Button>
              </Box>
            </Paper>

            {/* User Details Form */}
            {userFetched && (
              <Box>
                <Alert
                  severity='success'
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: '#4caf5020',
                    borderColor: '#4caf50',
                  }}
                  icon={<CheckCircle size={20} />}
                >
                  <Typography>
                    User found! You can now edit their details below.
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label='User Name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label='Email Address'
                    type='email'
                    value={mail}
                    disabled
                    helperText='Email cannot be changed'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: colors.light.mutedHex + '15',
                      },
                    }}
                  />

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

                  {renderConditionalFields()}

                  <TextField
                    fullWidth
                    label='ID Number'
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label='Role'
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label='Phone Number'
                    type='tel'
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSuperAdmin}
                        onChange={e => setIsSuperAdmin(e.target.checked)}
                        sx={{
                          color: colors.light.primaryHex,
                          '&.Mui-checked': {
                            color: colors.light.primaryHex,
                          },
                        }}
                      />
                    }
                    label='Is Super Admin?'
                  />

                  <Box>
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
                            <FloppyDisk size={20} />
                          )
                        }
                        sx={{
                          bgcolor: colors.light.primaryHex,
                          color: '#ffffff',
                          '&:hover': {
                            bgcolor: colors.light.primaryHex,
                            opacity: 0.9,
                          },
                          '&:disabled': {
                            bgcolor: colors.light.mutedHex,
                            color: colors.light.mutedForegroundHex,
                          },
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {loading ? 'Updating...' : 'Update User'}
                      </Button>
                      <Button
                        variant='outlined'
                        color='error'
                        onClick={handleDelete}
                        disabled={loading}
                        startIcon={<Trash size={20} />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Delete User
                      </Button>
                      <Button
                        variant='outlined'
                        color='warning'
                        onClick={handleChangePassword}
                        disabled={loading}
                        startIcon={<Key size={20} />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant='outlined'
                        onClick={clearForm}
                        startIcon={<ArrowClockwise size={20} />}
                        sx={{
                          borderColor: colors.light.borderHex,
                          color: colors.light.primaryHex,
                          '&:hover': {
                            borderColor: colors.light.primaryHex,
                            bgcolor: colors.light.mutedHex,
                          },
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Clear Form
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
